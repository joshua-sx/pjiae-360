-- Create secure organization-aware profile data function
CREATE OR REPLACE FUNCTION public.get_current_user_profile_data()
RETURNS TABLE(
  profile_id uuid,
  user_id uuid,
  email text,
  first_name text,
  last_name text,
  full_name text,
  employee_id uuid,
  job_title text,
  department_id uuid,
  division_id uuid,
  manager_id uuid,
  hire_date date,
  status user_status,
  organization_id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT 
    p.id as profile_id,
    p.user_id,
    p.email,
    p.first_name,
    p.last_name,
    CASE 
      WHEN p.first_name IS NOT NULL AND p.last_name IS NOT NULL 
      THEN TRIM(p.first_name || ' ' || p.last_name)
      ELSE NULL
    END as full_name,
    ei.id as employee_id,
    ei.job_title,
    ei.department_id,
    ei.division_id,
    ei.manager_id,
    ei.hire_date,
    ei.status,
    ei.organization_id,
    ei.created_at,
    ei.updated_at
  FROM public.profiles p
  LEFT JOIN public.employee_info ei ON ei.user_id = p.user_id
  WHERE p.user_id = auth.uid()
    AND (ei.organization_id IS NULL OR ei.organization_id = public.get_current_user_org_id());
$function$;

-- Create function to get organization departments and divisions
CREATE OR REPLACE FUNCTION public.get_organization_departments_divisions()
RETURNS TABLE(
  dept_id uuid,
  dept_name text,
  dept_division_id uuid,
  div_id uuid,
  div_name text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT 
    d.id as dept_id,
    d.name as dept_name,
    d.division_id as dept_division_id,
    div.id as div_id,
    div.name as div_name
  FROM public.departments d
  LEFT JOIN public.divisions div ON div.id = d.division_id
  WHERE d.organization_id = public.get_current_user_org_id()
  
  UNION ALL
  
  SELECT 
    NULL as dept_id,
    NULL as dept_name,
    NULL as dept_division_id,
    div.id as div_id,
    div.name as div_name
  FROM public.divisions div
  WHERE div.organization_id = public.get_current_user_org_id()
    AND div.id NOT IN (
      SELECT DISTINCT division_id 
      FROM public.departments 
      WHERE division_id IS NOT NULL 
        AND organization_id = public.get_current_user_org_id()
    );
$function$;

-- Create function to get organization managers
CREATE OR REPLACE FUNCTION public.get_organization_managers()
RETURNS TABLE(
  manager_id uuid,
  user_id uuid,
  first_name text,
  last_name text,
  full_name text,
  job_title text,
  email text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT 
    ei.id as manager_id,
    ei.user_id,
    p.first_name,
    p.last_name,
    CASE 
      WHEN p.first_name IS NOT NULL AND p.last_name IS NOT NULL 
      THEN TRIM(p.first_name || ' ' || p.last_name)
      ELSE p.email
    END as full_name,
    ei.job_title,
    p.email
  FROM public.employee_info ei
  LEFT JOIN public.profiles p ON p.user_id = ei.user_id
  WHERE ei.organization_id = public.get_current_user_org_id()
    AND ei.user_id != auth.uid()
    AND ei.status = 'active';
$function$;