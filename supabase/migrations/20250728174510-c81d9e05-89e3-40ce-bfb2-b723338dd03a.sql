-- Fix organizations table RLS policies to allow organization creation
-- Add INSERT policy for organizations table to allow authenticated users to create organizations
CREATE POLICY "Users can create organizations" 
ON public.organizations 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Update existing policies to be more permissive for organization creation scenarios
-- Allow users to insert their own organization data during onboarding
DROP POLICY IF EXISTS "Users can view their own organization" ON public.organizations;
CREATE POLICY "Users can view their own organization" 
ON public.organizations 
FOR SELECT 
USING (id = get_current_user_org_id() OR id IN (
  SELECT DISTINCT organization_id 
  FROM employee_info 
  WHERE user_id = auth.uid()
));

-- Ensure users can update organizations they have access to
DROP POLICY IF EXISTS "Users can update their own organization" ON public.organizations;
CREATE POLICY "Users can update their own organization" 
ON public.organizations 
FOR UPDATE 
USING (id = get_current_user_org_id() OR id IN (
  SELECT DISTINCT organization_id 
  FROM employee_info 
  WHERE user_id = auth.uid()
));