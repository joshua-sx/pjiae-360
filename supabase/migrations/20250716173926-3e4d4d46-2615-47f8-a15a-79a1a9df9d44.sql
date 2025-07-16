-- Create comprehensive RLS policies for role-based access

-- Create security definer functions for role-based access
CREATE OR REPLACE FUNCTION public.get_current_user_roles()
RETURNS TABLE(role public.app_role) AS $$
BEGIN
  RETURN QUERY
  SELECT ur.role
  FROM public.user_roles ur
  JOIN public.profiles p ON p.id = ur.profile_id
  WHERE p.user_id = auth.uid()
  AND ur.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.has_role(_role public.app_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.profile_id
    WHERE p.user_id = auth.uid()
    AND ur.role = _role
    AND ur.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_profile_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id
    FROM public.profiles
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_direct_reports(_profile_id UUID)
RETURNS TABLE(profile_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT id
  FROM public.profiles
  WHERE manager_id = _profile_id
  AND organization_id = get_user_organization_id();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_division_employees(_profile_id UUID)
RETURNS TABLE(profile_id UUID) AS $$
DECLARE
  user_division_id UUID;
BEGIN
  -- Get the user's division
  SELECT division_id INTO user_division_id
  FROM public.profiles
  WHERE id = _profile_id;
  
  RETURN QUERY
  SELECT id
  FROM public.profiles
  WHERE division_id = user_division_id
  AND organization_id = get_user_organization_id();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Update Goals table RLS policies
DROP POLICY IF EXISTS "Organization access" ON public.goals;

CREATE POLICY "Admin full access to goals" ON public.goals
FOR ALL USING (has_role('admin'));

CREATE POLICY "Director division access to goals" ON public.goals
FOR ALL USING (
  has_role('director') AND 
  employee_id IN (SELECT profile_id FROM get_division_employees(get_user_profile_id()))
);

CREATE POLICY "Manager team access to goals" ON public.goals
FOR ALL USING (
  (has_role('manager') OR has_role('supervisor')) AND 
  (employee_id = get_user_profile_id() OR 
   employee_id IN (SELECT profile_id FROM get_direct_reports(get_user_profile_id())))
);

CREATE POLICY "Employee personal access to goals" ON public.goals
FOR ALL USING (
  has_role('employee') AND 
  employee_id = get_user_profile_id()
);

-- Update Appraisals table RLS policies
DROP POLICY IF EXISTS "Organization access" ON public.appraisals;

CREATE POLICY "Admin full access to appraisals" ON public.appraisals
FOR ALL USING (has_role('admin'));

CREATE POLICY "Director division access to appraisals" ON public.appraisals
FOR ALL USING (
  has_role('director') AND 
  employee_id IN (SELECT profile_id FROM get_division_employees(get_user_profile_id()))
);

CREATE POLICY "Manager team access to appraisals" ON public.appraisals
FOR ALL USING (
  (has_role('manager') OR has_role('supervisor')) AND 
  (employee_id = get_user_profile_id() OR 
   employee_id IN (SELECT profile_id FROM get_direct_reports(get_user_profile_id())))
);

CREATE POLICY "Employee personal access to appraisals" ON public.appraisals
FOR ALL USING (
  has_role('employee') AND 
  employee_id = get_user_profile_id()
);