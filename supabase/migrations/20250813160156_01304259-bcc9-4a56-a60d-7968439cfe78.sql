-- Fix security issue: Restrict employee_info access to authorized personnel only
-- Remove the overly permissive policy that allows all org users to see all employee data
DROP POLICY "Users can view employees from their organization" ON public.employee_info;

-- Create more secure, role-based access policies for employee_info
-- Policy 1: Users can view their own employee record
CREATE POLICY "Users can view their own employee info" 
ON public.employee_info 
FOR SELECT 
USING (user_id = auth.uid());

-- Policy 2: Managers can view their direct reports
CREATE POLICY "Managers can view their direct reports" 
ON public.employee_info 
FOR SELECT 
USING (
  manager_id IN (
    SELECT id FROM public.employee_info 
    WHERE user_id = auth.uid() AND organization_id = get_current_user_org_id()
  )
);

-- Policy 3: HR roles (admin, director) can view all employees in their organization
CREATE POLICY "HR roles can view all employee info" 
ON public.employee_info 
FOR SELECT 
USING (
  organization_id = get_current_user_org_id() 
  AND (has_role('admin'::app_role) OR has_role('director'::app_role))
);

-- Policy 4: Managers can view all employees in their organization (for management functions)
-- This is needed for managers to assign goals, create appraisals, etc.
CREATE POLICY "Managers can view employee info for management functions" 
ON public.employee_info 
FOR SELECT 
USING (
  organization_id = get_current_user_org_id() 
  AND has_role('manager'::app_role)
);

-- Also create a database function to check if a user can view a specific employee
-- This will be useful for frontend components to check access
CREATE OR REPLACE FUNCTION public.can_view_employee(_employee_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.employee_info ei
    WHERE ei.id = _employee_id
      AND ei.organization_id = public.get_current_user_org_id()
      AND (
        -- User can view their own record
        ei.user_id = auth.uid()
        -- HR roles can view all
        OR public.has_role('admin'::app_role)
        OR public.has_role('director'::app_role)
        -- Managers can view all for management functions
        OR public.has_role('manager'::app_role)
        -- Direct manager can view their reports
        OR ei.manager_id IN (
          SELECT id FROM public.employee_info 
          WHERE user_id = auth.uid() AND organization_id = public.get_current_user_org_id()
        )
      )
  );
$$;