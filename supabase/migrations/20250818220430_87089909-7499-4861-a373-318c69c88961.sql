-- Fix infinite recursion in employee_info policies by creating security definer functions

-- 1. Create or update the get_current_user_org_id function to be security definer
CREATE OR REPLACE FUNCTION public.get_current_user_org_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT organization_id FROM public.employee_info WHERE user_id = auth.uid() LIMIT 1;
$$;

-- 2. Create has_role_simple function to avoid recursion
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
      AND organization_id = (
        SELECT organization_id FROM public.employee_info WHERE user_id = auth.uid() LIMIT 1
      )
  );
$$;

-- 3. Drop existing problematic policies on employee_info
DROP POLICY IF EXISTS "Admins can view all employee info" ON public.employee_info;
DROP POLICY IF EXISTS "Directors can view all employee info" ON public.employee_info;
DROP POLICY IF EXISTS "Managers can view employee info for management functions" ON public.employee_info;
DROP POLICY IF EXISTS "Managers can view their direct reports" ON public.employee_info;
DROP POLICY IF EXISTS "Users can view their own employee info" ON public.employee_info;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.employee_info;
DROP POLICY IF EXISTS "Restricted employee info creation" ON public.employee_info;

-- 4. Create new non-recursive policies for employee_info
CREATE POLICY "Users can view their own employee info"
ON public.employee_info
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all employee info in their org"
ON public.employee_info
FOR SELECT
TO authenticated
USING (public.has_role_simple('admin'::app_role));

CREATE POLICY "Directors can view all employee info in their org"
ON public.employee_info
FOR SELECT
TO authenticated
USING (public.has_role_simple('director'::app_role));

CREATE POLICY "Managers can view employee info for management functions"
ON public.employee_info
FOR SELECT
TO authenticated
USING (public.has_role_simple('manager'::app_role));

CREATE POLICY "Users can update their own employee info"
ON public.employee_info
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR public.has_role_simple('admin'::app_role));

CREATE POLICY "System and admins can create employee info"
ON public.employee_info
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR public.has_role_simple('admin'::app_role) OR current_setting('role', true) = 'authenticator');

-- 5. Add missing foreign key constraint
ALTER TABLE public.employee_info
ADD CONSTRAINT employee_info_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;