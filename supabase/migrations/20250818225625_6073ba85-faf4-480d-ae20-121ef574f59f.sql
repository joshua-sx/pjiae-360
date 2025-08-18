
-- 1) Make get_current_user_org_id safe (no employee_info reads)
CREATE OR REPLACE FUNCTION public.get_current_user_org_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT ur.organization_id
  FROM public.user_roles ur
  WHERE ur.user_id = auth.uid()
    AND ur.is_active = true
  LIMIT 1
$$;

-- 2) Drop ALL existing policies on employee_info to remove recursive ones
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'employee_info'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.employee_info', pol.policyname);
  END LOOP;
END $$;

-- 3) Ensure RLS is enabled
ALTER TABLE public.employee_info ENABLE ROW LEVEL SECURITY;

-- 4) Recreate safe, non-recursive policies using user_roles only

-- SELECT: Users can read their own row
CREATE POLICY employee_info_select_self
  ON public.employee_info
  FOR SELECT
  USING (user_id = auth.uid());

-- SELECT: Org roles (admin/director/manager/supervisor) can read within their org
CREATE POLICY employee_info_select_org_roles
  ON public.employee_info
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.is_active = true
        AND ur.organization_id = employee_info.organization_id
        AND ur.role IN ('admin','director','manager','supervisor')
    )
  );

-- INSERT: A user may insert their own record (e.g., RPCs that set user_id = auth.uid())
CREATE POLICY employee_info_insert_self
  ON public.employee_info
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- INSERT: Admins/Directors may insert employees for their org (including invited users with NULL user_id)
CREATE POLICY employee_info_insert_org_admins
  ON public.employee_info
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.is_active = true
        AND ur.organization_id = employee_info.organization_id
        AND ur.role IN ('admin','director')
    )
  );

-- UPDATE: Users may update their own row
CREATE POLICY employee_info_update_self
  ON public.employee_info
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- UPDATE: Admins/Directors may update rows in their org
CREATE POLICY employee_info_update_org_admins
  ON public.employee_info
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.is_active = true
        AND ur.organization_id = employee_info.organization_id
        AND ur.role IN ('admin','director')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.is_active = true
        AND ur.organization_id = employee_info.organization_id
        AND ur.role IN ('admin','director')
    )
  );

-- DELETE: Admins/Directors may delete rows in their org
CREATE POLICY employee_info_delete_org_admins
  ON public.employee_info
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.is_active = true
        AND ur.organization_id = employee_info.organization_id
        AND ur.role IN ('admin','director')
    )
  );

-- 5) Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
