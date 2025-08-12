-- 1) Table: job_title_role_map per organization
CREATE TABLE IF NOT EXISTS public.job_title_role_map (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  normalized_title text NOT NULL,
  role public.app_role NOT NULL,
  synonyms text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, normalized_title)
);

-- Enable RLS
ALTER TABLE public.job_title_role_map ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ BEGIN
  -- View within org
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'job_title_role_map' AND policyname = 'Users can view job title mapping in their organization'
  ) THEN
    CREATE POLICY "Users can view job title mapping in their organization"
      ON public.job_title_role_map
      FOR SELECT
      USING (organization_id = public.get_current_user_org_id());
  END IF;

  -- Admin manage within org
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'job_title_role_map' AND policyname = 'Admins can manage job title mapping'
  ) THEN
    CREATE POLICY "Admins can manage job title mapping"
      ON public.job_title_role_map
      FOR ALL
      USING (public.has_role('admin'::public.app_role) AND organization_id = public.get_current_user_org_id())
      WITH CHECK (public.has_role('admin'::public.app_role) AND organization_id = public.get_current_user_org_id());
  END IF;
END $$;

-- Helpful index (redundant with unique, but explicit name)
CREATE INDEX IF NOT EXISTS idx_job_title_role_map_org_title
  ON public.job_title_role_map (organization_id, normalized_title);

-- 2) Utility: normalize_job_title
CREATE OR REPLACE FUNCTION public.normalize_job_title(_title text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path TO ''
AS $$
  SELECT NULLIF(btrim(regexp_replace(lower(COALESCE(_title, '')),'[^a-z0-9]+',' ','g')), '')
$$;

-- 3) Inference from job title
CREATE OR REPLACE FUNCTION public.infer_role_from_job_title(_job_title text, _org_id uuid)
RETURNS public.app_role
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  _norm text := public.normalize_job_title(_job_title);
  _mapped public.app_role;
BEGIN
  IF _norm IS NULL THEN
    RETURN NULL;
  END IF;

  -- Exact mapping in table
  SELECT jtrm.role INTO _mapped
  FROM public.job_title_role_map jtrm
  WHERE jtrm.organization_id = _org_id
    AND jtrm.normalized_title = _norm
  LIMIT 1;

  IF _mapped IS NOT NULL THEN
    RETURN _mapped;
  END IF;

  -- Fallback keyword rules (conservative; never auto-assign 'admin')
  IF _norm ~ '\m(chief|vp|vice president|head|director)\M' THEN
    RETURN 'director'::public.app_role;
  ELSIF _norm ~ '\m(manager|lead)\M' THEN
    RETURN 'manager'::public.app_role;
  ELSIF _norm ~ '\m(supervisor|foreman)\M' THEN
    RETURN 'supervisor'::public.app_role;
  ELSE
    RETURN NULL; -- no inference from title
  END IF;
END;
$$;

-- 4) Inference from org structure (direct reports => manager)
CREATE OR REPLACE FUNCTION public.infer_role_from_org_structure(_employee_id uuid)
RETURNS public.app_role
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  _reports int;
BEGIN
  SELECT COUNT(*) INTO _reports
  FROM public.employee_info ei
  WHERE ei.manager_id = _employee_id;

  IF COALESCE(_reports,0) > 0 THEN
    RETURN 'manager'::public.app_role;
  END IF;

  RETURN NULL;
END;
$$;

-- 5) Role level within a specific org
CREATE OR REPLACE FUNCTION public.user_max_role_level_in_org(_user_id uuid, _org_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT COALESCE(MAX(public.get_role_level(ur.role)), 0)
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id
    AND ur.organization_id = _org_id
    AND ur.is_active = true
$$;

-- 6) Determine best inferred role
CREATE OR REPLACE FUNCTION public.determine_best_inferred_role(_employee_id uuid)
RETURNS public.app_role
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  _org_id uuid;
  _job_title text;
  _from_title public.app_role;
  _from_structure public.app_role;
  _best public.app_role;
BEGIN
  SELECT organization_id, job_title INTO _org_id, _job_title
  FROM public.employee_info
  WHERE id = _employee_id
  LIMIT 1;

  IF _org_id IS NULL THEN
    RETURN NULL;
  END IF;

  _from_title := public.infer_role_from_job_title(_job_title, _org_id);
  _from_structure := public.infer_role_from_org_structure(_employee_id);

  IF _from_title IS NULL AND _from_structure IS NULL THEN
    RETURN NULL;
  ELSIF _from_title IS NULL THEN
    _best := _from_structure;
  ELSIF _from_structure IS NULL THEN
    _best := _from_title;
  ELSE
    _best := CASE WHEN public.get_role_level(_from_title) >= public.get_role_level(_from_structure)
                  THEN _from_title ELSE _from_structure END;
  END IF;

  RETURN _best;
END;
$$;

-- 7) System function to apply inferred role (upgrade-only)
CREATE OR REPLACE FUNCTION public.system_apply_inferred_role(_employee_id uuid, _reason text DEFAULT 'auto_inferred')
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  _user_id uuid;
  _org_id uuid;
  _role public.app_role;
  _current_level int;
  _inferred_level int;
BEGIN
  SELECT user_id, organization_id INTO _user_id, _org_id
  FROM public.employee_info
  WHERE id = _employee_id
  LIMIT 1;

  IF _user_id IS NULL OR _org_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Employee not found');
  END IF;

  _role := public.determine_best_inferred_role(_employee_id);
  IF _role IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'No inferred role');
  END IF;

  _current_level := public.user_max_role_level_in_org(_user_id, _org_id);
  _inferred_level := public.get_role_level(_role);

  -- Only upgrade; never downgrade
  IF _inferred_level > _current_level THEN
    -- Deactivate existing roles in org
    UPDATE public.user_roles
    SET is_active = false
    WHERE user_id = _user_id AND organization_id = _org_id;

    -- Assign inferred role
    INSERT INTO public.user_roles (user_id, role, organization_id, is_active)
    VALUES (_user_id, _role, _org_id, true);

    -- Audit
    INSERT INTO public.security_audit_log (user_id, organization_id, event_type, event_details, success)
    VALUES (_user_id, _org_id, 'role_inferred_assignment',
      jsonb_build_object('assigned_role', _role, 'reason', _reason, 'employee_id', _employee_id), true);

    RETURN jsonb_build_object('success', true, 'message', 'Role assigned', 'role', _role);
  END IF;

  RETURN jsonb_build_object('success', true, 'message', 'No change (not an upgrade)', 'role', _role);
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.security_audit_log (user_id, organization_id, event_type, event_details, success)
  VALUES (_user_id, _org_id, 'role_inferred_error', jsonb_build_object('error', SQLERRM, 'employee_id', _employee_id), false);
  RETURN jsonb_build_object('success', false, 'error', 'Internal error');
END;
$$;

-- 8) Trigger to apply on employee changes
CREATE OR REPLACE FUNCTION public.trg_apply_inferred_role_fn()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  PERFORM public.system_apply_inferred_role(NEW.id, 'employee_info change');
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_apply_inferred_role'
  ) THEN
    CREATE TRIGGER trg_apply_inferred_role
    AFTER INSERT OR UPDATE OF job_title, manager_id, department_id, division_id, organization_id
    ON public.employee_info
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_apply_inferred_role_fn();
  END IF;
END $$;

-- 9) RPC to (re)apply across org
CREATE OR REPLACE FUNCTION public.reapply_inferred_roles_for_org(_org_id uuid DEFAULT public.get_current_user_org_id())
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  _processed int := 0;
  _upgraded int := 0;
  _result jsonb;
BEGIN
  FOR _employee_id IN SELECT id FROM public.employee_info WHERE organization_id = _org_id LOOP
    _processed := _processed + 1;
    _result := public.system_apply_inferred_role(_employee_id, 'bulk_reapply');
    IF COALESCE((_result->>'success')::boolean, false) AND (_result->>'message') IN ('Role assigned') THEN
      _upgraded := _upgraded + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('processed', _processed, 'upgraded', _upgraded);
END;
$$;