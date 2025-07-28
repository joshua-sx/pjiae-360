-- Fix security warnings: Add missing RLS policies and fix function search paths

-- Add missing RLS policies for tables that need them

-- Cycle phases: Organization-scoped through cycle
CREATE POLICY "Users can view cycle phases in their organization" ON public.cycle_phases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.appraisal_cycles ac 
      WHERE ac.id = cycle_phases.cycle_id 
      AND ac.organization_id = public.get_current_user_org_id()
    )
  );

CREATE POLICY "Admins can manage cycle phases" ON public.cycle_phases
  FOR ALL USING (public.has_role('admin'));

-- Appraisals: Employee can see their own, managers can see their reports
CREATE POLICY "Users can view their own appraisals" ON public.appraisals
  FOR SELECT USING (
    employee_id IN (
      SELECT id FROM public.employee_info WHERE user_id = auth.uid()
    ) OR
    public.has_role('admin') OR
    public.has_role('manager')
  );

CREATE POLICY "Managers can manage appraisals" ON public.appraisals
  FOR ALL USING (public.has_role('admin') OR public.has_role('manager'));

-- Appraisal appraisers: Users can see where they're assigned as appraisers
CREATE POLICY "Users can view appraisal assignments" ON public.appraisal_appraisers
  FOR SELECT USING (
    appraiser_id IN (
      SELECT id FROM public.employee_info WHERE user_id = auth.uid()
    ) OR
    public.has_role('admin') OR
    public.has_role('manager')
  );

CREATE POLICY "Managers can manage appraisal assignments" ON public.appraisal_appraisers
  FOR ALL USING (public.has_role('admin') OR public.has_role('manager'));

-- Competencies: Organization-scoped
CREATE POLICY "Users can view competencies in their organization" ON public.competencies
  FOR SELECT USING (organization_id = public.get_current_user_org_id());

CREATE POLICY "Admins can manage competencies" ON public.competencies
  FOR ALL USING (public.has_role('admin'));

-- Appraisal competencies: Users can view their own scores
CREATE POLICY "Users can view appraisal competency scores" ON public.appraisal_competencies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.appraisals a 
      JOIN public.employee_info ei ON a.employee_id = ei.id
      WHERE a.id = appraisal_competencies.appraisal_id 
      AND (ei.user_id = auth.uid() OR public.has_role('admin') OR public.has_role('manager'))
    )
  );

CREATE POLICY "Managers can manage appraisal competency scores" ON public.appraisal_competencies
  FOR ALL USING (public.has_role('admin') OR public.has_role('manager'));

-- Goal assignments: Users can see their assigned goals
CREATE POLICY "Users can view their goal assignments" ON public.goal_assignments
  FOR SELECT USING (
    employee_id IN (
      SELECT id FROM public.employee_info WHERE user_id = auth.uid()
    ) OR
    public.has_role('admin') OR
    public.has_role('manager')
  );

CREATE POLICY "Managers can manage goal assignments" ON public.goal_assignments
  FOR ALL USING (public.has_role('admin') OR public.has_role('manager'));

-- Role permissions: Public read for role-based access control
CREATE POLICY "Everyone can view role permissions" ON public.role_permissions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage role permissions" ON public.role_permissions
  FOR ALL USING (public.has_role('admin'));

-- Import batches: Organization-scoped
CREATE POLICY "Users can view import batches in their organization" ON public.import_batches
  FOR SELECT USING (organization_id = public.get_current_user_org_id());

CREATE POLICY "Admins can manage import batches" ON public.import_batches
  FOR ALL USING (public.has_role('admin'));

-- Import mappings: Users can see mappings for their organization's imports
CREATE POLICY "Users can view import mappings" ON public.import_mappings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.import_batches ib 
      WHERE ib.id = import_mappings.batch_id 
      AND ib.organization_id = public.get_current_user_org_id()
    )
  );

CREATE POLICY "Admins can manage import mappings" ON public.import_mappings
  FOR ALL USING (public.has_role('admin'));

-- Fix function search paths for security

-- Update get_current_user_org_id function
CREATE OR REPLACE FUNCTION public.get_current_user_org_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT organization_id FROM public.employee_info WHERE user_id = auth.uid();
$$;

-- Update get_current_user_roles function
CREATE OR REPLACE FUNCTION public.get_current_user_roles()
RETURNS TABLE(role public.app_role)
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT ur.role FROM public.user_roles ur WHERE ur.user_id = auth.uid();
$$;

-- Update has_role function
CREATE OR REPLACE FUNCTION public.has_role(_role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = _role
  );
$$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only create profile if user has metadata with organization info
  IF NEW.raw_user_meta_data ? 'organization_id' THEN
    INSERT INTO public.employee_info (
      user_id,
      organization_id,
      status
    ) VALUES (
      NEW.id,
      (NEW.raw_user_meta_data->>'organization_id')::UUID,
      'pending'
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;