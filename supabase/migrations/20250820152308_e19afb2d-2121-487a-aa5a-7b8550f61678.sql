-- Enhance claim_employee_invitation function to assign default employee role
CREATE OR REPLACE FUNCTION public.claim_employee_invitation(_token text, _user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  _invitation_record RECORD;
  _employee_record RECORD;
  _profile_record RECORD;
BEGIN
  -- Find and validate invitation
  SELECT * INTO _invitation_record
  FROM public.employee_invitations
  WHERE token = _token 
    AND status = 'pending' 
    AND expires_at > now();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation token');
  END IF;

  -- Find employee_info record
  SELECT * INTO _employee_record
  FROM public.employee_info
  WHERE id = _invitation_record.employee_id
    AND status = 'invited' 
    AND user_id IS NULL;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Employee record not found or already claimed');
  END IF;

  -- Find profile record
  SELECT * INTO _profile_record
  FROM public.profiles
  WHERE email = _invitation_record.email 
    AND user_id IS NULL;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Profile not found or already claimed');
  END IF;

  -- Update employee_info with user_id
  UPDATE public.employee_info
  SET user_id = _user_id, status = 'active'
  WHERE id = _employee_record.id;

  -- Update profile with user_id
  UPDATE public.profiles
  SET user_id = _user_id
  WHERE id = _profile_record.id;

  -- Mark invitation as accepted
  UPDATE public.employee_invitations
  SET status = 'accepted'
  WHERE id = _invitation_record.id;

  -- Assign default employee role if no role exists
  INSERT INTO public.user_roles (user_id, role, organization_id, is_active)
  VALUES (_user_id, 'employee'::app_role, _invitation_record.organization_id, true)
  ON CONFLICT (user_id, role, organization_id) DO UPDATE SET is_active = true;

  -- Log successful claim
  INSERT INTO public.security_audit_log (
    user_id, organization_id, event_type, event_details, success
  ) VALUES (
    _user_id, _invitation_record.organization_id, 'invitation_claimed',
    jsonb_build_object(
      'employee_id', _employee_record.id, 
      'email', _invitation_record.email,
      'role_assigned', 'employee'
    ), true
  );

  -- Log activity for admin dashboard
  INSERT INTO public.activities (
    organization_id, user_id, employee_id, activity_type, title, description, metadata
  ) VALUES (
    _invitation_record.organization_id,
    _user_id,
    _employee_record.id,
    'employee_joined',
    'New Employee Joined',
    'Employee accepted invitation and joined the organization',
    jsonb_build_object(
      'email', _invitation_record.email,
      'invitation_id', _invitation_record.id
    )
  );

  RETURN jsonb_build_object('success', true, 'organization_id', _invitation_record.organization_id);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$function$;