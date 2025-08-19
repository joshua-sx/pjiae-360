-- Fix the security definer view by removing the property and using RLS policies instead
ALTER VIEW public.employee_directory SET (security_barrier = false);

-- Create RLS policies for the employee_directory view
CREATE POLICY "employee_directory_select_policy" 
ON public.employee_directory 
FOR SELECT 
USING (
  organization_id = public.get_current_user_org_id() AND (
    -- HR roles see all
    public.has_role('admin') OR 
    public.has_role('director') OR
    -- Managers see their reports
    (public.has_role('manager') AND manager_id IN (
      SELECT id FROM public.employee_info 
      WHERE user_id = auth.uid() AND organization_id = public.get_current_user_org_id()
    )) OR
    -- Supervisors see same department
    (public.has_role('supervisor') AND department_id IN (
      SELECT department_id FROM public.employee_info 
      WHERE user_id = auth.uid() AND organization_id = public.get_current_user_org_id()
    )) OR
    -- Users see themselves
    user_id = auth.uid()
  )
);

-- Enable RLS on the view
ALTER VIEW public.employee_directory ENABLE ROW LEVEL SECURITY;