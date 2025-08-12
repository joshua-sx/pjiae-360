-- CRITICAL SECURITY FIX: Prevent cross-organization data leakage in role functions

-- 1. Fix get_current_user_roles() to only return roles within user's organization
CREATE OR REPLACE FUNCTION public.get_current_user_roles()
 RETURNS TABLE(role app_role)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT ur.role FROM public.user_roles ur 
  WHERE ur.user_id = auth.uid() 
    AND ur.is_active = true
    AND ur.organization_id = public.get_current_user_org_id();
$function$;

-- 2. Fix has_role() to include organization context validation
CREATE OR REPLACE FUNCTION public.has_role(_role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
      AND role = _role 
      AND is_active = true
      AND organization_id = public.get_current_user_org_id()
  );
$function$;

-- 3. Fix get_effective_permissions_for_user to filter by organization
CREATE OR REPLACE FUNCTION public.get_effective_permissions_for_user(_user_id uuid DEFAULT auth.uid())
 RETURNS text[]
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT COALESCE(array_agg(DISTINCT p.name), ARRAY[]::text[])
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON rp.role = ur.role
  JOIN public.permissions p ON p.id = rp.permission_id
  WHERE ur.user_id = _user_id 
    AND ur.is_active = true
    AND ur.organization_id = public.get_current_user_org_id();
$function$;

-- 4. Fix has_role_at_least to ensure organization context
CREATE OR REPLACE FUNCTION public.has_role_at_least(_role app_role, _user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT COALESCE(MAX(public.get_role_level(ur.role)), 0) >= public.get_role_level(_role)
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id
    AND ur.is_active = true
    AND ur.organization_id = public.get_current_user_org_id();
$function$;

-- 5. Fix user_max_role_level to ensure organization context
CREATE OR REPLACE FUNCTION public.user_max_role_level(_user_id uuid DEFAULT auth.uid())
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT COALESCE(MAX(public.get_role_level(ur.role)), 0)
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id
    AND ur.is_active = true
    AND ur.organization_id = public.get_current_user_org_id();
$function$;

-- 6. Add security audit logging for cross-org access attempts
CREATE OR REPLACE FUNCTION public.log_cross_org_access_attempt(_attempted_org_id uuid, _event_details jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id, 
    organization_id, 
    event_type, 
    event_details, 
    success
  ) VALUES (
    auth.uid(),
    public.get_current_user_org_id(),
    'cross_organization_access_attempt',
    jsonb_build_object(
      'attempted_org_id', _attempted_org_id,
      'user_org_id', public.get_current_user_org_id(),
      'details', _event_details
    ),
    false
  );
END;
$function$;