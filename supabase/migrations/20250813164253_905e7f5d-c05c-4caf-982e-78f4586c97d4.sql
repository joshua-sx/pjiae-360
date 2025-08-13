-- Fix infinite recursion in RLS policies by creating organization-agnostic role check

-- Create a simple role check function that doesn't depend on organization context
CREATE OR REPLACE FUNCTION public.has_role_simple(_role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
      AND role = _role 
      AND is_active = true
  );
$$;

-- Update the organization-dependent has_role function to be more explicit
CREATE OR REPLACE FUNCTION public.has_role(_role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
      AND role = _role 
      AND is_active = true
      AND organization_id = public.get_current_user_org_id()
  );
$$;

-- Drop and recreate employee_info RLS policies to fix recursion
DROP POLICY IF EXISTS "Users can view their own employee info" ON public.employee_info;
DROP POLICY IF EXISTS "HR roles can view all employee info" ON public.employee_info;
DROP POLICY IF EXISTS "Managers can view employee info for management functions" ON public.employee_info;
DROP POLICY IF EXISTS "Managers can view their direct reports" ON public.employee_info;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.employee_info;
DROP POLICY IF EXISTS "Authenticated users can create employee profile" ON public.employee_info;

-- Recreate policies using the simple role check to avoid recursion
CREATE POLICY "Users can view their own employee info" 
ON public.employee_info 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all employee info" 
ON public.employee_info 
FOR SELECT 
USING (public.has_role_simple('admin'::app_role));

CREATE POLICY "Directors can view all employee info" 
ON public.employee_info 
FOR SELECT 
USING (public.has_role_simple('director'::app_role));

CREATE POLICY "Managers can view employee info for management functions" 
ON public.employee_info 
FOR SELECT 
USING (public.has_role_simple('manager'::app_role));

CREATE POLICY "Managers can view their direct reports" 
ON public.employee_info 
FOR SELECT 
USING (manager_id IN (
  SELECT ei.id 
  FROM public.employee_info ei 
  WHERE ei.user_id = auth.uid()
));

CREATE POLICY "Users can update their own profile" 
ON public.employee_info 
FOR UPDATE 
USING (user_id = auth.uid() OR public.has_role_simple('admin'::app_role));

CREATE POLICY "Authenticated users can create employee profile" 
ON public.employee_info 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Update other policies that might cause recursion issues
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;

CREATE POLICY "Users can view profiles in their organization" 
ON public.profiles 
FOR SELECT 
USING (
  user_id = auth.uid() 
  OR public.has_role_simple('admin'::app_role)
  OR public.has_role_simple('director'::app_role)
  OR public.has_role_simple('manager'::app_role)
  OR EXISTS (
    SELECT 1 
    FROM public.employee_info ei1, public.employee_info ei2
    WHERE ei1.user_id = auth.uid() 
      AND ei2.user_id = profiles.user_id 
      AND ei1.organization_id = ei2.organization_id
  )
);