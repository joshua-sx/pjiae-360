-- Create find_or_create_org_for_user function to simplify onboarding
CREATE OR REPLACE FUNCTION public.find_or_create_org_for_user(_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  _org_id uuid;
  _user_id uuid;
BEGIN
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Check if user already belongs to an organization
  SELECT organization_id INTO _org_id
  FROM public.employee_info
  WHERE user_id = _user_id
  LIMIT 1;

  IF _org_id IS NOT NULL THEN
    -- User already belongs to an organization, update name if provided
    IF _name IS NOT NULL AND _name != '' THEN
      UPDATE public.organizations 
      SET name = _name, updated_at = now()
      WHERE id = _org_id;
    END IF;
    RETURN _org_id;
  END IF;

  -- Create new organization
  INSERT INTO public.organizations (name)
  VALUES (_name)
  RETURNING id INTO _org_id;

  -- Create employee_info for the user (making them admin)
  INSERT INTO public.employee_info (
    user_id, 
    organization_id, 
    status,
    job_title
  ) VALUES (
    _user_id, 
    _org_id, 
    'active',
    'Administrator'
  );

  -- Assign admin role
  INSERT INTO public.user_roles (user_id, role, organization_id, is_active)
  VALUES (_user_id, 'admin'::app_role, _org_id, true)
  ON CONFLICT (user_id, role, organization_id) DO UPDATE 
  SET is_active = true;

  -- Log organization creation
  INSERT INTO public.security_audit_log (
    user_id, organization_id, event_type, event_details, success
  ) VALUES (
    _user_id, _org_id, 'org_created_or_found',
    jsonb_build_object('org_name', _name, 'action', 'create'), true
  );

  RETURN _org_id;
EXCEPTION WHEN OTHERS THEN
  -- Log error
  INSERT INTO public.security_audit_log (
    user_id, organization_id, event_type, event_details, success
  ) VALUES (
    _user_id, NULL, 'org_creation_error',
    jsonb_build_object('error', SQLERRM, 'org_name', _name), false
  );
  RAISE;
END;
$$;