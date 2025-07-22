-- Add unique constraints for proper upsert operations during onboarding

-- Add unique constraint to roles table for (name, organization_id)
-- First, remove any existing duplicates by keeping the first occurrence
DELETE FROM public.roles 
WHERE id NOT IN (
  SELECT DISTINCT ON (name, organization_id) id 
  FROM public.roles 
  ORDER BY name, organization_id, created_at ASC
);

ALTER TABLE public.roles 
ADD CONSTRAINT roles_name_organization_unique 
UNIQUE (name, organization_id);

-- Add unique constraint to divisions table for (name, organization_id)
-- First, remove any existing duplicates by keeping the first occurrence
DELETE FROM public.divisions 
WHERE id NOT IN (
  SELECT DISTINCT ON (name, organization_id) id 
  FROM public.divisions 
  ORDER BY name, organization_id, created_at ASC
);

ALTER TABLE public.divisions
ADD CONSTRAINT divisions_name_organization_unique
UNIQUE (name, organization_id);

ALTER TABLE public.divisions
ADD CONSTRAINT divisions_code_organization_unique
UNIQUE (organization_id, code);

-- Add unique constraint to departments table for (name, organization_id)
-- First, remove any existing duplicates by keeping the first occurrence
DELETE FROM public.departments 
WHERE id NOT IN (
  SELECT DISTINCT ON (name, organization_id) id 
  FROM public.departments 
  ORDER BY name, organization_id, created_at ASC
);

ALTER TABLE public.departments
ADD CONSTRAINT departments_name_organization_unique
UNIQUE (name, organization_id);

ALTER TABLE public.departments
ADD CONSTRAINT departments_code_organization_unique
UNIQUE (organization_id, code);