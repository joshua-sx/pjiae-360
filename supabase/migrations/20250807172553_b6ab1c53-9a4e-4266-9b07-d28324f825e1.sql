-- Remove duplicate departments, keeping the most recent one
WITH ranked_departments AS (
  SELECT id, name, organization_id, created_at,
         ROW_NUMBER() OVER (PARTITION BY name, organization_id ORDER BY created_at DESC) as rn
  FROM departments
)
DELETE FROM departments 
WHERE id IN (
  SELECT id FROM ranked_departments WHERE rn > 1
);

-- Add unique constraint to prevent future duplicates
ALTER TABLE departments 
ADD CONSTRAINT unique_department_name_per_org 
UNIQUE (name, organization_id);

-- Do the same for divisions
WITH ranked_divisions AS (
  SELECT id, name, organization_id, created_at,
         ROW_NUMBER() OVER (PARTITION BY name, organization_id ORDER BY created_at DESC) as rn
  FROM divisions
)
DELETE FROM divisions 
WHERE id IN (
  SELECT id FROM ranked_divisions WHERE rn > 1
);

-- Add unique constraint for divisions
ALTER TABLE divisions 
ADD CONSTRAINT unique_division_name_per_org 
UNIQUE (name, organization_id);