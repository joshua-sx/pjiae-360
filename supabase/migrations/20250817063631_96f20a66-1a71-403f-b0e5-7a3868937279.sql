-- Create leading organization_id indexes for performance (without CONCURRENTLY due to transaction limitations)
CREATE INDEX IF NOT EXISTS idx_employee_info_org_id_performance 
ON public.employee_info(organization_id, user_id, status);

CREATE INDEX IF NOT EXISTS idx_goals_org_id_performance 
ON public.goals(organization_id, created_by, status, due_date);

CREATE INDEX IF NOT EXISTS idx_appraisals_org_id_performance 
ON public.appraisals(organization_id, employee_id, cycle_id, status);

CREATE INDEX IF NOT EXISTS idx_security_audit_log_org_id_performance 
ON public.security_audit_log(organization_id, created_at DESC, event_type);

-- Create materialized view for tenant analytics (refreshed periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.tenant_analytics_summary AS
SELECT 
  organization_id,
  COUNT(DISTINCT user_id) as total_users,
  COUNT(DISTINCT CASE WHEN success = false THEN user_id END) as users_with_failures,
  COUNT(*) FILTER (WHERE success = false) as total_failures,
  COUNT(*) FILTER (WHERE event_type = 'cross_organization_access_attempt') as cross_org_attempts,
  MAX(created_at) as last_activity,
  DATE_TRUNC('day', created_at) as activity_date
FROM public.security_audit_log 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY organization_id, DATE_TRUNC('day', created_at);

-- Create index on the materialized view
CREATE INDEX IF NOT EXISTS idx_tenant_analytics_org_date 
ON public.tenant_analytics_summary(organization_id, activity_date DESC);

-- Function to refresh analytics (to be called periodically)
CREATE OR REPLACE FUNCTION public.refresh_tenant_analytics()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  REFRESH MATERIALIZED VIEW public.tenant_analytics_summary;
$$;