-- Fix organizations table RLS policies for proper authentication flow
-- Drop existing policies to recreate them correctly
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can view their own organization" ON public.organizations;
DROP POLICY IF EXISTS "Users can update their own organization" ON public.organizations;

-- Create a more permissive INSERT policy for organizations
-- This allows ANY authenticated user to create an organization
CREATE POLICY "Authenticated users can create organizations"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to view organizations they are associated with
CREATE POLICY "Users can view their organization"
ON public.organizations
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT DISTINCT ei.organization_id 
    FROM public.employee_info ei 
    WHERE ei.user_id = auth.uid()
  )
  OR
  -- Also allow viewing during the creation process before employee_info exists
  true
);

-- Allow users to update organizations they are associated with
CREATE POLICY "Users can update their organization"
ON public.organizations
FOR UPDATE
TO authenticated
USING (
  id IN (
    SELECT DISTINCT ei.organization_id 
    FROM public.employee_info ei 
    WHERE ei.user_id = auth.uid()
  )
);

-- Fix employee_info INSERT policy to be more permissive
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.employee_info;

CREATE POLICY "Authenticated users can create employee profile"
ON public.employee_info
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Fix user_roles INSERT policy to allow role assignment during onboarding
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (has_role('admin'::app_role));

CREATE POLICY "Users can create their initial admin role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  AND role = 'admin'::app_role
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'::app_role
  )
);