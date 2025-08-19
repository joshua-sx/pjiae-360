
-- 1) Indexes to support fast perf event queries from security_audit_log
CREATE INDEX IF NOT EXISTS idx_security_audit_log_event_created
  ON public.security_audit_log (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_audit_log_perf_created
  ON public.security_audit_log (created_at DESC)
  WHERE event_type = 'perf_query';

-- Optional JSONB GIN index (useful if you’ll filter by event_details keys frequently)
-- CREATE INDEX IF NOT EXISTS idx_security_audit_log_event_details_gin
--   ON public.security_audit_log USING GIN (event_details);

-- 2) Standardized performance logging RPC
CREATE OR REPLACE FUNCTION public.log_query_performance(
  _name text,
  _duration_ms integer,
  _extra jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  _log_id uuid;
BEGIN
  _log_id := public.log_security_event_server(
    'perf_query',
    auth.uid(),
    public.get_current_user_org_id(),
    jsonb_build_object('name', _name, 'duration_ms', _duration_ms) || COALESCE(_extra, '{}'::jsonb),
    true,
    NULL,
    NULL
  );
  RETURN _log_id;
END;
$function$;

-- 3) View to easily inspect perf events
CREATE OR REPLACE VIEW public.perf_query_events AS
SELECT
  sal.id,
  sal.created_at,
  sal.user_id,
  sal.organization_id,
  sal.event_type,
  (sal.event_details->>'name') AS name,
  NULLIF(sal.event_details->>'duration_ms','')::integer AS duration_ms,
  sal.event_details
FROM public.security_audit_log sal
WHERE sal.event_type = 'perf_query';

-- 4) Summary function with avg, p95, max by name
CREATE OR REPLACE FUNCTION public.get_perf_query_summary(hours_back integer DEFAULT 24)
RETURNS TABLE(
  name text,
  count bigint,
  avg_ms numeric,
  p95_ms numeric,
  max_ms integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT
    (event_details->>'name')::text AS name,
    COUNT(*)::bigint AS count,
    AVG(NULLIF(event_details->>'duration_ms','')::numeric) AS avg_ms,
    PERCENTILE_DISC(0.95) WITHIN GROUP (ORDER BY NULLIF(event_details->>'duration_ms','')::numeric) AS p95_ms,
    MAX(NULLIF(event_details->>'duration_ms','')::int) AS max_ms
  FROM public.security_audit_log
  WHERE event_type = 'perf_query'
    AND created_at >= NOW() - (hours_back || ' hours')::interval
  GROUP BY (event_details->>'name')::text
  ORDER BY count DESC, avg_ms DESC;
$function$;

-- 5) Switch selected helper functions to cached role checks (non-critical first)

-- 5a) get_secure_employee_directory -> use has_role_cached
CREATE OR REPLACE FUNCTION public.get_secure_employee_directory()
RETURNS TABLE(
  employee_id uuid,
  user_id uuid,
  first_name text,
  last_name text,
  full_name text,
  job_title text,
  department_name text,
  division_name text,
  status user_status,
  employment_type text,
  location text,
  organization_id uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT 
    ei.id as employee_id,
    ei.user_id,
    p.first_name,
    p.last_name,
    CASE 
      WHEN p.first_name IS NOT NULL AND p.last_name IS NOT NULL 
      THEN TRIM(p.first_name || ' ' || p.last_name)
      ELSE p.email
    END as full_name,
    ei.job_title,
    d.name as department_name,
    div.name as division_name,
    ei.status,
    ei.employment_type,
    ei.location,
    ei.organization_id
  FROM public.employee_info ei
  LEFT JOIN public.profiles p ON p.user_id = ei.user_id
  LEFT JOIN public.departments d ON d.id = ei.department_id
  LEFT JOIN public.divisions div ON div.id = ei.division_id
  WHERE ei.organization_id = public.get_current_user_org_id()
    AND (
      public.has_role_cached('admin') OR 
      public.has_role_cached('director') OR
      -- Managers see their direct reports only
      (public.has_role_cached('manager') AND ei.manager_id IN (
        SELECT id FROM public.employee_info 
        WHERE user_id = auth.uid() AND organization_id = public.get_current_user_org_id()
      )) OR
      -- Supervisors see same department only  
      (public.has_role_cached('supervisor') AND ei.department_id IN (
        SELECT department_id FROM public.employee_info 
        WHERE user_id = auth.uid() AND organization_id = public.get_current_user_org_id()
      )) OR
      -- Users see themselves only
      ei.user_id = auth.uid()
    );
$function$;

-- 5b) can_view_employee -> use has_role_cached
CREATE OR REPLACE FUNCTION public.can_view_employee(_employee_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS(
    SELECT 1 FROM public.employee_info ei
    WHERE ei.id = _employee_id
      AND ei.organization_id = public.get_current_user_org_id()
      AND (
        -- User can view their own record
        ei.user_id = auth.uid()
        -- HR roles can view all
        OR public.has_role_cached('admin')
        OR public.has_role_cached('director')
        -- Managers can view all for management functions
        OR public.has_role_cached('manager')
        -- Direct manager can view their reports
        OR ei.manager_id IN (
          SELECT id FROM public.employee_info 
          WHERE user_id = auth.uid() AND organization_id = public.get_current_user_org_id()
        )
      )
  );
$function$;

-- 5c) get_tenant_analytics -> use has_role_cached
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
SET search_path TO 'public'
AS $function$
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
    AND public.has_role_cached('admin');
$function$;
