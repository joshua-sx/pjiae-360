-- Fix database function security by adding proper search_path protection
-- This prevents search path manipulation attacks

-- Update existing functions to be more secure
CREATE OR REPLACE FUNCTION public.get_current_user_roles()
 RETURNS TABLE(role app_role)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT ur.role
  FROM public.user_roles ur
  JOIN public.employee_info p ON p.id = ur.profile_id
  WHERE p.user_id = auth.uid()
  AND ur.is_active = true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_role app_role)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.employee_info p ON p.id = ur.profile_id
    WHERE p.user_id = auth.uid()
    AND ur.role = _role
    AND ur.is_active = true
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_organization_id()
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN (SELECT organization_id FROM public.employee_info WHERE user_id = auth.uid());
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_profile_id()
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN (
    SELECT id
    FROM public.employee_info
    WHERE user_id = auth.uid()
  );
END;
$function$;

-- Add role assignment validation function
CREATE OR REPLACE FUNCTION public.validate_role_assignment(_profile_id uuid, _role app_role, _assigned_by uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  assigner_roles app_role[];
  target_org_id uuid;
  assigner_org_id uuid;
BEGIN
  -- Get assigner's roles
  SELECT ARRAY_AGG(ur.role) INTO assigner_roles
  FROM public.user_roles ur
  JOIN public.employee_info p ON p.id = ur.profile_id
  WHERE ur.profile_id = _assigned_by
  AND ur.is_active = true;

  -- Get organization IDs
  SELECT organization_id INTO target_org_id
  FROM public.employee_info WHERE id = _profile_id;
  
  SELECT organization_id INTO assigner_org_id
  FROM public.employee_info WHERE id = _assigned_by;

  -- Must be in same organization
  IF target_org_id != assigner_org_id THEN
    RETURN false;
  END IF;

  -- Admin role can only be assigned by existing admins
  IF _role = 'admin' AND NOT ('admin' = ANY(assigner_roles)) THEN
    RETURN false;
  END IF;

  -- Director role requires admin or director
  IF _role = 'director' AND NOT ('admin' = ANY(assigner_roles) OR 'director' = ANY(assigner_roles)) THEN
    RETURN false;
  END IF;

  -- Manager role requires admin, director, or manager
  IF _role = 'manager' AND NOT ('admin' = ANY(assigner_roles) OR 'director' = ANY(assigner_roles) OR 'manager' = ANY(assigner_roles)) THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$function$;

-- Add secure role assignment function
CREATE OR REPLACE FUNCTION public.assign_user_role(_profile_id uuid, _role app_role, _reason text DEFAULT NULL)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  _assigned_by uuid;
  _org_id uuid;
BEGIN
  -- Get current user's profile ID
  _assigned_by := public.get_user_profile_id();
  
  -- Get organization ID
  SELECT organization_id INTO _org_id
  FROM public.employee_info WHERE id = _profile_id;

  -- Validate assignment
  IF NOT public.validate_role_assignment(_profile_id, _role, _assigned_by) THEN
    RAISE EXCEPTION 'Insufficient permissions to assign role %', _role;
  END IF;

  -- Insert or update role
  INSERT INTO public.user_roles (profile_id, role, organization_id, assigned_by)
  VALUES (_profile_id, _role, _org_id, _assigned_by)
  ON CONFLICT (profile_id, role, organization_id) 
  DO UPDATE SET 
    is_active = true,
    assigned_by = _assigned_by,
    assigned_at = now(),
    updated_at = now();

  -- Log the assignment
  INSERT INTO public.role_audit_log (
    profile_id, new_role, action_type, assigned_by, reason, organization_id
  ) VALUES (
    _profile_id, _role, 'assigned', _assigned_by, _reason, _org_id
  );

  RETURN true;
END;
$function$;

-- Update the handle_new_user function to assign employee role only (no admin)
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  existing_profile_id UUID;
  default_org_id UUID;
  new_profile_id UUID;
BEGIN
  -- Check if there's an existing profile with this email
  SELECT id INTO existing_profile_id 
  FROM public.employee_info 
  WHERE email = NEW.email 
  AND user_id IS NULL
  LIMIT 1;
  
  IF existing_profile_id IS NOT NULL THEN
    -- Update existing profile to link to the new user
    UPDATE public.employee_info 
    SET 
      user_id = NEW.id,
      first_name = COALESCE(NEW.raw_user_meta_data ->> 'first_name', first_name),
      last_name = COALESCE(NEW.raw_user_meta_data ->> 'last_name', last_name),
      name = COALESCE(
        (NEW.raw_user_meta_data ->> 'first_name') || ' ' || (NEW.raw_user_meta_data ->> 'last_name'),
        name
      ),
      status = 'active',
      updated_at = now()
    WHERE id = existing_profile_id;
    
    new_profile_id := existing_profile_id;
  ELSE
    -- Get default organization ID if no profile exists
    SELECT id INTO default_org_id 
    FROM public.organizations 
    WHERE name = 'Default Organization' 
    LIMIT 1;
    
    -- If no default organization exists, create one
    IF default_org_id IS NULL THEN
      INSERT INTO public.organizations (name, domain) 
      VALUES ('Default Organization', NULL) 
      RETURNING id INTO default_org_id;
    END IF;
    
    -- Insert new profile for the user
    INSERT INTO public.employee_info (
      user_id, email, first_name, last_name, name, organization_id, status
    )
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data ->> 'first_name',
      NEW.raw_user_meta_data ->> 'last_name',
      COALESCE(
        (NEW.raw_user_meta_data ->> 'first_name') || ' ' || (NEW.raw_user_meta_data ->> 'last_name'),
        NEW.email
      ),
      COALESCE((NEW.raw_user_meta_data ->> 'organization_id')::UUID, default_org_id),
      'active'
    ) RETURNING id INTO new_profile_id;
  END IF;

  -- Assign employee role only (security: no automatic admin assignment)
  INSERT INTO public.user_roles (profile_id, user_id, role, organization_id)
  SELECT 
    new_profile_id,
    NEW.id,
    'employee'::app_role,
    organization_id
  FROM public.employee_info 
  WHERE id = new_profile_id
  ON CONFLICT (profile_id, role, organization_id) 
  DO UPDATE SET 
    is_active = true,
    user_id = NEW.id,
    assigned_at = now(),
    updated_at = now();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$function$;