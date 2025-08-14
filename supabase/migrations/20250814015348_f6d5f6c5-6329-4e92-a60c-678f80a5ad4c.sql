-- Fix security vulnerability: Restrict profile access to follow principle of least privilege
-- Current policy allows any employee to view all other employees' email addresses and personal info
-- New policy restricts access to only necessary roles and relationships

-- Drop the overly permissive current policy
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;

-- Create more restrictive policies following security best practices

-- 1. Users can always view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());

-- 2. Admins and directors can view all profiles in their organization (HR functions)
CREATE POLICY "Admins and directors can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  (has_role_simple('admin'::app_role) OR has_role_simple('director'::app_role))
  AND EXISTS (
    SELECT 1 FROM employee_info ei1, employee_info ei2
    WHERE ei1.user_id = auth.uid() 
      AND ei2.user_id = profiles.user_id
      AND ei1.organization_id = ei2.organization_id
  )
);

-- 3. Managers can view profiles of their direct reports only
CREATE POLICY "Managers can view direct reports profiles" 
ON public.profiles 
FOR SELECT 
USING (
  has_role_simple('manager'::app_role)
  AND user_id IN (
    SELECT ei_report.user_id
    FROM employee_info ei_manager
    JOIN employee_info ei_report ON ei_report.manager_id = ei_manager.id
    WHERE ei_manager.user_id = auth.uid()
  )
);

-- 4. For collaboration purposes, allow viewing of basic display info (name only) 
-- but NOT email addresses for same organization employees
-- This is implemented by creating a view for safe profile data
CREATE OR REPLACE VIEW public.employee_directory AS
SELECT 
  p.id,
  p.user_id,
  p.first_name,
  p.last_name,
  -- Only show email to privileged users or self
  CASE 
    WHEN p.user_id = auth.uid() 
         OR has_role_simple('admin'::app_role) 
         OR has_role_simple('director'::app_role)
         OR (has_role_simple('manager'::app_role) AND p.user_id IN (
           SELECT ei_report.user_id
           FROM employee_info ei_manager
           JOIN employee_info ei_report ON ei_report.manager_id = ei_manager.id
           WHERE ei_manager.user_id = auth.uid()
         ))
    THEN p.email
    ELSE NULL
  END as email,
  p.avatar_url,
  ei.job_title,
  d.name as department_name,
  div.name as division_name
FROM public.profiles p
LEFT JOIN public.employee_info ei ON ei.user_id = p.user_id
LEFT JOIN public.departments d ON d.id = ei.department_id
LEFT JOIN public.divisions div ON div.id = ei.division_id
WHERE EXISTS (
  SELECT 1 FROM employee_info ei1, employee_info ei2
  WHERE ei1.user_id = auth.uid() 
    AND ei2.user_id = p.user_id
    AND ei1.organization_id = ei2.organization_id
);

-- Enable RLS on the view
ALTER VIEW public.employee_directory ENABLE ROW LEVEL SECURITY;

-- Allow employees to view the directory (with limited email access)
CREATE POLICY "Employees can view directory" 
ON public.employee_directory 
FOR SELECT 
USING (true);

-- Log this security improvement
INSERT INTO public.security_audit_log (
  user_id, event_type, event_details, success
) VALUES (
  NULL, 'security_policy_update',
  jsonb_build_object(
    'action', 'restricted_profile_access',
    'description', 'Fixed security vulnerability: restricted profile access to follow principle of least privilege',
    'previous_policy', 'all_organization_members',
    'new_policy', 'role_based_and_relationship_based'
  ), true
);