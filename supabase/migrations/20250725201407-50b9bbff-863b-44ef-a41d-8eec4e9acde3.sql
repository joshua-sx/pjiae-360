-- Fix the handle_new_user trigger to remove name field from insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  existing_profile_id UUID;
  default_org_id UUID;
  new_profile_id UUID;
  is_first_user_in_org BOOLEAN := false;
  user_org_id UUID;
BEGIN
  -- Check if there's an existing profile with this email
  SELECT id, organization_id INTO existing_profile_id, user_org_id
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
      status = 'active',
      updated_at = now()
    WHERE id = existing_profile_id;
    
    new_profile_id := existing_profile_id;
    
    -- Check if this is the first user in the organization
    SELECT COUNT(*) = 1 INTO is_first_user_in_org
    FROM public.employee_info 
    WHERE organization_id = user_org_id 
    AND user_id IS NOT NULL;
    
  ELSE
    -- Get organization ID from user metadata or create default
    user_org_id := (NEW.raw_user_meta_data ->> 'organization_id')::UUID;
    
    IF user_org_id IS NULL THEN
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
      
      user_org_id := default_org_id;
    END IF;
    
    -- Check if this is the first user in the organization
    SELECT COUNT(*) = 0 INTO is_first_user_in_org
    FROM public.employee_info 
    WHERE organization_id = user_org_id 
    AND user_id IS NOT NULL;
    
    -- Insert new profile for the user (without name field)
    INSERT INTO public.employee_info (
      user_id, email, first_name, last_name, organization_id, status
    )
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data ->> 'first_name',
      NEW.raw_user_meta_data ->> 'last_name',
      user_org_id,
      'active'
    ) RETURNING id INTO new_profile_id;
  END IF;

  -- Assign appropriate role based on whether user is first in organization
  IF is_first_user_in_org THEN
    -- First user gets admin role
    INSERT INTO public.user_roles (profile_id, user_id, role, organization_id)
    VALUES (new_profile_id, NEW.id, 'admin'::app_role, user_org_id)
    ON CONFLICT (profile_id, role, organization_id) 
    DO UPDATE SET 
      is_active = true,
      user_id = NEW.id,
      assigned_at = now(),
      updated_at = now();
  ELSE
    -- Subsequent users get employee role
    INSERT INTO public.user_roles (profile_id, user_id, role, organization_id)
    VALUES (new_profile_id, NEW.id, 'employee'::app_role, user_org_id)
    ON CONFLICT (profile_id, role, organization_id) 
    DO UPDATE SET 
      is_active = true,
      user_id = NEW.id,
      assigned_at = now(),
      updated_at = now();
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$function$;