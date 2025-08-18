
-- 1) Ensure unique constraints (for upsert on organization_id, normalized_name)
-- Names chosen to match code checks for constraint names.

CREATE UNIQUE INDEX IF NOT EXISTS unique_division_name_per_org
  ON public.divisions (organization_id, normalized_name);

CREATE UNIQUE INDEX IF NOT EXISTS unique_department_name_per_org
  ON public.departments (organization_id, normalized_name);

-- 2) Attach normalization trigger so normalized_name stays in sync with name
-- The function public.normalize_name_trigger() already exists in this project.

DROP TRIGGER IF EXISTS trg_divisions_normalize ON public.divisions;
CREATE TRIGGER trg_divisions_normalize
  BEFORE INSERT OR UPDATE ON public.divisions
  FOR EACH ROW EXECUTE FUNCTION public.normalize_name_trigger();

DROP TRIGGER IF EXISTS trg_departments_normalize ON public.departments;
CREATE TRIGGER trg_departments_normalize
  BEFORE INSERT OR UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.normalize_name_trigger();

-- 3) Backfill normalized_name for existing rows
UPDATE public.divisions
SET normalized_name = lower(trim(name))
WHERE (normalized_name IS NULL OR normalized_name = '');

UPDATE public.departments
SET normalized_name = lower(trim(name))
WHERE (normalized_name IS NULL OR normalized_name = '');

-- 4) Backfill department -> division links by inferring from existing employee_info records.
-- For each department, pick the division_id with the highest number of employees
-- and set departments.division_id if currently null.

WITH freq AS (
  SELECT
    department_id,
    division_id,
    COUNT(*) AS c
  FROM public.employee_info
  WHERE department_id IS NOT NULL AND division_id IS NOT NULL
  GROUP BY department_id, division_id
),
chosen AS (
  SELECT department_id, division_id
  FROM (
    SELECT
      department_id,
      division_id,
      c,
      ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY c DESC) AS rn
    FROM freq
  ) t
  WHERE rn = 1
)
UPDATE public.departments d
SET division_id = c.division_id,
    updated_at = NOW()
FROM chosen c
WHERE d.id = c.department_id
  AND d.division_id IS NULL;
