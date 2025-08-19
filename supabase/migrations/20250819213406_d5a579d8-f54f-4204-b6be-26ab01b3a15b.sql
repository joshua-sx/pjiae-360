
-- Phase 1: RLS performance improvements (composite/partial indexes)

CREATE INDEX IF NOT EXISTS idx_employee_info_user_org 
  ON public.employee_info (user_id, organization_id);

CREATE INDEX IF NOT EXISTS idx_employee_info_manager_org 
  ON public.employee_info (manager_id, organization_id);

CREATE INDEX IF NOT EXISTS idx_employee_info_org_status 
  ON public.employee_info (organization_id, status);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_org_active 
  ON public.user_roles (user_id, organization_id)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_security_audit_log_org_created_at 
  ON public.security_audit_log (organization_id, created_at);

CREATE INDEX IF NOT EXISTS idx_goal_assignments_employee 
  ON public.goal_assignments (employee_id);

CREATE INDEX IF NOT EXISTS idx_goal_assignments_goal 
  ON public.goal_assignments (goal_id);

CREATE INDEX IF NOT EXISTS idx_goals_org_created_by 
  ON public.goals (organization_id, created_by);



-- Phase 2: Security hardening + caching

-- Harden audit log inserts with server-derived context (if not present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_harden_audit_log_insert'
  ) THEN
    CREATE TRIGGER trg_harden_audit_log_insert
    BEFORE INSERT ON public.security_audit_log
    FOR EACH ROW
    EXECUTE FUNCTION public.harden_audit_log_insert();
  END IF;
END
$$;

-- Keep the role summary cache up-to-date from user_roles changes (if not present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_recompute_user_role_summary_on_user_roles'
  ) THEN
    CREATE TRIGGER trg_recompute_user_role_summary_on_user_roles
    AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_recompute_user_role_summary();
  END IF;
END
$$;



-- Phase 3: Performance telemetry (RPC + RLS + indexes)

-- RPC used by the app to log query performance
CREATE OR REPLACE FUNCTION public.log_query_performance(
  _name text,
  _duration_ms integer,
  _extra jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.perf_query_events (
    id,
    created_at,
    user_id,
    organization_id,
    duration_ms,
    event_details,
    name,
    event_type
  ) VALUES (
    gen_random_uuid(),
    now(),
    auth.uid(),
    public.get_current_user_org_id(),
    _duration_ms,
    _extra,
    _name,
    'query'
  );
END;
$function$;

-- Ensure RLS is enabled on perf_query_events
ALTER TABLE public.perf_query_events ENABLE ROW LEVEL SECURITY;

-- Admins can view performance events in their organization
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'perf_query_events' 
      AND policyname = 'Admins can view perf events in their org'
  ) THEN
    CREATE POLICY "Admins can view perf events in their org"
      ON public.perf_query_events
      FOR SELECT
      USING (
        organization_id = public.get_current_user_org_id()
        AND public.has_role('admin'::public.app_role)
      );
  END IF;
END
$$;

-- Inserts are only allowed via the SECURITY DEFINER function above;
-- no direct INSERT policy is created.

-- Index for fast org/time queries on perf logs
CREATE INDEX IF NOT EXISTS idx_perf_query_events_org_created_at 
  ON public.perf_query_events (organization_id, created_at);
