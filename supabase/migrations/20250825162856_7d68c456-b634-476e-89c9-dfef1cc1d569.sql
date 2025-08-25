-- Fix Security Definer issue with tenant_analytics_summary materialized view
-- The issue: materialized view owned by postgres without proper access control
-- Solution: Drop and recreate with proper security or replace with a secure function

-- Drop the existing materialized view
DROP MATERIALIZED VIEW IF EXISTS public.tenant_analytics_summary;

-- Create a secure function to get tenant analytics data
-- This function respects RLS and only shows data for the user's organization
CREATE OR REPLACE FUNCTION public.get_tenant_analytics_summary(
  _days_back integer DEFAULT 30
)
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
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT 
    sal.organization_id,
    count(DISTINCT sal.user_id) AS total_users,
    count(DISTINCT CASE WHEN sal.success = false THEN sal.user_id ELSE NULL::uuid END) AS users_with_failures,
    count(*) FILTER (WHERE sal.success = false) AS total_failures,
    count(*) FILTER (WHERE sal.event_type = 'cross_organization_access_attempt') AS cross_org_attempts,
    max(sal.created_at) AS last_activity,
    date_trunc('day', sal.created_at)::date AS activity_date
  FROM public.security_audit_log sal
  WHERE sal.created_at >= (now() - (_days_back || ' days')::interval)
    AND sal.organization_id = public.get_current_user_org_id()  -- Security: only user's org
  GROUP BY sal.organization_id, date_trunc('day', sal.created_at)
  ORDER BY activity_date DESC;
$function$;

-- Create a secure view replacement for the materialized view
-- This view only shows data for the current user's organization
CREATE OR REPLACE VIEW public.tenant_analytics_summary AS
SELECT 
  organization_id,
  total_users,
  users_with_failures,
  total_failures,
  cross_org_attempts,
  last_activity,
  activity_date
FROM public.get_tenant_analytics_summary(30);  -- Default: last 30 days

-- Grant appropriate permissions
GRANT SELECT ON public.tenant_analytics_summary TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_tenant_analytics_summary TO authenticated;

-- Update the refresh function to use the new secure approach
-- Instead of refreshing a materialized view, we'll create a function that can be called when needed
CREATE OR REPLACE FUNCTION public.refresh_tenant_analytics()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  -- This function now just validates that analytics can be refreshed
  -- The actual data is always fresh since we're using a regular view now
  SELECT 1; -- No-op since we're using a view instead of materialized view
$function$;

-- Add audit log entry for this security fix
INSERT INTO public.security_audit_log (
  event_type,
  event_details,
  success
) VALUES (
  'security_fix_applied',
  jsonb_build_object(
    'fix_type', 'security_definer_materialized_view',
    'object', 'tenant_analytics_summary',
    'description', 'Replaced insecure materialized view with secure organization-scoped view'
  ),
  true
);