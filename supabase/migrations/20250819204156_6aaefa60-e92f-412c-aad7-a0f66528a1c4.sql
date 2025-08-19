
-- =========================================================
-- Phase 1: Indexes to optimize RLS joins and filters
-- =========================================================

-- employee_info
CREATE INDEX IF NOT EXISTS idx_employee_info_user ON public.employee_info(user_id);
CREATE INDEX IF NOT EXISTS idx_employee_info_org ON public.employee_info(organization_id);
CREATE INDEX IF NOT EXISTS idx_employee_info_user_org ON public.employee_info(user_id, organization_id);
CREATE INDEX IF NOT EXISTS idx_employee_info_manager_org ON public.employee_info(manager_id, organization_id);
CREATE INDEX IF NOT EXISTS idx_employee_info_dept_org ON public.employee_info(department_id, organization_id);
CREATE INDEX IF NOT EXISTS idx_employee_info_div_org ON public.employee_info(division_id, organization_id);

-- user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_org ON public.user_roles(user_id, organization_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_org_active ON public.user_roles(user_id, organization_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_roles_org_user_active ON public.user_roles(organization_id, user_id) WHERE is_active = true;

-- org-scoped tables frequently filtered by organization_id
CREATE INDEX IF NOT EXISTS idx_goals_org ON public.goals(organization_id);
CREATE INDEX IF NOT EXISTS idx_departments_org ON public.departments(organization_id);
CREATE INDEX IF NOT EXISTS idx_divisions_org ON public.divisions(organization_id);
CREATE INDEX IF NOT EXISTS idx_appraisals_org ON public.appraisals(organization_id);
CREATE INDEX IF NOT EXISTS idx_appraisal_cycles_org ON public.appraisal_cycles(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_settings_org ON public.organization_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_competencies_org ON public.competencies(organization_id);
CREATE INDEX IF NOT EXISTS idx_rating_scales_org ON public.rating_scales(organization_id);
CREATE INDEX IF NOT EXISTS idx_activities_org ON public.activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_csv_mapping_presets_org ON public.csv_mapping_presets(organization_id);
CREATE INDEX IF NOT EXISTS idx_import_batches_org ON public.import_batches(organization_id);
CREATE INDEX IF NOT EXISTS idx_notification_settings_org ON public.notification_settings(organization_id);

-- other useful indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_assignments_employee ON public.goal_assignments(employee_id);

-- =========================================================
-- Phase 2: Role checks cache (no behavior change)
-- =========================================================

-- 2.1: Cache table (deny all direct access)
CREATE TABLE IF NOT EXISTS public.user_role_summary (
  user_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  roles public.app_role[] NOT NULL DEFAULT '{}',
  max_level integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, organization_id)
);

ALTER TABLE public.user_role_summary ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'user_role_summary' 
      AND policyname = 'No direct access to role summary'
  ) THEN
    CREATE POLICY "No direct access to role summary"
      ON public.user_role_summary
      FOR ALL
      USING (false)
      WITH CHECK (false);
  END IF;
END$$;

-- 2.2: Recompute function
CREATE OR REPLACE FUNCTION public.recompute_user_role_summary(_user_id uuid, _org_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  _roles public.app_role[];
  _max_level int;
BEGIN
  SELECT 
    COALESCE(array_agg(ur.role ORDER BY public.get_role_level(ur.role) DESC), ARRAY[]::public.app_role[]),
    COALESCE(MAX(public.get_role_level(ur.role)), 0)
  INTO _roles, _max_level
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id
    AND ur.organization_id = _org_id
    AND ur.is_active = true;

  INSERT INTO public.user_role_summary (user_id, organization_id, roles, max_level, updated_at)
  VALUES (_user_id, _org_id, _roles, _max_level, now())
  ON CONFLICT (user_id, organization_id)
  DO UPDATE SET 
    roles = EXCLUDED.roles, 
    max_level = EXCLUDED.max_level, 
    updated_at = now();
END;
$function$;

-- 2.3: Trigger function
CREATE OR REPLACE FUNCTION public.trg_recompute_user_role_summary()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.recompute_user_role_summary(NEW.user_id, NEW.organization_id);

  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.recompute_user_role_summary(NEW.user_id, NEW.organization_id);
    IF NEW.user_id IS DISTINCT FROM OLD.user_id 
       OR NEW.organization_id IS DISTINCT FROM OLD.organization_id THEN
      PERFORM public.recompute_user_role_summary(OLD.user_id, OLD.organization_id);
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.recompute_user_role_summary(OLD.user_id, OLD.organization_id);
  END IF;

  RETURN NULL;
END;
$function$;

-- 2.4: Attach triggers to user_roles
DROP TRIGGER IF EXISTS trg_user_roles_summary_ins ON public.user_roles;
DROP TRIGGER IF EXISTS trg_user_roles_summary_upd ON public.user_roles;
DROP TRIGGER IF EXISTS trg_user_roles_summary_del ON public.user_roles;

CREATE TRIGGER trg_user_roles_summary_ins
AFTER INSERT ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.trg_recompute_user_role_summary();

CREATE TRIGGER trg_user_roles_summary_upd
AFTER UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.trg_recompute_user_role_summary();

CREATE TRIGGER trg_user_roles_summary_del
AFTER DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.trg_recompute_user_role_summary();

-- 2.5: Helper functions (optional use in future policies/queries)
CREATE OR REPLACE FUNCTION public.get_roles_cached(
  _user_id uuid DEFAULT auth.uid(), 
  _org_id uuid DEFAULT public.get_current_user_org_id()
)
RETURNS public.app_role[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT COALESCE(
    (SELECT roles FROM public.user_role_summary urs
     WHERE urs.user_id = _user_id AND urs.organization_id = _org_id),
    ARRAY[]::public.app_role[]
  )
$function$;

CREATE OR REPLACE FUNCTION public.user_max_role_level_cached(
  _user_id uuid DEFAULT auth.uid(), 
  _org_id uuid DEFAULT public.get_current_user_org_id()
)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT COALESCE(
    (SELECT max_level FROM public.user_role_summary urs
     WHERE urs.user_id = _user_id AND urs.organization_id = _org_id),
    0
  )
$function$;

CREATE OR REPLACE FUNCTION public.has_role_cached(
  _role public.app_role, 
  _user_id uuid DEFAULT auth.uid(), 
  _org_id uuid DEFAULT public.get_current_user_org_id()
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT _role = ANY(public.get_roles_cached(_user_id, _org_id))
$function$;

-- 2.6: Seed existing cache for current data
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN 
    SELECT DISTINCT user_id, organization_id 
    FROM public.user_roles
  LOOP
    PERFORM public.recompute_user_role_summary(rec.user_id, rec.organization_id);
  END LOOP;
END$$;

