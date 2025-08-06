-- Update handle_new_user function to send welcome emails after email verification
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  _email_response JSONB;
BEGIN
  -- Create profile from user metadata
  INSERT INTO public.profiles (
    user_id,
    first_name,
    last_name,
    email
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
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

  -- Send welcome email if user email is confirmed
  IF NEW.email_confirmed_at IS NOT NULL THEN
    BEGIN
      -- Call the send-account-welcome edge function
      SELECT net.http_post(
        url := format('%s/functions/v1/send-account-welcome', current_setting('app.supabase_url')),
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', format('Bearer %s', current_setting('app.supabase_service_role_key'))
        ),
        body := jsonb_build_object(
          'email', NEW.email,
          'firstName', COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
          'lastName', COALESCE(NEW.raw_user_meta_data->>'last_name', '')
        )::text
      ) INTO _email_response;
      
      -- Log the email attempt
      INSERT INTO public.security_audit_log (
        user_id, event_type, event_details, success
      ) VALUES (
        NEW.id, 'welcome_email_sent',
        jsonb_build_object('email', NEW.email, 'response', _email_response), true
      );
      
    EXCEPTION WHEN OTHERS THEN
      -- Log email failure but don't block user creation
      INSERT INTO public.security_audit_log (
        user_id, event_type, event_details, success
      ) VALUES (
        NEW.id, 'welcome_email_failed',
        jsonb_build_object('email', NEW.email, 'error', SQLERRM), false
      );
    END;
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

-- Create trigger for new users (if not exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also create trigger for email confirmation updates
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW 
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user();