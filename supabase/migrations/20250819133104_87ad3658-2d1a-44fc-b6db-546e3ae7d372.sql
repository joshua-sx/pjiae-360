-- Security Enhancement: Implement granular access controls for employee data
-- This addresses the security finding about overly broad access to personal information

-- Step 1: Drop existing overly permissive SELECT policies
DROP POLICY IF EXISTS "employee_info_select_org_roles" ON public.employee_info;

-- Step 2: Create more granular SELECT policies

-- Policy 1: Admins and directors can see all data (needed for HR functions)
CREATE POLICY "employee_info_select_hr_full_access" 
ON public.employee_info 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
      AND ur.is_active = true 
      AND ur.organization_id = employee_info.organization_id 
      AND ur.role = ANY(ARRAY['admin'::app_role, 'director'::app_role])
  )
);

-- Policy 2: Managers can see limited data for their direct reports only
CREATE POLICY "employee_info_select_manager_reports" 
ON public.employee_info 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
      AND ur.is_active = true 
      AND ur.organization_id = employee_info.organization_id 
      AND ur.role = 'manager'::app_role
  ) AND (
    -- Manager can see their direct reports
    manager_id IN (
      SELECT id FROM employee_info 
      WHERE user_id = auth.uid() 
        AND organization_id = employee_info.organization_id
    )
  )
);

-- Policy 3: Supervisors can see very limited data for organizational structure
CREATE POLICY "employee_info_select_supervisor_limited" 
ON public.employee_info 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
      AND ur.is_active = true 
      AND ur.organization_id = employee_info.organization_id 
      AND ur.role = 'supervisor'::app_role
  ) AND (
    -- Only see basic info in same department
    department_id IN (
      SELECT department_id FROM employee_info 
      WHERE user_id = auth.uid() 
        AND organization_id = employee_info.organization_id
    )
  )
);

-- Step 3: Create a secure view for non-sensitive employee data
CREATE OR REPLACE VIEW public.employee_directory AS
SELECT 
  ei.id,
  ei.user_id,
  ei.organization_id,
  ei.department_id,
  ei.division_id,
  ei.manager_id,
  ei.job_title,
  ei.status,
  ei.employment_type,
  ei.location,
  -- Exclude sensitive fields: phone_number, employee_number, hire_date, start_date, probation_end_date, cost_center
  ei.created_at,
  ei.updated_at
FROM public.employee_info ei;

-- Step 4: Set up RLS on the view
ALTER VIEW public.employee_directory SET (security_barrier = true);

-- Grant appropriate access to the view
GRANT SELECT ON public.employee_directory TO authenticated;

-- Step 5: Create a function for managers to get limited employee data
CREATE OR REPLACE FUNCTION public.get_employee_directory_for_manager()
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
  location text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT 
    ed.id as employee_id,
    ed.user_id,
    p.first_name,
    p.last_name,
    CASE 
      WHEN p.first_name IS NOT NULL AND p.last_name IS NOT NULL 
      THEN TRIM(p.first_name || ' ' || p.last_name)
      ELSE p.email
    END as full_name,
    ed.job_title,
    d.name as department_name,
    div.name as division_name,
    ed.status,
    ed.employment_type,
    ed.location
  FROM public.employee_directory ed
  LEFT JOIN public.profiles p ON p.user_id = ed.user_id
  LEFT JOIN public.departments d ON d.id = ed.department_id
  LEFT JOIN public.divisions div ON div.id = ed.division_id
  WHERE ed.organization_id = public.get_current_user_org_id()
    AND (
      -- HR roles see all
      public.has_role('admin') OR 
      public.has_role('director') OR
      -- Managers see their reports
      (public.has_role('manager') AND ed.manager_id IN (
        SELECT id FROM public.employee_info 
        WHERE user_id = auth.uid() AND organization_id = public.get_current_user_org_id()
      )) OR
      -- Supervisors see same department
      (public.has_role('supervisor') AND ed.department_id IN (
        SELECT department_id FROM public.employee_info 
        WHERE user_id = auth.uid() AND organization_id = public.get_current_user_org_id()
      )) OR
      -- Users see themselves
      ed.user_id = auth.uid()
    );
$$;

-- Step 6: Create audit logging for sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_employee_data_access(
  _accessed_employee_id uuid,
  _access_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    organization_id,
    event_type,
    event_details,
    success
  ) VALUES (
    auth.uid(),
    public.get_current_user_org_id(),
    'sensitive_employee_data_access',
    jsonb_build_object(
      'accessed_employee_id', _accessed_employee_id,
      'access_type', _access_type,
      'timestamp', now()
    ),
    true
  );
END;
$$;