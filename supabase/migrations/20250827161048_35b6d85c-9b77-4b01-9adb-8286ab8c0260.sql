-- Add signature flow fields to appraisals table
ALTER TABLE public.appraisals 
ADD COLUMN IF NOT EXISTS signature_stage text NOT NULL DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS current_signer_role text,
ADD COLUMN IF NOT EXISTS first_appraiser_id uuid,
ADD COLUMN IF NOT EXISTS second_appraiser_id uuid;

-- Add check constraint for signature stages
ALTER TABLE public.appraisals 
DROP CONSTRAINT IF EXISTS appraisals_signature_stage_check;

ALTER TABLE public.appraisals 
ADD CONSTRAINT appraisals_signature_stage_check 
CHECK (signature_stage IN ('draft', 'pending_first_appraiser', 'pending_second_appraiser', 'pending_employee', 'complete'));

-- Create function to sign appraisal with proper validation
CREATE OR REPLACE FUNCTION public.sign_appraisal(
  _appraisal_id uuid,
  _signature_data text,
  _role text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _current_user_id uuid;
  _appraisal_record RECORD;
  _expected_role text;
  _next_stage text;
  _current_employee_id uuid;
BEGIN
  _current_user_id := auth.uid();
  
  IF _current_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
  END IF;

  -- Get appraisal details with employee info
  SELECT a.*, ei.user_id as employee_user_id 
  INTO _appraisal_record
  FROM public.appraisals a
  LEFT JOIN public.employee_info ei ON ei.id = a.employee_id
  WHERE a.id = _appraisal_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Appraisal not found');
  END IF;

  -- Determine expected role and validate permissions
  CASE _appraisal_record.signature_stage
    WHEN 'pending_first_appraiser' THEN
      _expected_role := 'first_appraiser';
      -- Validate user is the creator (first appraiser)
      IF _current_user_id != _appraisal_record.created_by THEN
        RETURN jsonb_build_object('success', false, 'error', 'Only the creating appraiser can sign at this stage');
      END IF;
      _next_stage := 'pending_second_appraiser';
      
    WHEN 'pending_second_appraiser' THEN
      _expected_role := 'second_appraiser';
      -- Validate user is assigned second appraiser
      IF NOT EXISTS(
        SELECT 1 FROM public.appraisal_appraisers aa
        LEFT JOIN public.employee_info ei ON ei.id = aa.appraiser_id
        WHERE aa.appraisal_id = _appraisal_id 
          AND aa.role = 'secondary' 
          AND ei.user_id = _current_user_id
      ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Only the assigned second appraiser can sign at this stage');
      END IF;
      _next_stage := 'pending_employee';
      
    WHEN 'pending_employee' THEN
      _expected_role := 'employee';
      -- Validate user is the employee
      IF _current_user_id != _appraisal_record.employee_user_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Only the employee can sign at this stage');
      END IF;
      _next_stage := 'complete';
      
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'Appraisal is not in a signable state');
  END CASE;

  -- Insert signature record
  INSERT INTO public.signatures (
    appraisal_id, 
    user_id, 
    role, 
    signature_data,
    ip_address,
    user_agent
  ) VALUES (
    _appraisal_id,
    _current_user_id,
    _expected_role,
    _signature_data,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );

  -- Update appraisal stage
  UPDATE public.appraisals 
  SET 
    signature_stage = _next_stage,
    current_signer_role = CASE WHEN _next_stage = 'complete' THEN NULL ELSE 
      CASE _next_stage
        WHEN 'pending_second_appraiser' THEN 'second_appraiser'
        WHEN 'pending_employee' THEN 'employee'
        ELSE NULL
      END
    END,
    status = CASE WHEN _next_stage = 'complete' THEN 'complete'::appraisal_status ELSE status END,
    updated_at = now()
  WHERE id = _appraisal_id;

  -- Log audit event
  INSERT INTO public.security_audit_log (
    user_id, organization_id, event_type, event_details, success
  ) VALUES (
    _current_user_id, 
    _appraisal_record.organization_id, 
    'appraisal_signed',
    jsonb_build_object(
      'appraisal_id', _appraisal_id,
      'role', _expected_role,
      'stage_transition', _appraisal_record.signature_stage || ' -> ' || _next_stage
    ), 
    true
  );

  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Signature recorded successfully',
    'next_stage', _next_stage,
    'role_signed', _expected_role
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', 'Internal error: ' || SQLERRM);
END;
$$;

-- Function to finalize appraisal (submit for signatures)
CREATE OR REPLACE FUNCTION public.finalize_appraisal(
  _appraisal_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _current_user_id uuid;
  _appraisal_record RECORD;
BEGIN
  _current_user_id := auth.uid();
  
  IF _current_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
  END IF;

  -- Get appraisal details
  SELECT * INTO _appraisal_record
  FROM public.appraisals 
  WHERE id = _appraisal_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Appraisal not found');
  END IF;

  -- Validate user is the creator/manager
  IF _current_user_id != _appraisal_record.created_by AND NOT has_role('admin'::app_role) AND NOT has_role('manager'::app_role) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient permissions to finalize appraisal');
  END IF;

  -- Validate appraisal is in draft stage
  IF _appraisal_record.signature_stage != 'draft' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Appraisal is not in draft stage');
  END IF;

  -- Update to pending first appraiser signature
  UPDATE public.appraisals 
  SET 
    signature_stage = 'pending_first_appraiser',
    current_signer_role = 'first_appraiser',
    status = 'with_second_appraiser'::appraisal_status,
    updated_at = now()
  WHERE id = _appraisal_id;

  -- Log audit event
  INSERT INTO public.security_audit_log (
    user_id, organization_id, event_type, event_details, success
  ) VALUES (
    _current_user_id, 
    _appraisal_record.organization_id, 
    'appraisal_finalized',
    jsonb_build_object('appraisal_id', _appraisal_id), 
    true
  );

  RETURN jsonb_build_object('success', true, 'message', 'Appraisal submitted for signatures');
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', 'Internal error: ' || SQLERRM);
END;
$$;