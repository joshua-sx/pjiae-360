-- Create leading organization_id indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_employee_info_org_id_performance 
ON public.employee_info(organization_id, user_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_goals_org_id_performance 
ON public.goals(organization_id, created_by, status, due_date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appraisals_org_id_performance 
ON public.appraisals(organization_id, employee_id, cycle_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_audit_log_org_id_performance 
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

-- Enhanced tenant data export function with full audit trail
CREATE OR REPLACE FUNCTION public.export_tenant_data(_org_id uuid DEFAULT get_current_user_org_id())
RETURNS TABLE(
  table_name text,
  record_count bigint,
  data_json jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _calling_user_id uuid;
  _user_org_id uuid;
BEGIN
  -- Security validation
  _calling_user_id := auth.uid();
  _user_org_id := public.get_current_user_org_id();
  
  IF _calling_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  IF NOT public.has_role('admin') THEN
    RAISE EXCEPTION 'Admin role required for data export';
  END IF;
  
  IF _org_id != _user_org_id THEN
    -- Log cross-org attempt
    INSERT INTO public.security_audit_log (
      user_id, organization_id, event_type, event_details, success
    ) VALUES (
      _calling_user_id, _user_org_id, 'unauthorized_tenant_export_attempt',
      jsonb_build_object('attempted_org_id', _org_id), false
    );
    RAISE EXCEPTION 'Cannot export data for different organization';
  END IF;
  
  -- Log export attempt
  INSERT INTO public.security_audit_log (
    user_id, organization_id, event_type, event_details, success
  ) VALUES (
    _calling_user_id, _org_id, 'tenant_data_export_initiated',
    jsonb_build_object('export_timestamp', NOW()), true
  );
  
  -- Export organization data
  RETURN QUERY SELECT 'organizations'::text, COUNT(*)::bigint, 
    jsonb_agg(to_jsonb(o.*)) FROM public.organizations o WHERE o.id = _org_id;
  
  -- Export employee info
  RETURN QUERY SELECT 'employee_info'::text, COUNT(*)::bigint,
    jsonb_agg(to_jsonb(ei.*)) FROM public.employee_info ei WHERE ei.organization_id = _org_id;
  
  -- Export profiles (for users in this org)
  RETURN QUERY SELECT 'profiles'::text, COUNT(*)::bigint,
    jsonb_agg(to_jsonb(p.*)) FROM public.profiles p 
    WHERE p.user_id IN (SELECT ei.user_id FROM public.employee_info ei WHERE ei.organization_id = _org_id);
  
  -- Export user roles
  RETURN QUERY SELECT 'user_roles'::text, COUNT(*)::bigint,
    jsonb_agg(to_jsonb(ur.*)) FROM public.user_roles ur WHERE ur.organization_id = _org_id;
  
  -- Export goals
  RETURN QUERY SELECT 'goals'::text, COUNT(*)::bigint,
    jsonb_agg(to_jsonb(g.*)) FROM public.goals g WHERE g.organization_id = _org_id;
  
  -- Export appraisals
  RETURN QUERY SELECT 'appraisals'::text, COUNT(*)::bigint,
    jsonb_agg(to_jsonb(a.*)) FROM public.appraisals a WHERE a.organization_id = _org_id;
  
  -- Export security audit logs (last 90 days only for performance)
  RETURN QUERY SELECT 'security_audit_log'::text, COUNT(*)::bigint,
    jsonb_agg(to_jsonb(sal.*)) FROM public.security_audit_log sal 
    WHERE sal.organization_id = _org_id AND sal.created_at >= NOW() - INTERVAL '90 days';
  
  -- Log successful export
  INSERT INTO public.security_audit_log (
    user_id, organization_id, event_type, event_details, success
  ) VALUES (
    _calling_user_id, _org_id, 'tenant_data_export_completed',
    jsonb_build_object('export_timestamp', NOW()), true
  );
END;
$$;