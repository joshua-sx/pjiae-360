-- Add fields to profiles table for invitation management
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS invitation_token uuid DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS invited_at timestamp with time zone DEFAULT now();

-- Update user_id to be nullable so we can create placeholder profiles
ALTER TABLE public.profiles 
ALTER COLUMN user_id DROP NOT NULL;

-- Add index for invitation tokens
CREATE INDEX IF NOT EXISTS idx_profiles_invitation_token ON public.profiles(invitation_token);

-- Update the handle_new_user function to link existing profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  existing_profile_id UUID;
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
    DECLARE
      default_org_id UUID;
    BEGIN
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
      INSERT INTO public.profiles (user_id, email, first_name, last_name, organization_id)
      VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data ->> 'first_name',
        NEW.raw_user_meta_data ->> 'last_name',
        COALESCE((NEW.raw_user_meta_data ->> 'organization_id')::UUID, default_org_id)
      );
    END;
  END IF;
  
  RETURN NEW;
END;
$function$;