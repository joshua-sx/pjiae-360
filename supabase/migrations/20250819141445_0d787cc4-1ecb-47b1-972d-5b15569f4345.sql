-- Phase 1: Add tables for invitation tracking and import error handling

-- Table for tracking email sends and their status
CREATE TABLE public.invitation_sends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_id UUID NOT NULL REFERENCES public.employee_invitations(id) ON DELETE CASCADE,
  correlation_id UUID NOT NULL DEFAULT gen_random_uuid(),
  email_type TEXT NOT NULL DEFAULT 'initial', -- initial, reminder_3d, reminder_7d, reminder_14d
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'sent', -- sent, delivered, bounced, failed
  provider_message_id TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for detailed import errors
CREATE TABLE public.import_errors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.import_batches(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,
  email TEXT,
  error_code TEXT NOT NULL,
  error_message TEXT NOT NULL,
  field_name TEXT,
  field_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add status tracking to import_batches
ALTER TABLE public.import_batches 
ADD COLUMN IF NOT EXISTS detailed_status JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS correlation_id UUID DEFAULT gen_random_uuid();

-- Table for org-specific CSV mapping presets
CREATE TABLE public.csv_mapping_presets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Default Mapping',
  column_mappings JSONB NOT NULL DEFAULT '{}',
  confidence_scores JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_invitation_sends_invitation_id ON public.invitation_sends(invitation_id);
CREATE INDEX idx_invitation_sends_correlation_id ON public.invitation_sends(correlation_id);
CREATE INDEX idx_invitation_sends_status ON public.invitation_sends(status);
CREATE INDEX idx_import_errors_batch_id ON public.import_errors(batch_id);
CREATE INDEX idx_csv_mapping_presets_org_id ON public.csv_mapping_presets(organization_id);

-- RLS Policies
ALTER TABLE public.invitation_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.csv_mapping_presets ENABLE ROW LEVEL SECURITY;

-- Invitation sends policies
CREATE POLICY "Admins can manage invitation sends" ON public.invitation_sends
FOR ALL USING (
  EXISTS(
    SELECT 1 FROM public.employee_invitations ei 
    WHERE ei.id = invitation_sends.invitation_id 
    AND ei.organization_id = get_current_user_org_id()
  ) AND has_role('admin')
);

CREATE POLICY "Users can view invitation sends in their org" ON public.invitation_sends
FOR SELECT USING (
  EXISTS(
    SELECT 1 FROM public.employee_invitations ei 
    WHERE ei.id = invitation_sends.invitation_id 
    AND ei.organization_id = get_current_user_org_id()
  )
);

-- Import errors policies
CREATE POLICY "Admins can view import errors" ON public.import_errors
FOR SELECT USING (
  EXISTS(
    SELECT 1 FROM public.import_batches ib 
    WHERE ib.id = import_errors.batch_id 
    AND ib.organization_id = get_current_user_org_id()
  ) AND has_role('admin')
);

-- CSV mapping presets policies
CREATE POLICY "Admins can manage CSV mapping presets" ON public.csv_mapping_presets
FOR ALL USING (
  organization_id = get_current_user_org_id() AND has_role('admin')
) WITH CHECK (
  organization_id = get_current_user_org_id() AND has_role('admin')
);

CREATE POLICY "Users can view CSV mapping presets in their org" ON public.csv_mapping_presets
FOR SELECT USING (organization_id = get_current_user_org_id());

-- Trigger for updated_at on csv_mapping_presets
CREATE TRIGGER update_csv_mapping_presets_updated_at
  BEFORE UPDATE ON public.csv_mapping_presets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();