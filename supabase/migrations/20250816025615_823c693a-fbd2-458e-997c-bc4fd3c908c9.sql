
-- Fix recursion by avoiding direct reference to employee_info inside organizations policies

-- Drop old policies
DROP POLICY IF EXISTS "Users can update their organization" ON public.organizations;
DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;

-- Recreate with a safe function that resolves the current user's org
CREATE POLICY "Users can view their organization"
  ON public.organizations
  FOR SELECT
  USING (id = public.get_current_user_org_id());

CREATE POLICY "Users can update their organization"
  ON public.organizations
  FOR UPDATE
  USING (id = public.get_current_user_org_id())
  WITH CHECK (id = public.get_current_user_org_id());
