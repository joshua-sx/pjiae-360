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
INSERT INTO public.divisions (name, organization_id) 
SELECT 'Operations', id FROM public.organizations WHERE name = 'Default Organization'
ON CONFLICT DO NOTHING;

INSERT INTO public.divisions (name, organization_id) 
SELECT 'Human Resources', id FROM public.organizations WHERE name = 'Default Organization'
ON CONFLICT DO NOTHING;

INSERT INTO public.divisions (name, organization_id) 
SELECT 'Finance', id FROM public.organizations WHERE name = 'Default Organization'
ON CONFLICT DO NOTHING;

INSERT INTO public.divisions (name, organization_id) 
SELECT 'Information Technology', id FROM public.organizations WHERE name = 'Default Organization'
ON CONFLICT DO NOTHING;

-- Create sample departments
INSERT INTO public.departments (name, division_id, organization_id) 
SELECT 'Sales', d.id, d.organization_id 
FROM public.divisions d 
WHERE d.name = 'Operations'
ON CONFLICT DO NOTHING;

INSERT INTO public.departments (name, division_id, organization_id) 
SELECT 'Marketing', d.id, d.organization_id 
FROM public.divisions d 
WHERE d.name = 'Operations'
ON CONFLICT DO NOTHING;

INSERT INTO public.departments (name, division_id, organization_id) 
SELECT 'Recruitment', d.id, d.organization_id 
FROM public.divisions d 
WHERE d.name = 'Human Resources'
ON CONFLICT DO NOTHING;

INSERT INTO public.departments (name, division_id, organization_id) 
SELECT 'Payroll', d.id, d.organization_id 
FROM public.divisions d 
WHERE d.name = 'Human Resources'
ON CONFLICT DO NOTHING;

INSERT INTO public.departments (name, division_id, organization_id) 
SELECT 'Accounting', d.id, d.organization_id 
FROM public.divisions d 
WHERE d.name = 'Finance'
ON CONFLICT DO NOTHING;

INSERT INTO public.departments (name, division_id, organization_id) 
SELECT 'Development', d.id, d.organization_id 
FROM public.divisions d 
WHERE d.name = 'Information Technology'
ON CONFLICT DO NOTHING;

INSERT INTO public.departments (name, division_id, organization_id) 
SELECT 'Support', d.id, d.organization_id 
FROM public.divisions d 
WHERE d.name = 'Information Technology'
ON CONFLICT DO NOTHING;