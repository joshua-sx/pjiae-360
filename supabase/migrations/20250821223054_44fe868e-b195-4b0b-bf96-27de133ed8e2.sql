
-- 1) Add snapshot and normalized columns to security_audit_log
ALTER TABLE public.security_audit_log
  ADD COLUMN IF NOT EXISTS actor_name text,
  ADD COLUMN IF NOT EXISTS actor_email text,
  ADD COLUMN IF NOT EXISTS actor_role_name text,
  ADD COLUMN IF NOT EXISTS actor_division_name text,
  ADD COLUMN IF NOT EXISTS actor_department_name text,
  ADD COLUMN IF NOT EXISTS object_type text,
  ADD COLUMN IF NOT EXISTS object_id text,
  ADD COLUMN IF NOT EXISTS object_name text,
  ADD COLUMN IF NOT EXISTS action_code text,
  ADD COLUMN IF NOT EXISTS outcome text,
  ADD COLUMN IF NOT EXISTS metadata jsonb,
  ADD COLUMN IF NOT EXISTS occurred_at timestamp with time zone;

-- Defaults for new columns
ALTER TABLE public.security_audit_log
  ALTER COLUMN metadata SET DEFAULT '{}'::jsonb;

-- 2) Backfill basic values (occurred_at, outcome, metadata)
UPDATE public.security_audit_log
SET occurred_at = COALESCE(occurred_at, created_at, now())
WHERE occurred_at IS NULL;

UPDATE public.security_audit_log
SET outcome = CASE WHEN success THEN 'success' ELSE 'failure' END
WHERE outcome IS NULL;

UPDATE public.security_audit_log
SET metadata = COALESCE(metadata, event_details, '{}'::jsonb)
WHERE metadata IS NULL;

-- Make occurred_at always present going forward
ALTER TABLE public.security_audit_log
  ALTER COLUMN occurred_at SET DEFAULT now();

-- Optional: require metadata to always be non-null JSON object
ALTER TABLE public.security_audit_log
  ALTER COLUMN metadata SET NOT NULL;

-- 3) Enrichment trigger to snapshot actor/org unit, normalize outcome/action_code, infer object
CREATE OR REPLACE FUNCTION public.enrich_security_audit_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  _first text;
  _last text;
  _email text;
  _role_name text;
  _div_name text;
  _dept_name text;
  _org_name text;
BEGIN
  -- Ensure timestamp and outcome
  NEW.occurred_at := COALESCE(NEW.occurred_at, NEW.created_at, now());

  IF NEW.outcome IS NULL OR NEW.outcome = '' THEN
    NEW.outcome := CASE WHEN COALESCE(NEW.success, true) THEN 'success' ELSE 'failure' END;
  END IF;

  -- Ensure metadata snapshot
  IF NEW.metadata IS NULL THEN
    NEW.metadata := COALESCE(NEW.event_details, '{}'::jsonb);
  END IF;

  -- Actor enrichment (name, email, role, division, department) at time of insert
  IF NEW.user_id IS NOT NULL THEN
    -- Name + email
    SELECT p.first_name, p.last_name, p.email
      INTO _first, _last, _email
    FROM public.profiles p
    WHERE p.user_id = NEW.user_id
    LIMIT 1;

    IF NEW.actor_name IS NULL THEN
      NEW.actor_name := NULLIF(btrim(COALESCE(_first,'') || ' ' || COALESCE(_last,'')), '');
    END IF;

    IF NEW.actor_email IS NULL THEN
      NEW.actor_email := _email;
    END IF;

    -- Role (highest active role in this org)
    IF NEW.actor_role_name IS NULL AND NEW.organization_id IS NOT NULL THEN
      SELECT r.display_name
        INTO _role_name
      FROM public.user_roles ur
      JOIN public.roles r ON r.role = ur.role
      WHERE ur.user_id = NEW.user_id
        AND ur.organization_id = NEW.organization_id
        AND ur.is_active = true
      ORDER BY r.level DESC
      LIMIT 1;

      NEW.actor_role_name := _role_name;
    END IF;

    -- Division / Department (from employee_info at insert time)
    IF (NEW.actor_division_name IS NULL OR NEW.actor_department_name IS NULL)
       AND NEW.organization_id IS NOT NULL THEN
      SELECT div.name, dept.name
        INTO _div_name, _dept_name
      FROM public.employee_info ei
      LEFT JOIN public.divisions div ON div.id = ei.division_id
      LEFT JOIN public.departments dept ON dept.id = ei.department_id
      WHERE ei.user_id = NEW.user_id
        AND ei.organization_id = NEW.organization_id
      LIMIT 1;

      IF NEW.actor_division_name IS NULL THEN
        NEW.actor_division_name := _div_name;
      END IF;

      IF NEW.actor_department_name IS NULL THEN
        NEW.actor_department_name := _dept_name;
      END IF;
    END IF;
  END IF;

  -- Normalize action_code: use provided if present, else mirror event_type
  IF NEW.action_code IS NULL OR NEW.action_code = '' THEN
    NEW.action_code := NEW.event_type;
  END IF;

  -- Infer object (type/id/name) if not set, based on common payloads
  IF NEW.object_type IS NULL THEN
    IF NEW.event_details ? 'goal_id' THEN
      NEW.object_type := 'goal';
      NEW.object_id := COALESCE(NEW.object_id, NEW.event_details->>'goal_id');
      NEW.object_name := COALESCE(NEW.object_name, NEW.event_details->>'goal_title', NEW.event_details->>'title');
    ELSIF NEW.event_details ? 'appraisal_id' THEN
      NEW.object_type := 'appraisal';
      NEW.object_id := COALESCE(NEW.object_id, NEW.event_details->>'appraisal_id');
      NEW.object_name := COALESCE(
        NEW.object_name,
        NEW.event_details->>'appraisal_name',
        CASE WHEN NEW.event_details ? 'employee_name'
             THEN 'Appraisal - ' || (NEW.event_details->>'employee_name')
             ELSE NULL END
      );
    ELSIF NEW.event_details ? 'employee_id' THEN
      NEW.object_type := 'employee';
      NEW.object_id := COALESCE(NEW.object_id, NEW.event_details->>'employee_id');
      NEW.object_name := COALESCE(NEW.object_name, NEW.event_details->>'employee_name');
    ELSIF NEW.event_details ? 'target_user_id' THEN
      NEW.object_type := 'employee';
      NEW.object_id := COALESCE(NEW.object_id, NEW.event_details->>'target_user_id');
      NEW.object_name := COALESCE(NEW.object_name, NEW.event_details->>'target_user_name');
    ELSIF NEW.organization_id IS NOT NULL AND (NEW.event_type LIKE 'org_%') THEN
      NEW.object_type := 'organization';
      NEW.object_id := COALESCE(NEW.object_id, NEW.organization_id::text);
      SELECT o.name INTO _org_name FROM public.organizations o WHERE o.id = NEW.organization_id LIMIT 1;
      NEW.object_name := COALESCE(NEW.object_name, _org_name);
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_enrich_security_audit_log ON public.security_audit_log;

CREATE TRIGGER trg_enrich_security_audit_log
BEFORE INSERT ON public.security_audit_log
FOR EACH ROW
EXECUTE FUNCTION public.enrich_security_audit_log();

-- 4) Backfill snapshot enrichment for existing rows
UPDATE public.security_audit_log AS sal
SET
  actor_name = COALESCE(
    sal.actor_name,
    NULLIF(btrim(COALESCE(p.first_name,'') || ' ' || COALESCE(p.last_name,'')), '')
  ),
  actor_email = COALESCE(sal.actor_email, p.email),
  actor_role_name = COALESCE(sal.actor_role_name, rolemap.display_name),
  actor_division_name = COALESCE(sal.actor_division_name, div.name),
  actor_department_name = COALESCE(sal.actor_department_name, dept.name),
  action_code = COALESCE(sal.action_code, sal.event_type),
  object_type = COALESCE(
    sal.object_type,
    CASE
      WHEN sal.event_details ? 'goal_id' THEN 'goal'
      WHEN sal.event_details ? 'appraisal_id' THEN 'appraisal'
      WHEN sal.event_details ? 'employee_id' THEN 'employee'
      WHEN sal.event_details ? 'target_user_id' THEN 'employee'
      WHEN sal.event_type LIKE 'org_%' THEN 'organization'
      ELSE NULL
    END
  ),
  object_id = COALESCE(
    sal.object_id,
    CASE
      WHEN sal.event_details ? 'goal_id' THEN sal.event_details->>'goal_id'
      WHEN sal.event_details ? 'appraisal_id' THEN sal.event_details->>'appraisal_id'
      WHEN sal.event_details ? 'employee_id' THEN sal.event_details->>'employee_id'
      WHEN sal.event_details ? 'target_user_id' THEN sal.event_details->>'target_user_id'
      WHEN sal.event_type LIKE 'org_%' AND sal.organization_id IS NOT NULL THEN sal.organization_id::text
      ELSE NULL
    END
  ),
  object_name = COALESCE(
    sal.object_name,
    CASE
      WHEN sal.event_details ? 'goal_title' THEN sal.event_details->>'goal_title'
      WHEN sal.event_details ? 'title' THEN sal.event_details->>'title'
      WHEN sal.event_details ? 'employee_name' THEN sal.event_details->>'employee_name'
      WHEN sal.event_type LIKE 'org_%' THEN o.name
      ELSE NULL
    END
  )
FROM public.profiles p
LEFT JOIN LATERAL (
  SELECT r2.display_name
  FROM public.user_roles ur2
  JOIN public.roles r2 ON r2.role = ur2.role
  WHERE ur2.user_id = sal.user_id
    AND ur2.organization_id = sal.organization_id
    AND ur2.is_active = true
  ORDER BY r2.level DESC
  LIMIT 1
) AS rolemap ON true
LEFT JOIN public.employee_info ei ON ei.user_id = sal.user_id AND ei.organization_id = sal.organization_id
LEFT JOIN public.divisions div ON div.id = ei.division_id
LEFT JOIN public.departments dept ON dept.id = ei.department_id
LEFT JOIN public.organizations o ON o.id = sal.organization_id
WHERE p.user_id = sal.user_id;

-- 5) Indexes for query patterns (filters/search/export)
CREATE INDEX IF NOT EXISTS idx_sal_org_occurred_at ON public.security_audit_log (organization_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_sal_action_code ON public.security_audit_log (action_code);
CREATE INDEX IF NOT EXISTS idx_sal_object ON public.security_audit_log (object_type, object_id);
CREATE INDEX IF NOT EXISTS idx_sal_outcome ON public.security_audit_log (outcome);
CREATE INDEX IF NOT EXISTS idx_sal_event_details_gin ON public.security_audit_log USING GIN (event_details);
CREATE INDEX IF NOT EXISTS idx_sal_metadata_gin ON public.security_audit_log USING GIN (metadata);

-- 6) Broaden viewing access (HR/managers) while preserving admin behavior
-- Existing admin policy remains; add an additional policy for directors/managers scoped to their org.
CREATE POLICY "Leaders can view audit logs in their org"
  ON public.security_audit_log
  FOR SELECT
  USING (
    (organization_id = public.get_current_user_org_id())
    AND (public.has_role('admin') OR public.has_role('director') OR public.has_role('manager'))
  );
