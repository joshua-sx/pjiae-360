-- Update the handle_new_user trigger to create email verification tokens for regular sign-ups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  _token TEXT;
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
  ELSE
    -- For regular sign-ups without organization, create verification token
    IF NOT NEW.email_confirmed_at IS NOT NULL THEN
      _token := public.create_email_verification_token(NEW.id, NEW.email);
      
      -- Log the token creation for debugging (remove in production)
      INSERT INTO public.security_audit_log (
        user_id, event_type, event_details, success
      ) VALUES (
        NEW.id, 'email_verification_token_created',
        jsonb_build_object('email', NEW.email, 'token_created', true), true
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;