-- Security Fix 1: Update has_role_simple to include organization scoping
CREATE OR REPLACE FUNCTION public.has_role_simple(_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
      AND role = _role 
      AND is_active = true
      AND organization_id = public.get_current_user_org_id()
  );
$$;

-- Security Fix 2: Update assign_user_role_secure to use org-scoped role checks
CREATE OR REPLACE FUNCTION public.assign_user_role_secure(_target_user_id uuid, _role app_role, _reason text DEFAULT NULL::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  _current_user_id UUID;
  _current_user_org_id UUID;
  _target_user_org_id UUID;
  _can_assign BOOLEAN := false;
  _audit_details JSONB;
BEGIN
  -- Get current user
  _current_user_id := auth.uid();
  IF _current_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get current user's organization
  SELECT organization_id INTO _current_user_org_id 
  FROM public.employee_info 
  WHERE user_id = _current_user_id;

  IF _current_user_org_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not in any organization');
  END IF;

  -- Get target user's organization
  SELECT organization_id INTO _target_user_org_id 
  FROM public.employee_info 
  WHERE user_id = _target_user_id;

  -- Validate same organization
  IF _current_user_org_id != _target_user_org_id THEN
    -- Log security violation
    INSERT INTO public.security_audit_log (
      user_id, organization_id, event_type, event_details, success
    ) VALUES (
      _current_user_id, _current_user_org_id, 'role_assignment_cross_org_attempt',
      jsonb_build_object(
        'target_user_id', _target_user_id,
        'attempted_role', _role,
        'reason', _reason
      ), false
    );
    
    RETURN jsonb_build_object('success', false, 'error', 'Cannot assign roles across organizations');
  END IF;

  -- Check permissions using org-scoped role functions
  CASE _role
    WHEN 'admin' THEN
      _can_assign := public.has_role('admin');
    WHEN 'director' THEN
      _can_assign := public.has_role('admin') OR public.has_role('director');
    WHEN 'manager', 'supervisor', 'employee' THEN
      _can_assign := public.has_role('admin') OR 
                    public.has_role('director') OR 
                    public.has_role('manager');
    ELSE
      _can_assign := false;
  END CASE;

  IF NOT _can_assign THEN
    -- Log unauthorized attempt
    INSERT INTO public.security_audit_log (
      user_id, organization_id, event_type, event_details, success
    ) VALUES (
      _current_user_id, _current_user_org_id, 'unauthorized_role_assignment_attempt',
      jsonb_build_object(
        'target_user_id', _target_user_id,
        'attempted_role', _role,
        'reason', _reason
      ), false
    );
    
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient permissions to assign this role');
  END IF;

  -- Deactivate existing roles for the user
  UPDATE public.user_roles 
  SET is_active = false 
  WHERE user_id = _target_user_id AND organization_id = _current_user_org_id;

  -- Insert new role
  INSERT INTO public.user_roles (user_id, role, organization_id, is_active)
  VALUES (_target_user_id, _role, _current_user_org_id, true);

  -- Prepare audit details
  _audit_details := jsonb_build_object(
    'target_user_id', _target_user_id,
    'assigned_role', _role,
    'reason', _reason,
    'assigned_by', _current_user_id
  );

  -- Log successful role assignment
  INSERT INTO public.security_audit_log (
    user_id, organization_id, event_type, event_details, success
  ) VALUES (
    _current_user_id, _current_user_org_id, 'role_assignment_success', _audit_details, true
  );

  RETURN jsonb_build_object('success', true, 'message', 'Role assigned successfully');
EXCEPTION WHEN OTHERS THEN
  -- Log the error
  INSERT INTO public.security_audit_log (
    user_id, organization_id, event_type, event_details, success
  ) VALUES (
    _current_user_id, _current_user_org_id, 'role_assignment_error',
    jsonb_build_object('error', SQLERRM, 'target_user_id', _target_user_id, 'attempted_role', _role), false
  );
  
  RETURN jsonb_build_object('success', false, 'error', 'Internal error occurred');
END;
$$;

-- Security Fix 3: Create secure employee invitations table
CREATE TABLE public.employee_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  email text NOT NULL,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'base64url'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days')
);

-- Enable RLS on employee_invitations
ALTER TABLE public.employee_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for employee_invitations
CREATE POLICY "Admins can manage invitations in their org" 
ON public.employee_invitations 
FOR ALL 
USING (has_role('admin') AND organization_id = get_current_user_org_id());

CREATE POLICY "Public can view invitations for claiming" 
ON public.employee_invitations 
FOR SELECT 
USING (status = 'pending' AND expires_at > now());

-- Security Fix 3: Update create_employee_invitation function
CREATE OR REPLACE FUNCTION public.create_employee_invitation(_email text, _first_name text, _last_name text, _job_title text, _department_id uuid DEFAULT NULL::uuid, _division_id uuid DEFAULT NULL::uuid, _role_id text DEFAULT NULL::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  _org_id uuid;
  _profile_id uuid;
  _employee_id uuid;
  _invitation_token text;
BEGIN
  -- Get current user's organization
  _org_id := public.get_current_user_org_id();
  
  IF _org_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not in any organization');
  END IF;

  -- Validate department/division belong to organization
  IF _department_id IS NOT NULL THEN
    IF NOT EXISTS(SELECT 1 FROM public.departments WHERE id = _department_id AND organization_id = _org_id) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Department not found in organization');
    END IF;
  END IF;

  IF _division_id IS NOT NULL THEN
    IF NOT EXISTS(SELECT 1 FROM public.divisions WHERE id = _division_id AND organization_id = _org_id) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Division not found in organization');
    END IF;
  END IF;

  -- Create profile entry for invited user
  INSERT INTO public.profiles (first_name, last_name, email, user_id)
  VALUES (_first_name, _last_name, _email, NULL)
  RETURNING id INTO _profile_id;

  -- Create employee info for invited user
  INSERT INTO public.employee_info (
    job_title, department_id, division_id, organization_id, status, user_id
  ) VALUES (
    _job_title, _department_id, _division_id, _org_id, 'invited', NULL
  ) RETURNING id INTO _employee_id;

  -- Create secure invitation
  INSERT INTO public.employee_invitations (
    employee_id, organization_id, email
  ) VALUES (
    _employee_id, _org_id, _email
  ) RETURNING token INTO _invitation_token;

  RETURN jsonb_build_object(
    'success', true, 
    'employee_id', _employee_id,
    'profile_id', _profile_id,
    'invitation_token', _invitation_token
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Security Fix 3: Create secure claim_employee_invitation function
CREATE OR REPLACE FUNCTION public.claim_employee_invitation(_token text, _user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  _invitation_record RECORD;
  _employee_record RECORD;
  _profile_record RECORD;
BEGIN
  -- Find and validate invitation
  SELECT * INTO _invitation_record
  FROM public.employee_invitations
  WHERE token = _token 
    AND status = 'pending' 
    AND expires_at > now();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation token');
  END IF;

  -- Find employee_info record
  SELECT * INTO _employee_record
  FROM public.employee_info
  WHERE id = _invitation_record.employee_id
    AND status = 'invited' 
    AND user_id IS NULL;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Employee record not found or already claimed');
  END IF;

  -- Find profile record
  SELECT * INTO _profile_record
  FROM public.profiles
  WHERE email = _invitation_record.email 
    AND user_id IS NULL;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Profile not found or already claimed');
  END IF;

  -- Update employee_info with user_id
  UPDATE public.employee_info
  SET user_id = _user_id, status = 'active'
  WHERE id = _employee_record.id;

  -- Update profile with user_id
  UPDATE public.profiles
  SET user_id = _user_id
  WHERE id = _profile_record.id;

  -- Mark invitation as accepted
  UPDATE public.employee_invitations
  SET status = 'accepted'
  WHERE id = _invitation_record.id;

  -- Log successful claim
  INSERT INTO public.security_audit_log (
    user_id, organization_id, event_type, event_details, success
  ) VALUES (
    _user_id, _invitation_record.organization_id, 'invitation_claimed',
    jsonb_build_object('employee_id', _employee_record.id, 'email', _invitation_record.email), true
  );

  RETURN jsonb_build_object('success', true, 'organization_id', _invitation_record.organization_id);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Security Fix 4: Create trigger to harden audit log writes
CREATE OR REPLACE FUNCTION public.harden_audit_log_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Always set user_id and organization_id from auth context
  NEW.user_id := COALESCE(NEW.user_id, auth.uid());
  NEW.organization_id := COALESCE(NEW.organization_id, public.get_current_user_org_id());
  NEW.ip_address := COALESCE(NEW.ip_address, inet_client_addr());
  
  RETURN NEW;
END;
$$;

-- Apply the trigger
CREATE TRIGGER harden_audit_log_before_insert
  BEFORE INSERT ON public.security_audit_log
  FOR EACH ROW EXECUTE FUNCTION public.harden_audit_log_insert();

-- Update RLS policy for security_audit_log INSERT
DROP POLICY IF EXISTS "System can insert audit logs" ON public.security_audit_log;
CREATE POLICY "Authenticated users can insert audit logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Security Fix 5: Update handle_new_user to remove unsafe admin auto-assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Create profile from user metadata
  INSERT INTO public.profiles (
    user_id,
    first_name,
    last_name,
    email
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email
  );

  -- Log user creation but don't auto-assign roles
  INSERT INTO public.security_audit_log (
    user_id, event_type, event_details, success
  ) VALUES (
    NEW.id, 'user_created',
    jsonb_build_object('email', NEW.email, 'confirmed', NEW.email_confirmed_at IS NOT NULL), true
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't block user creation
  INSERT INTO public.security_audit_log (
    user_id, event_type, event_details, success
  ) VALUES (
    NEW.id, 'user_creation_error',
    jsonb_build_object('error', SQLERRM, 'email', NEW.email), false
  );
  
  -- Return NEW to allow user creation to continue
  RETURN NEW;
END;
$$;