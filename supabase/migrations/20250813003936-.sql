-- Fix security vulnerabilities in permission system tables
-- Remove public access to sensitive permission structure data

-- 1. Fix permissions table - restrict from public to authenticated organization users
DROP POLICY IF EXISTS "Everyone can view permissions" ON public.permissions;
DROP POLICY IF EXISTS "Admins can manage permissions" ON public.permissions;

CREATE POLICY "Authenticated users can view permissions" 
ON public.permissions 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage permissions" 
ON public.permissions 
FOR ALL 
USING (has_role('admin'::app_role))
WITH CHECK (has_role('admin'::app_role));

-- 2. Fix role_permissions table - restrict from public to authenticated users  
DROP POLICY IF EXISTS "Everyone can view role permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Admins can manage role permissions" ON public.role_permissions;

CREATE POLICY "Authenticated users can view role permissions" 
ON public.role_permissions 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage role permissions" 
ON public.role_permissions 
FOR ALL 
USING (has_role('admin'::app_role))
WITH CHECK (has_role('admin'::app_role));

-- 3. Fix roles table - restrict from public to authenticated users
DROP POLICY IF EXISTS "Everyone can view roles reference" ON public.roles;

CREATE POLICY "Authenticated users can view roles reference" 
ON public.roles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);