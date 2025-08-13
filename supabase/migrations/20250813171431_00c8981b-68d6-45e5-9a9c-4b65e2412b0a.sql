-- Update handle_new_user trigger to not send welcome emails anymore
-- since we're handling them directly in the signup flow
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
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

  -- Log user creation but don't send welcome email (handled in signup flow)
  INSERT INTO public.security_audit_log (
    user_id, event_type, event_details, success
  ) VALUES (
    NEW.id, 'user_created',
    jsonb_build_object('email', NEW.email, 'confirmed', NEW.email_confirmed_at IS NOT NULL), true
  );
  
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