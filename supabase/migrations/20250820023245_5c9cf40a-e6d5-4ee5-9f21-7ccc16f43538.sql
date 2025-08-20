
-- 1) Performance indexes for common joins and filters
CREATE INDEX IF NOT EXISTS idx_employee_info_user_id ON public.employee_info (user_id);
CREATE INDEX IF NOT EXISTS idx_employee_info_manager_id ON public.employee_info (manager_id);

CREATE INDEX IF NOT EXISTS idx_goals_org_created_by ON public.goals (organization_id, created_by);

CREATE INDEX IF NOT EXISTS idx_appraisals_employee_cycle ON public.appraisals (employee_id, cycle_id);

CREATE INDEX IF NOT EXISTS idx_security_audit_log_org_created_at ON public.security_audit_log (organization_id, created_at DESC);

-- 2) Seed roles (idempotent: update then insert missing)
UPDATE public.roles 
SET level = 5, display_name = 'Administrator', description = 'Full access to all features and settings'
WHERE role = 'admin'::public.app_role;

UPDATE public.roles 
SET level = 4, display_name = 'Director', description = 'Org-wide oversight; manage cycles, appraisals, goals'
WHERE role = 'director'::public.app_role;

UPDATE public.roles 
SET level = 3, display_name = 'Manager', description = 'Manage team appraisals and goals'
WHERE role = 'manager'::public.app_role;

UPDATE public.roles 
SET level = 2, display_name = 'Supervisor', description = 'Supervise team operations with limited management'
WHERE role = 'supervisor'::public.app_role;

UPDATE public.roles 
SET level = 1, display_name = 'Employee', description = 'Self-service access to goals and appraisals'
WHERE role = 'employee'::public.app_role;

INSERT INTO public.roles (role, level, display_name, description)
SELECT 'admin'::public.app_role, 5, 'Administrator', 'Full access to all features and settings'
WHERE NOT EXISTS (SELECT 1 FROM public.roles WHERE role = 'admin'::public.app_role);

INSERT INTO public.roles (role, level, display_name, description)
SELECT 'director'::public.app_role, 4, 'Director', 'Org-wide oversight; manage cycles, appraisals, goals'
WHERE NOT EXISTS (SELECT 1 FROM public.roles WHERE role = 'director'::public.app_role);

INSERT INTO public.roles (role, level, display_name, description)
SELECT 'manager'::public.app_role, 3, 'Manager', 'Manage team appraisals and goals'
WHERE NOT EXISTS (SELECT 1 FROM public.roles WHERE role = 'manager'::public.app_role);

INSERT INTO public.roles (role, level, display_name, description)
SELECT 'supervisor'::public.app_role, 2, 'Supervisor', 'Supervise team operations with limited management'
WHERE NOT EXISTS (SELECT 1 FROM public.roles WHERE role = 'supervisor'::public.app_role);

INSERT INTO public.roles (role, level, display_name, description)
SELECT 'employee'::public.app_role, 1, 'Employee', 'Self-service access to goals and appraisals'
WHERE NOT EXISTS (SELECT 1 FROM public.roles WHERE role = 'employee'::public.app_role);

-- 3) Seed permissions (update descriptions, insert missing)
WITH perms(name, description) AS (
  VALUES
    ('manage_organization_settings','Manage org-wide settings including branding and localization'),
    ('view_audit_logs','View security audit logs'),
    ('manage_users','Create and manage users and roles'),
    ('manage_roles','Assign and revoke roles'),
    ('view_employees','View employees in organization'),
    ('manage_employees','Create/update employee records'),
    ('view_goals','View goals visible to the user'),
    ('manage_goals','Create/update/delete goals according to RLS'),
    ('assign_goals','Assign goals to employees'),
    ('view_appraisals','View appraisals visible to the user'),
    ('manage_appraisals','Create/update appraisals according to RLS'),
    ('finalize_appraisals','Finalize and lock appraisals'),
    ('manage_competencies','Manage competency library and ratings'),
    ('view_reports','View analytics and reports'),
    ('manage_cycles','Create/update appraisal cycles and phases'),
    ('manage_invitations','Send and manage employee invitations')
)
UPDATE public.permissions p
SET description = perms.description
FROM perms
WHERE p.name = perms.name;

INSERT INTO public.permissions (name, description)
SELECT perms.name, perms.description
FROM perms
LEFT JOIN public.permissions p ON p.name = perms.name
WHERE p.id IS NULL;

-- 4) Map role_permissions (idempotent inserts)

-- Admin: all permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin'::public.app_role, p.id
FROM public.permissions p
WHERE NOT EXISTS (
  SELECT 1 FROM public.role_permissions rp 
  WHERE rp.role = 'admin'::public.app_role AND rp.permission_id = p.id
);

-- Director: broad management and reporting (no org settings)
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'director'::public.app_role, p.id
FROM public.permissions p
WHERE p.name IN (
  'view_audit_logs',
  'view_employees','manage_employees',
  'view_goals','manage_goals','assign_goals',
  'view_appraisals','manage_appraisals','finalize_appraisals',
  'manage_competencies',
  'view_reports',
  'manage_cycles',
  'manage_invitations'
)
AND NOT EXISTS (
  SELECT 1 FROM public.role_permissions rp 
  WHERE rp.role = 'director'::public.app_role AND rp.permission_id = p.id
);

-- Manager
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'manager'::public.app_role, p.id
FROM public.permissions p
WHERE p.name IN (
  'view_employees',
  'view_goals','manage_goals','assign_goals',
  'view_appraisals','manage_appraisals',
  'view_reports'
)
AND NOT EXISTS (
  SELECT 1 FROM public.role_permissions rp 
  WHERE rp.role = 'manager'::public.app_role AND rp.permission_id = p.id
);

-- Supervisor
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'supervisor'::public.app_role, p.id
FROM public.permissions p
WHERE p.name IN (
  'view_employees',
  'view_goals','assign_goals',
  'view_appraisals'
)
AND NOT EXISTS (
  SELECT 1 FROM public.role_permissions rp 
  WHERE rp.role = 'supervisor'::public.app_role AND rp.permission_id = p.id
);

-- Employee
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'employee'::public.app_role, p.id
FROM public.permissions p
WHERE p.name IN (
  'view_goals',
  'view_appraisals'
)
AND NOT EXISTS (
  SELECT 1 FROM public.role_permissions rp 
  WHERE rp.role = 'employee'::public.app_role AND rp.permission_id = p.id
);
