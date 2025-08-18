-- Make normalized_name columns optional in TypeScript by setting them as DEFAULT values
ALTER TABLE public.divisions ALTER COLUMN normalized_name SET DEFAULT lower(trim(name));
ALTER TABLE public.departments ALTER COLUMN normalized_name SET DEFAULT lower(trim(name));