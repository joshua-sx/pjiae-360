-- Insert a default organization for initial setup
INSERT INTO public.organizations (name, domain) 
VALUES ('Default Organization', NULL)
ON CONFLICT DO NOTHING;

-- Update the user creation trigger to assign users to the default organization
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
  
  INSERT INTO public.profiles (user_id, email, first_name, last_name, organization_id)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    COALESCE((NEW.raw_user_meta_data ->> 'organization_id')::UUID, default_org_id)
  );
  RETURN NEW;
END;
$function$;