-- Fix critical security vulnerability in organizations table RLS policy
-- Remove the "OR true" condition that allows unrestricted access to all organization data

-- Drop the existing insecure policy
DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;

-- Create a new secure policy that only allows users to view organizations they belong to
CREATE POLICY "Users can view their organization" 
ON public.organizations 
FOR SELECT 
USING (
  id IN (
    SELECT DISTINCT ei.organization_id
    FROM public.employee_info ei
    WHERE ei.user_id = auth.uid()
  )
);

-- Ensure the policy for authenticated users creating organizations is still secure
-- (This one looks fine but let's verify it exists)
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;

CREATE POLICY "Authenticated users can create organizations" 
ON public.organizations 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Ensure the update policy is also secure
DROP POLICY IF EXISTS "Users can update their organization" ON public.organizations;

CREATE POLICY "Users can update their organization" 
ON public.organizations 
FOR UPDATE 
USING (
  id IN (
    SELECT DISTINCT ei.organization_id
    FROM public.employee_info ei
    WHERE ei.user_id = auth.uid()
  )
);