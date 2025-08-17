-- Fix search path for refresh_tenant_analytics function
DROP FUNCTION IF EXISTS public.refresh_tenant_analytics();

CREATE OR REPLACE FUNCTION public.refresh_tenant_analytics()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  REFRESH MATERIALIZED VIEW public.tenant_analytics_summary;
$$;

-- Hide materialized view from API by revoking permissions
REVOKE ALL ON public.tenant_analytics_summary FROM authenticated, anon;

-- Grant only to admins via secure function instead
CREATE OR REPLACE FUNCTION public.get_tenant_analytics(_org_id uuid DEFAULT get_current_user_org_id())
RETURNS TABLE(
  organization_id uuid,
  total_users bigint,
  users_with_failures bigint,
  total_failures bigint,
  cross_org_attempts bigint,
  last_activity timestamp with time zone,
  activity_date date
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    tas.organization_id,
    tas.total_users,
    tas.users_with_failures,
    tas.total_failures,
    tas.cross_org_attempts,
    tas.last_activity,
    tas.activity_date::date
  FROM public.tenant_analytics_summary tas
  WHERE tas.organization_id = _org_id
    AND public.has_role('admin');
$$;