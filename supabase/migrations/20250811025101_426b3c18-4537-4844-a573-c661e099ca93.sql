-- Fix migration conflicts for user_roles table
-- This migration resolves the conflicting schemas across multiple migration files
-- Current production schema uses user_id, which is correct

-- Drop conflicting versions and recreate with correct schema
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Recreate user_roles table with correct schema (using user_id, not profile_id)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role, organization_id)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Recreate core RLS policies
CREATE POLICY "Admins can manage roles" 
ON public.user_roles 
FOR ALL 
USING (has_role('admin'::app_role));

CREATE POLICY "Users can create their initial admin role" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() 
  AND role = 'admin'::app_role 
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
);

CREATE POLICY "Users can view roles in their organization" 
ON public.user_roles 
FOR SELECT 
USING (organization_id = get_current_user_org_id());

-- Recreate essential functions with correct schema
CREATE OR REPLACE FUNCTION public.get_current_user_roles()
RETURNS TABLE(role app_role)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT ur.role FROM public.user_roles ur 
  WHERE ur.user_id = auth.uid() AND ur.is_active = true;
$function$;

-- Update has_role function to work with user_id
CREATE OR REPLACE FUNCTION public.has_role(_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = _role AND is_active = true
  );
$function$;

-- Create audit trigger for role changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.security_audit_log (
      user_id, organization_id, event_type, event_details
    ) VALUES (
      NEW.user_id, NEW.organization_id, 'role_granted',
      jsonb_build_object('role', NEW.role, 'active', NEW.is_active)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_active != NEW.is_active THEN
      INSERT INTO public.security_audit_log (
        user_id, organization_id, event_type, event_details
      ) VALUES (
        NEW.user_id, NEW.organization_id, 
        CASE WHEN NEW.is_active THEN 'role_activated' ELSE 'role_deactivated' END,
        jsonb_build_object('role', NEW.role)
      );
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$function$;

-- Create trigger
DROP TRIGGER IF EXISTS audit_user_roles_changes ON public.user_roles;
CREATE TRIGGER audit_user_roles_changes
  AFTER INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_role_changes();