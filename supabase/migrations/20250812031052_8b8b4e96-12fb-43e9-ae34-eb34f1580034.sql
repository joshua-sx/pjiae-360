-- Step 1.1: Define Role Hierarchy (Task 2.1)
-- 1) Create roles reference table with hierarchy levels
CREATE TABLE IF NOT EXISTS public.roles (
  role public.app_role PRIMARY KEY,
  display_name text NOT NULL,
  level integer NOT NULL CHECK (level > 0),
  description text
);

-- Seed/Upsert canonical roles with precedence
INSERT INTO public.roles (role, display_name, level, description) VALUES
  ('employee', 'Employee', 1, 'Base employee role'),
  ('supervisor', 'Supervisor', 2, 'Supervises a small team'),
  ('manager', 'Department Head/Manager', 3, 'Manages a department'),
  ('director', 'Division Director', 4, 'Leads division operations'),
  ('admin', 'Administrator', 5, 'System administrator with full access')
ON CONFLICT (role) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  level = EXCLUDED.level,
  description = EXCLUDED.description;

-- Enable RLS and allow read-only access (reference data)
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Everyone can view roles reference" ON public.roles;
CREATE POLICY "Everyone can view roles reference"
ON public.roles
FOR SELECT
USING (true);

-- 2) Role precedence helpers
-- a) Get numeric level for a role (with safe fallback)
CREATE OR REPLACE FUNCTION public.get_role_level(_role public.app_role)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT r.level FROM public.roles r WHERE r.role = _role
  UNION ALL
  SELECT CASE _role
    WHEN 'admin'::public.app_role THEN 5
    WHEN 'director'::public.app_role THEN 4
    WHEN 'manager'::public.app_role THEN 3
    WHEN 'supervisor'::public.app_role THEN 2
    WHEN 'employee'::public.app_role THEN 1
  END
  LIMIT 1;
$$;

-- b) Highest role level for a user within their current org (by default)
CREATE OR REPLACE FUNCTION public.user_max_role_level(_user_id uuid DEFAULT auth.uid())
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT COALESCE(MAX(public.get_role_level(ur.role)), 0)
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id
    AND ur.is_active = true
    AND (
      -- If checking current auth user, restrict to their current org context
      CASE WHEN _user_id = auth.uid() THEN ur.organization_id = public.get_current_user_org_id() ELSE true END
    );
$$;

-- c) Check if user has at least the given role by precedence
CREATE OR REPLACE FUNCTION public.has_role_at_least(_role public.app_role, _user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT public.user_max_role_level(_user_id) >= public.get_role_level(_role);
$$;

-- d) Provide two-arg has_role overload for explicit user checks
--    (complements existing has_role(role) that uses auth.uid())
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS(
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = _role
      AND ur.is_active = true
  );
$$;