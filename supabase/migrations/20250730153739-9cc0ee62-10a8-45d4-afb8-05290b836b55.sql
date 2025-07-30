-- Remove custom email verification functions and update handle_new_user
-- This fixes the "Database error saving new user" issue

-- Drop the custom email verification functions that are causing issues
DROP FUNCTION IF EXISTS public.create_email_verification_token(uuid, text);
DROP FUNCTION IF EXISTS public.verify_email_token(text);

-- Update the handle_new_user function to remove custom email verification logic
-- and let Supabase handle email confirmations natively
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Create profile from user metadata
  INSERT INTO public.profiles (
    user_id,
    first_name,
    last_name,
    email
  ) VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.email
  );

  -- Only create employee info if user has organization metadata
  IF NEW.raw_user_meta_data ? 'organization_id' THEN
    INSERT INTO public.employee_info (
      user_id,
      organization_id,
      status
    ) VALUES (
      NEW.id,
      (NEW.raw_user_meta_data->>'organization_id')::UUID,
      'pending'
    );
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't block user creation
  INSERT INTO public.security_audit_log (
    user_id, event_type, event_details, success
  ) VALUES (
    NEW.id, 'user_creation_error',
    jsonb_build_object('error', SQLERRM, 'email', NEW.email), false
  );
  
  -- Return NEW to allow user creation to continue
  RETURN NEW;
END;
$$;

-- Drop the email_verification_tokens table as it's no longer needed
DROP TABLE IF EXISTS public.email_verification_tokens;