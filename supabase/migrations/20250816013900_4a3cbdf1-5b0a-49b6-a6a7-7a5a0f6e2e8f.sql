-- Phase 2: Security Hardening - RLS Policy Updates

-- Update profiles table RLS for better security
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Enhanced profiles policies with organization scoping
CREATE POLICY "Users can view profiles in their organization" 
ON public.profiles 
FOR SELECT 
USING (
  user_id = auth.uid() 
  OR has_role_simple('admin'::app_role) 
  OR has_role_simple('director'::app_role) 
  OR has_role_simple('manager'::app_role) 
  OR EXISTS (
    SELECT 1 FROM public.employee_info ei1, public.employee_info ei2
    WHERE ei1.user_id = auth.uid() 
      AND ei2.user_id = profiles.user_id 
      AND ei1.organization_id = ei2.organization_id
  )
);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Update security_audit_log table for better access control
DROP POLICY IF EXISTS "Admins can view security audit logs in their organization" ON public.security_audit_log;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.security_audit_log;

CREATE POLICY "Admins can view security audit logs in their organization" 
ON public.security_audit_log 
FOR SELECT 
USING (
  has_role('admin'::app_role) 
  AND (organization_id = get_current_user_org_id() OR organization_id IS NULL)
);

CREATE POLICY "System can insert audit logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Ensure password_history remains system-only
DROP POLICY IF EXISTS "System only access to password history" ON public.password_history;

CREATE POLICY "System only access to password history" 
ON public.password_history 
FOR ALL 
USING (false)
WITH CHECK (false);

-- Add function for secure audit logging from edge functions
CREATE OR REPLACE FUNCTION public.log_security_event_server(
  _event_type text,
  _user_id uuid DEFAULT NULL,
  _organization_id uuid DEFAULT NULL,
  _event_details jsonb DEFAULT '{}'::jsonb,
  _success boolean DEFAULT true,
  _ip_address inet DEFAULT NULL,
  _user_agent text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _log_id uuid;
BEGIN
  INSERT INTO public.security_audit_log (
    event_type,
    user_id,
    organization_id,
    event_details,
    success,
    ip_address,
    user_agent
  ) VALUES (
    _event_type,
    _user_id,
    _organization_id,
    _event_details,
    _success,
    _ip_address,
    _user_agent
  ) RETURNING id INTO _log_id;
  
  RETURN _log_id;
END;
$$;