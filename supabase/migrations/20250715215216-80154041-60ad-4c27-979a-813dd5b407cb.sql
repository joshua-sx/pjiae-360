-- Update profiles table to link to the correct authenticated user
-- First, let's check if we need to update the user_id in profiles table
UPDATE profiles 
SET user_id = (SELECT id FROM auth.users WHERE email = profiles.email)
WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM auth.users);

-- Also, let's ensure we have a proper trigger for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  default_org_id UUID;
BEGIN
  -- Get the default organization ID
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
  
  -- Insert or update profile for the new user
  INSERT INTO public.profiles (user_id, email, first_name, last_name, organization_id)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    COALESCE((NEW.raw_user_meta_data ->> 'organization_id')::UUID, default_org_id)
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = NEW.email,
    first_name = NEW.raw_user_meta_data ->> 'first_name',
    last_name = NEW.raw_user_meta_data ->> 'last_name',
    updated_at = now();
  
  RETURN NEW;
END;
$function$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();