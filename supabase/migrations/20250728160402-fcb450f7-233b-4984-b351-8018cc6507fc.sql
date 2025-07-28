-- Phase 1: Create Enum Types
CREATE TYPE public.org_status AS ENUM ('active', 'inactive');
CREATE TYPE public.user_status AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE public.cycle_status AS ENUM ('draft', 'active', 'completed');
CREATE TYPE public.appraisal_phase AS ENUM ('goal_setting', 'mid_term', 'year_end');
CREATE TYPE public.appraisal_status AS ENUM ('draft', 'in_progress', 'completed', 'approved');
CREATE TYPE public.app_role AS ENUM ('admin', 'director', 'manager', 'supervisor', 'employee');

-- Phase 2: Core Tables

-- Organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  status org_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Divisions table
CREATE TABLE public.divisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, name)
);

-- Departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  division_id UUID REFERENCES public.divisions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, name)
);

-- Employee info table (user profiles)
CREATE TABLE public.employee_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id),
  division_id UUID REFERENCES public.divisions(id),
  manager_id UUID REFERENCES public.employee_info(id),
  employee_number TEXT,
  job_title TEXT,
  hire_date DATE,
  status user_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, employee_number),
  UNIQUE(user_id, organization_id)
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role, organization_id)
);

-- Phase 3: Appraisal System

-- Appraisal cycles
CREATE TABLE public.appraisal_cycles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  year INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status cycle_status NOT NULL DEFAULT 'draft',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, year),
  CHECK (start_date < end_date)
);

-- Cycle phases
CREATE TABLE public.cycle_phases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cycle_id UUID NOT NULL REFERENCES public.appraisal_cycles(id) ON DELETE CASCADE,
  phase appraisal_phase NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(cycle_id, phase),
  CHECK (start_date < end_date)
);

-- Appraisals
CREATE TABLE public.appraisals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employee_info(id) ON DELETE CASCADE,
  cycle_id UUID NOT NULL REFERENCES public.appraisal_cycles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  phase appraisal_phase NOT NULL DEFAULT 'goal_setting',
  status appraisal_status NOT NULL DEFAULT 'draft',
  self_assessment_completed BOOLEAN NOT NULL DEFAULT false,
  manager_review_completed BOOLEAN NOT NULL DEFAULT false,
  final_rating INTEGER CHECK (final_rating BETWEEN 1 AND 5),
  overall_feedback TEXT,
  development_goals TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, cycle_id, phase)
);

-- Appraisal appraisers (many-to-many)
CREATE TABLE public.appraisal_appraisers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appraisal_id UUID NOT NULL REFERENCES public.appraisals(id) ON DELETE CASCADE,
  appraiser_id UUID NOT NULL REFERENCES public.employee_info(id),
  role TEXT NOT NULL DEFAULT 'primary',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(appraisal_id, appraiser_id)
);

-- Competencies
CREATE TABLE public.competencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, code)
);

-- Appraisal competency scores
CREATE TABLE public.appraisal_competencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appraisal_id UUID NOT NULL REFERENCES public.appraisals(id) ON DELETE CASCADE,
  competency_id UUID NOT NULL REFERENCES public.competencies(id),
  score INTEGER CHECK (score BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(appraisal_id, competency_id)
);

-- Goals
CREATE TABLE public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'individual',
  status TEXT NOT NULL DEFAULT 'draft',
  priority TEXT NOT NULL DEFAULT 'medium',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  created_by UUID NOT NULL REFERENCES public.employee_info(id),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK (start_date <= due_date)
);

-- Goal assignments
CREATE TABLE public.goal_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employee_info(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES public.employee_info(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(goal_id, employee_id)
);

-- Phase 4: Permission System

-- Permissions
CREATE TABLE public.permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Role permissions
CREATE TABLE public.role_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role app_role NOT NULL,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role, permission_id)
);

-- Phase 5: Import Tracking

-- Import batches
CREATE TABLE public.import_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES public.employee_info(id),
  total_records INTEGER NOT NULL DEFAULT 0,
  successful_records INTEGER NOT NULL DEFAULT 0,
  failed_records INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'processing',
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Import mappings
CREATE TABLE public.import_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.import_batches(id) ON DELETE CASCADE,
  csv_column TEXT NOT NULL,
  field_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(batch_id, csv_column)
);

-- Phase 6: Indexes for Performance

CREATE INDEX idx_employee_info_org_id ON public.employee_info(organization_id);
CREATE INDEX idx_employee_info_user_id ON public.employee_info(user_id);
CREATE INDEX idx_employee_info_manager_id ON public.employee_info(manager_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_org_id ON public.user_roles(organization_id);
CREATE INDEX idx_appraisals_employee_id ON public.appraisals(employee_id);
CREATE INDEX idx_appraisals_cycle_id ON public.appraisals(cycle_id);
CREATE INDEX idx_appraisals_org_id ON public.appraisals(organization_id);
CREATE INDEX idx_goals_org_id ON public.goals(organization_id);
CREATE INDEX idx_goal_assignments_employee_id ON public.goal_assignments(employee_id);

-- Phase 7: Enable RLS on all tables

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appraisal_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appraisals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appraisal_appraisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appraisal_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_mappings ENABLE ROW LEVEL SECURITY;

-- Phase 8: Helper Functions

-- Function to get current user's organization ID
CREATE OR REPLACE FUNCTION public.get_current_user_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM public.employee_info WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Function to get current user's roles
CREATE OR REPLACE FUNCTION public.get_current_user_roles()
RETURNS TABLE(role app_role) AS $$
  SELECT ur.role FROM public.user_roles ur WHERE ur.user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Function to check if user has role
CREATE OR REPLACE FUNCTION public.has_role(_role app_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = _role
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Phase 9: Basic RLS Policies

-- Organizations: Users can only see their own organization
CREATE POLICY "Users can view their own organization" ON public.organizations
  FOR SELECT USING (id = public.get_current_user_org_id());

CREATE POLICY "Users can update their own organization" ON public.organizations
  FOR UPDATE USING (id = public.get_current_user_org_id());

-- Employee info: Users can see employees from their organization
CREATE POLICY "Users can view employees from their organization" ON public.employee_info
  FOR SELECT USING (organization_id = public.get_current_user_org_id());

CREATE POLICY "Users can insert their own profile" ON public.employee_info
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.employee_info
  FOR UPDATE USING (user_id = auth.uid() OR public.has_role('admin'));

-- User roles: Users can see roles in their organization
CREATE POLICY "Users can view roles in their organization" ON public.user_roles
  FOR SELECT USING (organization_id = public.get_current_user_org_id());

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role('admin'));

-- Divisions and departments: Organization-scoped
CREATE POLICY "Users can view divisions in their organization" ON public.divisions
  FOR SELECT USING (organization_id = public.get_current_user_org_id());

CREATE POLICY "Admins can manage divisions" ON public.divisions
  FOR ALL USING (public.has_role('admin'));

CREATE POLICY "Users can view departments in their organization" ON public.departments
  FOR SELECT USING (organization_id = public.get_current_user_org_id());

CREATE POLICY "Admins can manage departments" ON public.departments
  FOR ALL USING (public.has_role('admin'));

-- Appraisal cycles: Organization-scoped
CREATE POLICY "Users can view cycles in their organization" ON public.appraisal_cycles
  FOR SELECT USING (organization_id = public.get_current_user_org_id());

CREATE POLICY "Admins can manage cycles" ON public.appraisal_cycles
  FOR ALL USING (public.has_role('admin'));

-- Goals: Organization-scoped
CREATE POLICY "Users can view goals in their organization" ON public.goals
  FOR SELECT USING (organization_id = public.get_current_user_org_id());

CREATE POLICY "Users can create goals" ON public.goals
  FOR INSERT WITH CHECK (organization_id = public.get_current_user_org_id());

-- Permissions: Public read, admin manage
CREATE POLICY "Everyone can view permissions" ON public.permissions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage permissions" ON public.permissions
  FOR ALL USING (public.has_role('admin'));

-- Phase 10: Trigger for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Phase 11: Update timestamp triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers to tables with updated_at columns
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_divisions_updated_at
  BEFORE UPDATE ON public.divisions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_info_updated_at
  BEFORE UPDATE ON public.employee_info
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appraisal_cycles_updated_at
  BEFORE UPDATE ON public.appraisal_cycles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appraisals_updated_at
  BEFORE UPDATE ON public.appraisals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();