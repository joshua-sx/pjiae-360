-- Add missing fields to profiles table for employee management
ALTER TABLE public.profiles 
ADD COLUMN job_title TEXT,
ADD COLUMN hire_date DATE;

-- Create sample roles
INSERT INTO public.roles (name, description, organization_id) 
SELECT 'Admin', 'System Administrator', id FROM public.organizations WHERE name = 'Default Organization'
ON CONFLICT DO NOTHING;

INSERT INTO public.roles (name, description, organization_id) 
SELECT 'Manager', 'Department Manager', id FROM public.organizations WHERE name = 'Default Organization'
ON CONFLICT DO NOTHING;

INSERT INTO public.roles (name, description, organization_id) 
SELECT 'Supervisor', 'Team Supervisor', id FROM public.organizations WHERE name = 'Default Organization'
ON CONFLICT DO NOTHING;

INSERT INTO public.roles (name, description, organization_id) 
SELECT 'Employee', 'Regular Employee', id FROM public.organizations WHERE name = 'Default Organization'
ON CONFLICT DO NOTHING;

-- Create sample divisions
INSERT INTO public.divisions (name, code, organization_id)
SELECT 'Operations', 'OPS', id FROM public.organizations WHERE name = 'Default Organization'
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO public.divisions (name, code, organization_id)
SELECT 'Human Resources', 'HRS', id FROM public.organizations WHERE name = 'Default Organization'
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO public.divisions (name, code, organization_id)
SELECT 'Finance', 'FIN', id FROM public.organizations WHERE name = 'Default Organization'
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO public.divisions (name, code, organization_id)
SELECT 'Information Technology', 'TEC', id FROM public.organizations WHERE name = 'Default Organization'
ON CONFLICT (organization_id, code) DO NOTHING;

-- Create sample departments
INSERT INTO public.departments (name, code, division_id, organization_id)
SELECT 'Sales', 'SAL', d.id, d.organization_id
FROM public.divisions d
WHERE d.code = 'OPS'
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO public.departments (name, code, division_id, organization_id)
SELECT 'Marketing', 'MKT', d.id, d.organization_id
FROM public.divisions d
WHERE d.code = 'OPS'
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO public.departments (name, code, division_id, organization_id)
SELECT 'Recruitment', 'REC', d.id, d.organization_id
FROM public.divisions d
WHERE d.code = 'HRS'
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO public.departments (name, code, division_id, organization_id)
SELECT 'Payroll', 'PAY', d.id, d.organization_id
FROM public.divisions d
WHERE d.code = 'HRS'
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO public.departments (name, code, division_id, organization_id)
SELECT 'Accounting', 'ACC', d.id, d.organization_id
FROM public.divisions d
WHERE d.code = 'FIN'
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO public.departments (name, code, division_id, organization_id)
SELECT 'Development', 'DEV', d.id, d.organization_id
FROM public.divisions d
WHERE d.code = 'TEC'
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO public.departments (name, code, division_id, organization_id)
SELECT 'Support', 'SUP', d.id, d.organization_id
FROM public.divisions d
WHERE d.code = 'TEC'
ON CONFLICT (organization_id, code) DO NOTHING;