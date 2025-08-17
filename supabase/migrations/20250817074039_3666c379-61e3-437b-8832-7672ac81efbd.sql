-- Add organization settings table
CREATE TABLE public.organization_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  industry TEXT,
  company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-1000', '1000+')),
  locale TEXT DEFAULT 'en-US',
  timezone TEXT DEFAULT 'UTC',
  currency TEXT DEFAULT 'USD',
  work_week JSONB DEFAULT '{"monday": true, "tuesday": true, "wednesday": true, "thursday": true, "friday": true, "saturday": false, "sunday": false}',
  fiscal_year_start DATE DEFAULT '2024-01-01',
  public_holidays TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id)
);

-- Enable RLS
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their organization settings" 
ON public.organization_settings 
FOR SELECT 
USING (organization_id = get_current_user_org_id());

CREATE POLICY "Admins can manage organization settings" 
ON public.organization_settings 
FOR ALL 
USING (has_role('admin') AND organization_id = get_current_user_org_id())
WITH CHECK (has_role('admin') AND organization_id = get_current_user_org_id());

-- Add notification settings table
CREATE TABLE public.notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  from_email TEXT,
  from_name TEXT,
  default_reminder_days INTEGER DEFAULT 7,
  escalation_days INTEGER DEFAULT 14,
  channels JSONB DEFAULT '{"email": true, "in_app": true}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id)
);

-- Enable RLS
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their notification settings" 
ON public.notification_settings 
FOR SELECT 
USING (organization_id = get_current_user_org_id());

CREATE POLICY "Admins can manage notification settings" 
ON public.notification_settings 
FOR ALL 
USING (has_role('admin') AND organization_id = get_current_user_org_id())
WITH CHECK (has_role('admin') AND organization_id = get_current_user_org_id());

-- Add new fields to employee_info
ALTER TABLE public.employee_info 
ADD COLUMN employee_number TEXT,
ADD COLUMN phone_number TEXT,
ADD COLUMN employment_type TEXT CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'intern')),
ADD COLUMN location TEXT,
ADD COLUMN cost_center TEXT,
ADD COLUMN start_date DATE,
ADD COLUMN probation_end_date DATE;

-- Add new fields to profiles for admin info
ALTER TABLE public.profiles 
ADD COLUMN job_title TEXT,
ADD COLUMN phone_number TEXT,
ADD COLUMN preferred_communication TEXT DEFAULT 'email';

-- Add consent tracking table
CREATE TABLE public.user_consents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  consent_type TEXT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT true,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own consents" 
ON public.user_consents 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own consents" 
ON public.user_consents 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view consents in their organization" 
ON public.user_consents 
FOR SELECT 
USING (has_role('admin') AND organization_id = get_current_user_org_id());

-- Add rating scales table for appraisal cycles
CREATE TABLE public.rating_scales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  scale_type TEXT NOT NULL CHECK (scale_type IN ('numeric', 'descriptive')),
  min_value INTEGER,
  max_value INTEGER,
  scale_points JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rating_scales ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view rating scales in their organization" 
ON public.rating_scales 
FOR SELECT 
USING (organization_id = get_current_user_org_id());

CREATE POLICY "Admins can manage rating scales" 
ON public.rating_scales 
FOR ALL 
USING (has_role('admin') AND organization_id = get_current_user_org_id())
WITH CHECK (has_role('admin') AND organization_id = get_current_user_org_id());

-- Add rating scale reference to appraisal cycles
ALTER TABLE public.appraisal_cycles 
ADD COLUMN rating_scale_id UUID REFERENCES public.rating_scales(id),
ADD COLUMN goal_weight_percentage INTEGER DEFAULT 70 CHECK (goal_weight_percentage >= 0 AND goal_weight_percentage <= 100),
ADD COLUMN competency_weight_percentage INTEGER DEFAULT 30 CHECK (competency_weight_percentage >= 0 AND competency_weight_percentage <= 100),
ADD COLUMN calibration_window_days INTEGER DEFAULT 7;

-- Add trigger to update timestamps
CREATE TRIGGER update_organization_settings_updated_at
BEFORE UPDATE ON public.organization_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at
BEFORE UPDATE ON public.notification_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rating_scales_updated_at
BEFORE UPDATE ON public.rating_scales
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();