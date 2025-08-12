-- Seed canonical permissions if missing
DO $$
DECLARE
  perm_names text[] := ARRAY[
    'manage_employees',
    'view_reports',
    'create_appraisals',
    'manage_goals',
    'manage_roles',
    'view_audit',
    'manage_settings',
    'manage_organization',
    'manage_appraisal_cycles'
  ];
  perm_descs text[] := ARRAY[
    'Create, update, and manage employee records',
    'Access reports and analytics',
    'Create performance appraisals',
    'Create and manage goals',
    'Manage roles and permissions',
    'View security audit logs',
    'Manage application settings',
    'Manage organization information',
    'Manage appraisal cycles'
  ];
  i int;
  existing_id uuid;
BEGIN
  FOR i IN 1..array_length(perm_names,1) LOOP
    SELECT id INTO existing_id FROM public.permissions WHERE name = perm_names[i] LIMIT 1;
    IF existing_id IS NULL THEN
      INSERT INTO public.permissions (id, name, description)
      VALUES (gen_random_uuid(), perm_names[i], perm_descs[i]);
    END IF;
  END LOOP;
END $$;

-- Map default permissions to roles (idempotent)
WITH perms AS (
  SELECT name, id FROM public.permissions WHERE name IN (
    'manage_employees','view_reports','create_appraisals','manage_goals',
    'manage_roles','view_audit','manage_settings','manage_organization','manage_appraisal_cycles'
  )
)
-- Admin gets all
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin'::public.app_role, p.id
FROM perms p
WHERE NOT EXISTS (
  SELECT 1 FROM public.role_permissions rp 
  WHERE rp.role = 'admin'::public.app_role AND rp.permission_id = p.id
);

-- Director defaults
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'director'::public.app_role, p.id
FROM perms p
WHERE p.name IN ('view_reports','create_appraisals','manage_goals')
  AND NOT EXISTS (
    SELECT 1 FROM public.role_permissions rp 
    WHERE rp.role = 'director'::public.app_role AND rp.permission_id = p.id
  );

-- Manager defaults
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'manager'::public.app_role, p.id
FROM perms p
WHERE p.name IN ('view_reports','create_appraisals','manage_goals')
  AND NOT EXISTS (
    SELECT 1 FROM public.role_permissions rp 
    WHERE rp.role = 'manager'::public.app_role AND rp.permission_id = p.id
  );

-- Supervisor defaults
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'supervisor'::public.app_role, p.id
FROM perms p
WHERE p.name IN ('view_reports','create_appraisals')
  AND NOT EXISTS (
    SELECT 1 FROM public.role_permissions rp 
    WHERE rp.role = 'supervisor'::public.app_role AND rp.permission_id = p.id
  );

-- Employee defaults (none) - no inserts needed

-- RPC to get effective permissions for a user (derived from active roles)
CREATE OR REPLACE FUNCTION public.get_effective_permissions_for_user(_user_id uuid DEFAULT auth.uid())
RETURNS text[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT COALESCE(array_agg(DISTINCT p.name), ARRAY[]::text[])
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON rp.role = ur.role
  JOIN public.permissions p ON p.id = rp.permission_id
  WHERE ur.user_id = _user_id AND ur.is_active = true
$$;