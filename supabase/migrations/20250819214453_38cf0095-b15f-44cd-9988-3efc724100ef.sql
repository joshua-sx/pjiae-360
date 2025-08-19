-- Fix security vulnerability: Restrict profile access to prevent unauthorized viewing of personal data

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;

-- Create more restrictive policies
-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());

-- Policy 2: Admins can view all profiles in their organization (for administration)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  has_role_simple('admin'::app_role) 
  AND EXISTS (
    SELECT 1 FROM employee_info ei 
    WHERE ei.user_id = profiles.user_id 
    AND ei.organization_id = get_current_user_org_id()
  )
);

-- Policy 3: Managers can view profiles of their direct reports only
CREATE POLICY "Managers can view direct reports profiles" 
ON public.profiles 
FOR SELECT 
USING (
  has_role_simple('manager'::app_role) 
  AND EXISTS (
    SELECT 1 FROM employee_info manager_ei, employee_info report_ei
    WHERE manager_ei.user_id = auth.uid()
    AND report_ei.user_id = profiles.user_id
    AND report_ei.manager_id = manager_ei.id
    AND manager_ei.organization_id = get_current_user_org_id()
  )
);

-- Policy 4: Directors can view profiles in their organization (for strategic oversight)
CREATE POLICY "Directors can view organization profiles" 
ON public.profiles 
FOR SELECT 
USING (
  has_role_simple('director'::app_role) 
  AND EXISTS (
    SELECT 1 FROM employee_info ei 
    WHERE ei.user_id = profiles.user_id 
    AND ei.organization_id = get_current_user_org_id()
  )
);