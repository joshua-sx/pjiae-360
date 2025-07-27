-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'director', 'manager', 'supervisor', 'employee');

-- Create status enums
CREATE TYPE public.employee_status AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE public.goal_status AS ENUM ('draft', 'active', 'completed', 'cancelled');
CREATE TYPE public.appraisal_status AS ENUM ('not_started', 'in_progress', 'completed', 'overdue');

-- Create organizations table
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    clerk_organization_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create divisions table
CREATE TABLE public.divisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create departments table
CREATE TABLE public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    division_id UUID REFERENCES public.divisions(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create employee_info table
CREATE TABLE public.employee_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    job_title TEXT,
    employee_id INTEGER,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    division_id UUID REFERENCES public.divisions(id) ON DELETE SET NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    status employee_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, organization_id),
    UNIQUE(email, organization_id)
);

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    role app_role NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role, organization_id)
);

-- Create goals table
CREATE TABLE public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    employee_id UUID REFERENCES public.employee_info(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    status goal_status DEFAULT 'draft',
    due_date DATE,
    weight INTEGER DEFAULT 0,
    type TEXT DEFAULT 'performance',
    year TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create appraisal_cycles table
CREATE TABLE public.appraisal_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    frequency TEXT DEFAULT 'annual',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create appraisals table
CREATE TABLE public.appraisals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employee_info(id) ON DELETE CASCADE,
    cycle_id UUID REFERENCES public.appraisal_cycles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    status appraisal_status DEFAULT 'not_started',
    admin_override_reason TEXT,
    admin_override_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, cycle_id)
);

-- Create competencies table
CREATE TABLE public.competencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT,
    old_values JSONB,
    new_values JSONB,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appraisal_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appraisals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user roles
CREATE OR REPLACE FUNCTION public.get_current_user_roles()
RETURNS app_role[] AS $$
  SELECT ARRAY_AGG(role) 
  FROM public.user_roles 
  WHERE user_id = auth.uid()::text;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create function to check if user has role
CREATE OR REPLACE FUNCTION public.has_role(_user_id TEXT, _role app_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create function to get user's organization
CREATE OR REPLACE FUNCTION public.get_user_organization(_user_id TEXT)
RETURNS UUID AS $$
  SELECT organization_id
  FROM public.employee_info
  WHERE user_id = _user_id
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for organizations
CREATE POLICY "Users can view their organization" ON public.organizations
  FOR SELECT USING (
    id = public.get_user_organization(auth.uid()::text)
  );

CREATE POLICY "Admins can manage organizations" ON public.organizations
  FOR ALL USING (
    public.has_role(auth.uid()::text, 'admin')
  );

-- RLS Policies for employee_info
CREATE POLICY "Users can view employees in their organization" ON public.employee_info
  FOR SELECT USING (
    organization_id = public.get_user_organization(auth.uid()::text)
  );

CREATE POLICY "Users can view their own profile" ON public.employee_info
  FOR SELECT USING (
    user_id = auth.uid()::text
  );

CREATE POLICY "Admins and directors can manage employees" ON public.employee_info
  FOR ALL USING (
    public.has_role(auth.uid()::text, 'admin') OR 
    public.has_role(auth.uid()::text, 'director')
  );

-- RLS Policies for user_roles
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (
    public.has_role(auth.uid()::text, 'admin')
  );

CREATE POLICY "Users can view roles in their organization" ON public.user_roles
  FOR SELECT USING (
    organization_id = public.get_user_organization(auth.uid()::text)
  );

-- RLS Policies for divisions and departments
CREATE POLICY "Users can view org structure" ON public.divisions
  FOR SELECT USING (
    organization_id = public.get_user_organization(auth.uid()::text)
  );

CREATE POLICY "Admins can manage divisions" ON public.divisions
  FOR ALL USING (
    public.has_role(auth.uid()::text, 'admin') OR 
    public.has_role(auth.uid()::text, 'director')
  );

CREATE POLICY "Users can view departments" ON public.departments
  FOR SELECT USING (
    organization_id = public.get_user_organization(auth.uid()::text)
  );

CREATE POLICY "Admins can manage departments" ON public.departments
  FOR ALL USING (
    public.has_role(auth.uid()::text, 'admin') OR 
    public.has_role(auth.uid()::text, 'director')
  );

-- RLS Policies for goals
CREATE POLICY "Users can view goals in their organization" ON public.goals
  FOR SELECT USING (
    organization_id = public.get_user_organization(auth.uid()::text)
  );

CREATE POLICY "Managers can manage goals" ON public.goals
  FOR ALL USING (
    public.has_role(auth.uid()::text, 'admin') OR 
    public.has_role(auth.uid()::text, 'director') OR
    public.has_role(auth.uid()::text, 'manager')
  );

-- RLS Policies for appraisals
CREATE POLICY "Users can view appraisals in their organization" ON public.appraisals
  FOR SELECT USING (
    organization_id = public.get_user_organization(auth.uid()::text)
  );

CREATE POLICY "Supervisors can manage appraisals" ON public.appraisals
  FOR ALL USING (
    public.has_role(auth.uid()::text, 'admin') OR 
    public.has_role(auth.uid()::text, 'director') OR
    public.has_role(auth.uid()::text, 'manager') OR
    public.has_role(auth.uid()::text, 'supervisor')
  );

-- RLS Policies for appraisal_cycles
CREATE POLICY "Users can view cycles in their organization" ON public.appraisal_cycles
  FOR SELECT USING (
    organization_id = public.get_user_organization(auth.uid()::text)
  );

CREATE POLICY "Admins can manage cycles" ON public.appraisal_cycles
  FOR ALL USING (
    public.has_role(auth.uid()::text, 'admin') OR 
    public.has_role(auth.uid()::text, 'director')
  );

-- RLS Policies for competencies
CREATE POLICY "Users can view competencies in their organization" ON public.competencies
  FOR SELECT USING (
    organization_id = public.get_user_organization(auth.uid()::text)
  );

CREATE POLICY "Admins can manage competencies" ON public.competencies
  FOR ALL USING (
    public.has_role(auth.uid()::text, 'admin') OR 
    public.has_role(auth.uid()::text, 'director')
  );

-- RLS Policies for audit_logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    public.has_role(auth.uid()::text, 'admin')
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_info_updated_at
    BEFORE UPDATE ON public.employee_info
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON public.goals
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appraisals_updated_at
    BEFORE UPDATE ON public.appraisals
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create RPC function for getting current user roles (for frontend)
CREATE OR REPLACE FUNCTION public.get_current_user_roles()
RETURNS TABLE(role app_role) AS $$
  SELECT ur.role
  FROM public.user_roles ur
  WHERE ur.user_id = auth.uid()::text;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create function to get user profile ID
CREATE OR REPLACE FUNCTION public.get_user_profile_id(_user_id TEXT DEFAULT NULL)
RETURNS UUID AS $$
  SELECT id
  FROM public.employee_info
  WHERE user_id = COALESCE(_user_id, auth.uid()::text)
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;