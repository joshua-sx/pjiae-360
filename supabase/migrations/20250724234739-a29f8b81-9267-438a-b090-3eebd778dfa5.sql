-- Fix RLS policies for enhanced security

-- Add proper DELETE policy for employee_info table
CREATE POLICY "Admins can delete employee info"
ON public.employee_info
FOR DELETE
TO authenticated
USING (
  organization_id = get_user_organization_id() AND
  has_role('admin'::app_role)
);

-- Replace overly permissive ALL policies with specific command policies for audit_log
DROP POLICY IF EXISTS "Users can view audit logs in their organization" ON public.audit_log;

CREATE POLICY "Users can view audit logs in their organization"
ON public.audit_log
FOR SELECT
TO authenticated
USING (
  organization_id = get_user_organization_id() AND
  (has_role('admin'::app_role) OR has_role('director'::app_role))
);

-- Add rate limiting for audit log queries (limit to 100 records per query)
CREATE OR REPLACE FUNCTION public.get_audit_history_limited(_table_name text, _record_id uuid, _limit integer DEFAULT 50)
RETURNS TABLE(id uuid, action text, old_values jsonb, new_values jsonb, user_id uuid, created_at timestamp with time zone, context jsonb)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Limit maximum records to prevent excessive data export
  IF _limit > 100 THEN
    _limit := 100;
  END IF;
  
  RETURN QUERY
  SELECT 
    al.id,
    al.action,
    al.old_values,
    al.new_values,
    al.user_id,
    al.created_at,
    al.context
  FROM public.audit_log al
  WHERE al.table_name = _table_name
    AND al.record_id = _record_id
    AND al.organization_id = public.get_user_organization_id()
  ORDER BY al.created_at DESC
  LIMIT _limit;
END;
$function$;

-- Replace ALL policies with specific command policies for better security
DROP POLICY IF EXISTS "Organization access" ON public.user_roles;

CREATE POLICY "Users can view user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  organization_id = get_user_organization_id() AND
  deleted_at IS NULL
);

CREATE POLICY "Authorized users can insert user roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  organization_id = get_user_organization_id() AND
  (has_role('admin'::app_role) OR has_role('director'::app_role) OR has_role('manager'::app_role))
);

CREATE POLICY "Authorized users can update user roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (
  organization_id = get_user_organization_id() AND
  (has_role('admin'::app_role) OR has_role('director'::app_role) OR has_role('manager'::app_role))
);

CREATE POLICY "Admins can delete user roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  organization_id = get_user_organization_id() AND
  has_role('admin'::app_role)
);

-- Add security logging function for failed authentication attempts
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid,
  ip_address inet,
  user_agent text,
  details jsonb,
  organization_id uuid,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view security events"
ON public.security_events
FOR SELECT
TO authenticated
USING (
  organization_id = get_user_organization_id() AND
  has_role('admin'::app_role)
);

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  _event_type text,
  _user_id uuid DEFAULT NULL,
  _ip_address inet DEFAULT NULL,
  _user_agent text DEFAULT NULL,
  _details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  _org_id uuid;
BEGIN
  -- Get organization ID from user if provided
  IF _user_id IS NOT NULL THEN
    SELECT organization_id INTO _org_id
    FROM public.employee_info
    WHERE user_id = _user_id;
  ELSE
    _org_id := get_user_organization_id();
  END IF;

  INSERT INTO public.security_events (
    event_type,
    user_id,
    ip_address,
    user_agent,
    details,
    organization_id
  ) VALUES (
    _event_type,
    _user_id,
    _ip_address,
    _user_agent,
    _details,
    _org_id
  );
END;
$function$;