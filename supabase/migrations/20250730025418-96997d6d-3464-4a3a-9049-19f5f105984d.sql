-- Phase 1: Critical Security Fixes

-- 1. Create audit log table for security events
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_details JSONB,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Index for efficient organization filtering
CREATE INDEX idx_security_audit_log_organization_id
  ON public.security_audit_log(organization_id);

-- Only admins can view audit logs within their organization
CREATE POLICY "Admins can view security audit logs in their organization" 
ON public.security_audit_log 
FOR SELECT 
USING (has_role('admin') AND organization_id = get_current_user_org_id());

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (true);

-- 2. Create email verification tokens table
CREATE TABLE IF NOT EXISTS public.email_verification_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on verification tokens
ALTER TABLE public.email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- Only system can manage verification tokens (no user access)
CREATE POLICY "System only access to verification tokens" 
ON public.email_verification_tokens 
FOR ALL 
USING (false);

-- 3. Create secure role assignment function
CREATE OR REPLACE FUNCTION public.assign_user_role_secure(
  _target_user_id UUID,
  _role app_role,
  _reason TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

  -- Check permissions based on role hierarchy
  CASE _role
    WHEN 'admin' THEN
      _can_assign := public.has_role(_current_user_id, 'admin');
    WHEN 'director' THEN
      _can_assign := public.has_role(_current_user_id, 'admin') OR public.has_role(_current_user_id, 'director');
    WHEN 'manager', 'supervisor', 'employee' THEN
      _can_assign := public.has_role(_current_user_id, 'admin') OR 
                    public.has_role(_current_user_id, 'director') OR 
                    public.has_role(_current_user_id, 'manager');
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

-- 4. Create function to generate secure verification tokens
CREATE OR REPLACE FUNCTION public.create_email_verification_token(
  _user_id UUID,
  _email TEXT
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _token TEXT;
BEGIN
  -- Generate a secure random token
  _token := encode(gen_random_bytes(32), 'base64url');
  
  -- Insert the token with 24-hour expiry
  INSERT INTO public.email_verification_tokens (user_id, token, email, expires_at)
  VALUES (_user_id, _token, _email, now() + INTERVAL '24 hours');
  
  RETURN _token;
END;
$$;

-- 5. Create function to verify email token
CREATE OR REPLACE FUNCTION public.verify_email_token(
  _token TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _token_record RECORD;
  _user_id UUID;
BEGIN
  -- Get token record
  SELECT * INTO _token_record 
  FROM public.email_verification_tokens 
  WHERE token = _token AND used_at IS NULL;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired token');
  END IF;

  -- Check if expired
  IF _token_record.expires_at < now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Token has expired');
  END IF;

  -- Mark token as used
  UPDATE public.email_verification_tokens 
  SET used_at = now() 
  WHERE id = _token_record.id;

  -- Update user status to active
  UPDATE public.employee_info 
  SET status = 'active'
  WHERE user_id = _token_record.user_id;

  -- Log successful verification
  INSERT INTO public.security_audit_log (
    user_id, event_type, event_details, success
  ) VALUES (
    _token_record.user_id, 'email_verification_success',
    jsonb_build_object('email', _token_record.email), true
  );

  RETURN jsonb_build_object('success', true, 'user_id', _token_record.user_id);
END;
$$;

-- 6. Create trigger for role assignment audit logging
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.security_audit_log (
      user_id, organization_id, event_type, event_details
    ) VALUES (
      NEW.user_id, NEW.organization_id, 'role_granted',
      jsonb_build_object('role', NEW.role, 'active', NEW.is_active)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_active != NEW.is_active THEN
      INSERT INTO public.security_audit_log (
        user_id, organization_id, event_type, event_details
      ) VALUES (
        NEW.user_id, NEW.organization_id, 
        CASE WHEN NEW.is_active THEN 'role_activated' ELSE 'role_deactivated' END,
        jsonb_build_object('role', NEW.role)
      );
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger on user_roles table
DROP TRIGGER IF EXISTS audit_role_changes_trigger ON public.user_roles;
CREATE TRIGGER audit_role_changes_trigger
  AFTER INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_role_changes();

-- 7. Add password history table for enhanced security
CREATE TABLE IF NOT EXISTS public.password_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on password history
ALTER TABLE public.password_history ENABLE ROW LEVEL SECURITY;

-- Only system can manage password history
CREATE POLICY "System only access to password history"
ON public.password_history
FOR ALL
USING (false);
