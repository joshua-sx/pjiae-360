-- Fix RLS policies that are too restrictive for legitimate import operations

-- 1. Add service role bypass for employee_info operations during import
-- Service role should be able to create employee records for any user
CREATE POLICY "Service role can manage all employee info" ON public.employee_info
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- 2. Add service role bypass for user_roles operations during import  
-- Service role should be able to assign any role to any user
CREATE POLICY "Service role can manage all user roles" ON public.user_roles
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- 3. Add service role policy for organizations
-- Service role should be able to create and manage organizations
CREATE POLICY "Service role can manage organizations" ON public.organizations
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- 4. Add service role policies for divisions and departments  
-- Service role should be able to create organizational structure
CREATE POLICY "Service role can manage divisions" ON public.divisions
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Service role can manage departments" ON public.departments
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- 5. Also allow authenticated users with admin role to create organizations
-- This supports manual organization creation through the UI
CREATE POLICY "Admins can create organizations" ON public.organizations
  FOR INSERT 
  TO authenticated
  WITH CHECK (has_role('admin'::app_role));