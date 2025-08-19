-- Create verification tokens table for secure post-signup access
CREATE TABLE public.verification_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE DEFAULT encode(extensions.gen_random_bytes(32), 'base64url'),
  intended_role app_role NOT NULL DEFAULT 'employee',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 hour'),
  used_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET NULL,
  user_agent TEXT NULL
);

-- Enable RLS
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "System can manage verification tokens" 
ON public.verification_tokens 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_verification_tokens_token ON public.verification_tokens(token);
CREATE INDEX idx_verification_tokens_user_id ON public.verification_tokens(user_id);
CREATE INDEX idx_verification_tokens_expires_at ON public.verification_tokens(expires_at);

-- Create function to validate and consume verification token
CREATE OR REPLACE FUNCTION public.validate_verification_token(_token TEXT)
RETURNS TABLE(
  is_valid BOOLEAN,
  user_id UUID,
  organization_id UUID,
  email TEXT,
  intended_role app_role,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  _token_record RECORD;
BEGIN
  -- Find the token
  SELECT * INTO _token_record
  FROM public.verification_tokens
  WHERE token = _token
  LIMIT 1;

  -- Check if token exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, null::uuid, null::uuid, null::text, null::app_role, 'Invalid verification token'::text;
    RETURN;
  END IF;

  -- Check if token is already used
  IF _token_record.used_at IS NOT NULL THEN
    RETURN QUERY SELECT false, null::uuid, null::uuid, null::text, null::app_role, 'Verification token has already been used'::text;
    RETURN;
  END IF;

  -- Check if token is expired
  IF _token_record.expires_at < now() THEN
    RETURN QUERY SELECT false, null::uuid, null::uuid, null::text, null::app_role, 'Verification token has expired'::text;
    RETURN;
  END IF;

  -- Mark token as used
  UPDATE public.verification_tokens
  SET used_at = now()
  WHERE token = _token;

  -- Return valid token data
  RETURN QUERY SELECT 
    true,
    _token_record.user_id,
    _token_record.organization_id,
    _token_record.email,
    _token_record.intended_role,
    null::text;
END;
$function$;

-- Create function to activate user membership
CREATE OR REPLACE FUNCTION public.activate_user_membership(
  _user_id UUID,
  _organization_id UUID,
  _intended_role app_role
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  _employee_record RECORD;
BEGIN
  -- Check if user already has employee_info for this organization
  SELECT * INTO _employee_record
  FROM public.employee_info
  WHERE user_id = _user_id AND organization_id = _organization_id
  LIMIT 1;

  IF FOUND THEN
    -- Update existing employee_info to active status
    UPDATE public.employee_info
    SET status = 'active', updated_at = now()
    WHERE user_id = _user_id AND organization_id = _organization_id;
  ELSE
    -- Create new employee_info record
    INSERT INTO public.employee_info (user_id, organization_id, status)
    VALUES (_user_id, _organization_id, 'active');
  END IF;

  -- Deactivate any existing roles for this user in this organization
  UPDATE public.user_roles
  SET is_active = false
  WHERE user_id = _user_id AND organization_id = _organization_id;

  -- Assign the intended role
  INSERT INTO public.user_roles (user_id, role, organization_id, is_active)
  VALUES (_user_id, _intended_role, _organization_id, true)
  ON CONFLICT (user_id, role, organization_id) 
  DO UPDATE SET is_active = true;

  -- Log the activation
  INSERT INTO public.security_audit_log (
    user_id, organization_id, event_type, event_details, success
  ) VALUES (
    _user_id, _organization_id, 'membership_activated',
    jsonb_build_object('role', _intended_role, 'method', 'email_verification'), true
  );

  RETURN jsonb_build_object('success', true, 'role', _intended_role);
EXCEPTION WHEN OTHERS THEN
  -- Log error
  INSERT INTO public.security_audit_log (
    user_id, organization_id, event_type, event_details, success
  ) VALUES (
    _user_id, _organization_id, 'membership_activation_error',
    jsonb_build_object('error', SQLERRM, 'intended_role', _intended_role), false
  );
  
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$function$;

-- Create function to check if user has completed onboarding
CREATE OR REPLACE FUNCTION public.check_onboarding_status(_user_id UUID)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT jsonb_build_object(
    'completed', CASE 
      WHEN ei.status = 'active' AND ei.job_title IS NOT NULL THEN true
      ELSE false
    END,
    'is_admin', CASE 
      WHEN EXISTS(
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = _user_id 
        AND ur.role IN ('admin', 'director') 
        AND ur.is_active = true
      ) THEN true
      ELSE false
    END
  )
  FROM public.employee_info ei
  WHERE ei.user_id = _user_id
  LIMIT 1;
$function$;