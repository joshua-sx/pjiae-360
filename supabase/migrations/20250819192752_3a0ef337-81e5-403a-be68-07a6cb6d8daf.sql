
-- 1) Clean up legacy columns and artifacts (safe no-ops if they don't exist)

-- Legacy columns added by older PJIAE-specific or profiles-centric migrations
ALTER TABLE IF EXISTS public.roles      DROP COLUMN IF EXISTS is_vacant;
ALTER TABLE IF EXISTS public.profiles   DROP COLUMN IF EXISTS position_status;

-- Legacy "code" columns that don’t belong to the current model
ALTER TABLE IF EXISTS public.divisions  DROP COLUMN IF EXISTS code;
ALTER TABLE IF EXISTS public.departments DROP COLUMN IF EXISTS code;

-- Legacy appraiser assignments table and trigger
DROP TRIGGER IF EXISTS update_appraiser_assignments_updated_at ON public.appraiser_assignments;
DROP TABLE IF EXISTS public.appraiser_assignments;

-- Legacy helper functions not used in current model
DROP FUNCTION IF EXISTS public.get_suggested_appraisers(uuid);
DROP FUNCTION IF EXISTS public.assign_appraisers(uuid, uuid[], uuid);
DROP FUNCTION IF EXISTS public.get_editable_employees(uuid);

-- Legacy function name that clashes with our current pattern (keep only get_current_user_org_id)
DROP FUNCTION IF EXISTS public.get_user_organization_id();

-- 2) Enforce tenant-agnostic uniqueness by normalized_name

-- Ensure unique normalized names within each organization
CREATE UNIQUE INDEX IF NOT EXISTS divisions_unique_normalized_name_per_org
  ON public.divisions (organization_id, normalized_name);

CREATE UNIQUE INDEX IF NOT EXISTS departments_unique_normalized_name_per_org
  ON public.departments (organization_id, normalized_name);

-- Ensure normalize_name_trigger is attached to both tables (create triggers only if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'trg_divisions_normalize_name'
      AND n.nspname = 'public'
  ) THEN
    CREATE TRIGGER trg_divisions_normalize_name
      BEFORE INSERT OR UPDATE ON public.divisions
      FOR EACH ROW EXECUTE FUNCTION public.normalize_name_trigger();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'trg_departments_normalize_name'
      AND n.nspname = 'public'
  ) THEN
    CREATE TRIGGER trg_departments_normalize_name
      BEFORE INSERT OR UPDATE ON public.departments
      FOR EACH ROW EXECUTE FUNCTION public.normalize_name_trigger();
  END IF;
END $$;

-- 3) Secure, org-scoped, idempotent template applier
-- Admin-only, applies an example "airport_basic" structure for the current organization
CREATE OR REPLACE FUNCTION public.apply_org_structure_template(_template text DEFAULT 'airport_basic')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  _org_id uuid := public.get_current_user_org_id();
  _divisions_upserted int := 0;
  _departments_upserted int := 0;
BEGIN
  -- Permission gate: admin only in the current org
  IF NOT public.has_role('admin') THEN
    RAISE EXCEPTION 'Insufficient permissions to apply structure template';
  END IF;

  IF _org_id IS NULL THEN
    RAISE EXCEPTION 'No organization context for template application';
  END IF;

  IF _template = 'airport_basic' THEN
    -- Upsert divisions (idempotent via unique (org_id, normalized_name))
    WITH divs(name) AS (
      VALUES 
        ('Executive'),
        ('Finance'),
        ('Operations'),
        ('Human Resources'),
        ('Engineering'),
        ('Commercial'),
        ('Security'),
        ('Quality Assurance')
    ), ins AS (
      INSERT INTO public.divisions (organization_id, name, normalized_name)
      SELECT _org_id, name, lower(trim(name))
      FROM divs
      ON CONFLICT (organization_id, normalized_name) 
        DO UPDATE SET name = EXCLUDED.name
      RETURNING 1
    )
    SELECT COUNT(*) INTO _divisions_upserted FROM ins;

    -- Upsert departments with division mapping
    WITH dept(name, division_name) AS (
      VALUES 
        ('CEO Office','Executive'),
        ('Executive Support','Executive'),
        ('Legal Counsel','Executive'),
        ('Accounting','Finance'),
        ('Budget & Planning','Finance'),
        ('Maintenance','Operations'),
        ('Ground Support','Operations'),
        ('Training & Development','Human Resources'),
        ('Project Management Unit','Engineering'),
        ('IT Services','Engineering'),
        ('Marketing','Commercial'),
        ('Customer Service','Commercial'),
        ('Safety & Compliance','Security'),
        ('Audit','Quality Assurance')
    ), insd AS (
      INSERT INTO public.departments (organization_id, division_id, name, normalized_name)
      SELECT 
        _org_id,
        d.id,
        dept.name,
        lower(trim(dept.name))
      FROM dept
      JOIN public.divisions d
        ON d.organization_id = _org_id 
       AND d.normalized_name = lower(trim(dept.division_name))
      ON CONFLICT (organization_id, normalized_name) 
        DO UPDATE SET name = EXCLUDED.name, division_id = EXCLUDED.division_id
      RETURNING 1
    )
    SELECT COUNT(*) INTO _departments_upserted FROM insd;
  ELSE
    RAISE EXCEPTION 'Unknown template: %', _template;
  END IF;

  RETURN jsonb_build_object(
    'template', _template,
    'divisions_upserted', _divisions_upserted,
    'departments_upserted', _departments_upserted
  );
END;
$function$;
