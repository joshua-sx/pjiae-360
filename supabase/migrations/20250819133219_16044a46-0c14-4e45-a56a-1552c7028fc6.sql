-- Remove the problematic view and create a secure function approach instead
DROP VIEW IF EXISTS public.employee_directory;

-- Update the existing get_employee_directory_for_manager function to be more secure
-- and rename it to be more general
CREATE OR REPLACE FUNCTION public.get_secure_employee_directory()
RETURNS TABLE(
  employee_id uuid,
  user_id uuid,
  first_name text,
  last_name text,
  full_name text,
  job_title text,
  department_name text,
  division_name text,
  status user_status,
  employment_type text,
  location text,
  organization_id uuid
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT 
    ei.id as employee_id,
    ei.user_id,
    p.first_name,
    p.last_name,
    CASE 
      WHEN p.first_name IS NOT NULL AND p.last_name IS NOT NULL 
      THEN TRIM(p.first_name || ' ' || p.last_name)
      ELSE p.email
    END as full_name,
    ei.job_title,
    d.name as department_name,
    div.name as division_name,
    ei.status,
    ei.employment_type,
    ei.location,
    ei.organization_id
  FROM public.employee_info ei
  LEFT JOIN public.profiles p ON p.user_id = ei.user_id
  LEFT JOIN public.departments d ON d.id = ei.department_id
  LEFT JOIN public.divisions div ON div.id = ei.division_id
  WHERE ei.organization_id = public.get_current_user_org_id()
    AND (
      -- HR roles see all employees
      public.has_role('admin') OR 
      public.has_role('director') OR
      -- Managers see their direct reports only
      (public.has_role('manager') AND ei.manager_id IN (
        SELECT id FROM public.employee_info 
        WHERE user_id = auth.uid() AND organization_id = public.get_current_user_org_id()
      )) OR
      -- Supervisors see same department only  
      (public.has_role('supervisor') AND ei.department_id IN (
        SELECT department_id FROM public.employee_info 
        WHERE user_id = auth.uid() AND organization_id = public.get_current_user_org_id()
      )) OR
      -- Users see themselves only
      ei.user_id = auth.uid()
    );
$$;

-- Drop the old function
DROP FUNCTION IF EXISTS public.get_employee_directory_for_manager();