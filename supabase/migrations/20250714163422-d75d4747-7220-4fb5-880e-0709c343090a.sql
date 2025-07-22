-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create organizations table for multi-tenancy
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create roles table
CREATE TABLE public.roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create divisions table
CREATE TABLE public.divisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  division_id UUID REFERENCES public.divisions(id),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  name TEXT GENERATED ALWAYS AS (COALESCE(first_name || ' ' || last_name, first_name, last_name, email)) STORED,
  role_id UUID REFERENCES public.roles(id),
  division_id UUID REFERENCES public.divisions(id),
  department_id UUID REFERENCES public.departments(id),
  manager_id UUID REFERENCES public.profiles(id),
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create performance cycles table
CREATE TABLE public.cycles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('annual', 'biannual', 'quarterly', 'custom')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create review periods table
CREATE TABLE public.periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  cycle_id UUID NOT NULL REFERENCES public.cycles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create division goals table
CREATE TABLE public.division_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  cycle_id UUID NOT NULL REFERENCES public.cycles(id) ON DELETE CASCADE,
  division_id UUID NOT NULL REFERENCES public.divisions(id),
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create competencies table
CREATE TABLE public.competencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create goals table
CREATE TABLE public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  manager_id UUID NOT NULL REFERENCES public.profiles(id),
  supervisor_id UUID REFERENCES public.profiles(id),
  cycle_id UUID NOT NULL REFERENCES public.cycles(id) ON DELETE CASCADE,
  period_id UUID NOT NULL REFERENCES public.periods(id) ON DELETE CASCADE,
  division_goal_id UUID REFERENCES public.division_goals(id),
  title TEXT NOT NULL,
  description TEXT,
  success_criteria TEXT,
  weight NUMERIC NOT NULL DEFAULT 1 CHECK (weight > 0),
  progress NUMERIC DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  type TEXT NOT NULL CHECK (type IN ('manager_assigned', 'supervisor_assigned', 'employee_suggested', 'collaborative')),
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appraisals table
CREATE TABLE public.appraisals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  cycle_id UUID NOT NULL REFERENCES public.cycles(id) ON DELETE CASCADE,
  period_id UUID NOT NULL REFERENCES public.periods(id) ON DELETE CASCADE,
  overall_score NUMERIC CHECK (overall_score BETWEEN 1 AND 5),
  comments TEXT,
  employee_comments TEXT,
  manager_comments TEXT,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'submitted', 'completed', 'locked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, period_id)
);

-- Create appraisal appraisers table
CREATE TABLE public.appraisal_appraisers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  appraisal_id UUID NOT NULL REFERENCES public.appraisals(id) ON DELETE CASCADE,
  appraiser_id UUID NOT NULL REFERENCES public.profiles(id),
  is_primary BOOLEAN NOT NULL DEFAULT false,
  assigned_by UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'declined')),
  comments TEXT,
  signed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create goal ratings table
CREATE TABLE public.goal_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  appraisal_id UUID NOT NULL REFERENCES public.appraisals(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES public.goals(id),
  appraiser_id UUID NOT NULL REFERENCES public.profiles(id),
  score NUMERIC NOT NULL CHECK (score BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create competency ratings table
CREATE TABLE public.competency_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  appraisal_id UUID NOT NULL REFERENCES public.appraisals(id) ON DELETE CASCADE,
  competency_id UUID NOT NULL REFERENCES public.competencies(id),
  appraiser_id UUID NOT NULL REFERENCES public.profiles(id),
  score NUMERIC NOT NULL CHECK (score BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.division_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appraisals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appraisal_appraisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competency_ratings ENABLE ROW LEVEL SECURITY;

-- Create function to get user's organization
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create RLS policies for organizations
CREATE POLICY "Users can view their own organization" ON public.organizations
  FOR SELECT USING (id = public.get_user_organization_id());

CREATE POLICY "Users can update their own organization" ON public.organizations
  FOR UPDATE USING (id = public.get_user_organization_id());

-- Create RLS policies for profiles
CREATE POLICY "Users can view profiles in their organization" ON public.profiles
  FOR SELECT USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Create RLS policies for all other tables (organization-scoped)
CREATE POLICY "Organization access" ON public.roles
  FOR ALL USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Organization access" ON public.divisions
  FOR ALL USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Organization access" ON public.departments
  FOR ALL USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Organization access" ON public.cycles
  FOR ALL USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Organization access" ON public.periods
  FOR ALL USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Organization access" ON public.division_goals
  FOR ALL USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Organization access" ON public.competencies
  FOR ALL USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Organization access" ON public.goals
  FOR ALL USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Organization access" ON public.appraisals
  FOR ALL USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Organization access" ON public.appraisal_appraisers
  FOR ALL USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Organization access" ON public.goal_ratings
  FOR ALL USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Organization access" ON public.competency_ratings
  FOR ALL USING (organization_id = public.get_user_organization_id());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cycles_updated_at BEFORE UPDATE ON public.cycles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_division_goals_updated_at BEFORE UPDATE ON public.division_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appraisals_updated_at BEFORE UPDATE ON public.appraisals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration

-- Create indexes for performance
CREATE INDEX idx_profiles_organization_id ON public.profiles(organization_id);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_manager_id ON public.profiles(manager_id);
CREATE INDEX idx_goals_employee_id ON public.goals(employee_id);
CREATE INDEX idx_goals_manager_id ON public.goals(manager_id);
CREATE INDEX idx_goals_cycle_id ON public.goals(cycle_id);
CREATE INDEX idx_appraisals_employee_id ON public.appraisals(employee_id);
CREATE INDEX idx_appraisals_period_id ON public.appraisals(period_id);