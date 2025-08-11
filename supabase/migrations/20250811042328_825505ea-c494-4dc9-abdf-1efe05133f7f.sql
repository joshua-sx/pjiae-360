-- Update the handle_new_user function to automatically assign admin role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  _email_response JSONB;
  _org_id UUID;
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
    _org_id := (NEW.raw_user_meta_data->>'organization_id')::UUID;
    
    INSERT INTO public.employee_info (
      user_id,
      organization_id,
      status
    ) VALUES (
      NEW.id,
      _org_id,
      'pending'
    );
    
    -- Assign admin role to the new user within their organization
    INSERT INTO public.user_roles (
      user_id,
      role,
      organization_id,
      is_active
    ) VALUES (
      NEW.id,
      'admin'::app_role,
      _org_id,
      true
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
$function$;