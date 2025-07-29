-- Phase 1: Add is_active column to user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- Add documentation
COMMENT ON COLUMN public.user_roles.is_active IS 'Indicates whether this role assignment is currently active. Defaults to true for backward compatibility.';

-- Add index for efficient active role queries
CREATE INDEX idx_user_roles_active ON public.user_roles (is_active) WHERE is_active = true;

-- Update the get_current_user_roles function to only return active roles
CREATE OR REPLACE FUNCTION public.get_current_user_roles()
 RETURNS TABLE(role app_role)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT ur.role FROM public.user_roles ur 
  WHERE ur.user_id = auth.uid() AND ur.is_active = true;
$function$;

-- Update the has_role function to only check active roles
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