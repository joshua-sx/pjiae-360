
-- Phase 2: Operational Improvements - Audit Trail Implementation

-- Create audit_log table for comprehensive change tracking
CREATE TABLE public.audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL,
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values jsonb,
  new_values jsonb,
  changed_fields text[],
  user_id uuid REFERENCES auth.users(id),
  user_email text,
  user_name text,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  ip_address inet,
  user_agent text,
  session_id text,
  context jsonb -- Additional context like "bulk_import", "api_call", etc.
);

-- Add indexes for efficient audit log queries
CREATE INDEX idx_audit_log_org_table ON public.audit_log(organization_id, table_name);
CREATE INDEX idx_audit_log_record_id ON public.audit_log(record_id);
CREATE INDEX idx_audit_log_timestamp ON public.audit_log(timestamp DESC);
CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_action ON public.audit_log(action);

-- Enable RLS on audit_log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policy for audit_log (organization-based access)
CREATE POLICY "Organization access" ON public.audit_log
  FOR ALL USING (organization_id = get_user_organization_id());

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_data jsonb;
  new_data jsonb;
  changed_fields text[] := '{}';
  field_name text;
  current_user_id uuid;
  current_user_email text;
  current_user_name text;
  current_org_id uuid;
BEGIN
  -- Get current user info
  current_user_id := auth.uid();
  
  -- Get user profile info
  SELECT p.email, COALESCE(p.first_name || ' ' || p.last_name, p.name), p.organization_id
  INTO current_user_email, current_user_name, current_org_id
  FROM public.profiles p
  WHERE p.user_id = current_user_id;
  
  -- Set organization_id from the record if not found in profile
  IF current_org_id IS NULL THEN
    IF TG_OP = 'DELETE' THEN
      current_org_id := OLD.organization_id;
    ELSE
      current_org_id := NEW.organization_id;
    END IF;
  END IF;
  
  -- Prepare data based on operation
  IF TG_OP = 'DELETE' THEN
    old_data := to_jsonb(OLD);
    new_data := NULL;
  ELSIF TG_OP = 'INSERT' THEN
    old_data := NULL;
    new_data := to_jsonb(NEW);
  ELSE -- UPDATE
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
    
    -- Identify changed fields
    FOR field_name IN SELECT key FROM jsonb_each(new_data) LOOP
      IF old_data->field_name IS DISTINCT FROM new_data->field_name THEN
        changed_fields := changed_fields || field_name;
      END IF;
    END LOOP;
  END IF;
  
  -- Insert audit record
  INSERT INTO public.audit_log (
    organization_id,
    table_name,
    record_id,
    action,
    old_values,
    new_values,
    changed_fields,
    user_id,
    user_email,
    user_name,
    timestamp
  ) VALUES (
    current_org_id,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    old_data,
    new_data,
    changed_fields,
    current_user_id,
    current_user_email,
    current_user_name,
    now()
  );
  
  -- Return appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Create audit triggers for critical tables
CREATE TRIGGER audit_profiles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_goals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_appraisals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.appraisals
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_user_roles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_cycles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.cycles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_periods_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.periods
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_organizations_trigger
  AFTER UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- Function to get audit history for a specific record
CREATE OR REPLACE FUNCTION public.get_audit_history(
  _table_name text,
  _record_id uuid,
  _limit integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  action text,
  old_values jsonb,
  new_values jsonb,
  changed_fields text[],
  user_name text,
  user_email text,
  timestamp timestamp with time zone,
  context jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    al.id,
    al.action,
    al.old_values,
    al.new_values,
    al.changed_fields,
    al.user_name,
    al.user_email,
    al.timestamp,
    al.context
  FROM public.audit_log al
  WHERE 
    al.table_name = _table_name 
    AND al.record_id = _record_id
    AND al.organization_id = get_user_organization_id()
  ORDER BY al.timestamp DESC
  LIMIT _limit;
$$;

-- Function to get recent audit activity
CREATE OR REPLACE FUNCTION public.get_recent_audit_activity(
  _limit integer DEFAULT 100,
  _table_filter text DEFAULT NULL,
  _user_filter uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  table_name text,
  record_id uuid,
  action text,
  user_name text,
  user_email text,
  timestamp timestamp with time zone,
  changed_fields text[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    al.id,
    al.table_name,
    al.record_id,
    al.action,
    al.user_name,
    al.user_email,
    al.timestamp,
    al.changed_fields
  FROM public.audit_log al
  WHERE 
    al.organization_id = get_user_organization_id()
    AND (_table_filter IS NULL OR al.table_name = _table_filter)
    AND (_user_filter IS NULL OR al.user_id = _user_filter)
  ORDER BY al.timestamp DESC
  LIMIT _limit;
$$;
