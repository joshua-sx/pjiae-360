
-- Create the missing get_user_profile_id function
CREATE OR REPLACE FUNCTION public.get_user_profile_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $function$
BEGIN
  RETURN (
    SELECT id
    FROM public.profiles
    WHERE user_id = auth.uid()
  );
END;
$function$;

-- Recreate the handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  existing_profile_id UUID;
  default_org_id UUID;
BEGIN
  -- Check if there's an existing profile with this email
  SELECT id INTO existing_profile_id 
  FROM public.profiles 
  WHERE email = NEW.email 
  AND user_id IS NULL
  LIMIT 1;
  
  IF existing_profile_id IS NOT NULL THEN
    -- Update existing profile to link to the new user
    UPDATE public.profiles 
    SET 
      user_id = NEW.id,
      first_name = COALESCE(NEW.raw_user_meta_data ->> 'first_name', first_name),
      last_name = COALESCE(NEW.raw_user_meta_data ->> 'last_name', last_name),
      status = 'active',
      updated_at = now()
    WHERE id = existing_profile_id;
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
    INSERT INTO public.profiles (user_id, email, first_name, last_name, organization_id, status)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data ->> 'first_name',
      NEW.raw_user_meta_data ->> 'last_name',
      COALESCE((NEW.raw_user_meta_data ->> 'organization_id')::UUID, default_org_id),
      'active'
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$function$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
