
-- Fix the sync_user_roles function to properly handle user_id and role enum casting
CREATE OR REPLACE FUNCTION public.sync_user_roles(_profile_id uuid, _assigned_by uuid DEFAULT NULL::uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  profile_record RECORD;
  determined_roles public.app_role[];
  role_item public.app_role;
  existing_roles public.app_role[];
  roles_to_add public.app_role[];
  roles_to_remove public.app_role[];
BEGIN
  -- Get profile information
  SELECT * INTO profile_record FROM public.profiles WHERE id = _profile_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Skip role sync if user_id is null (profile exists but user account not yet created)
  IF profile_record.user_id IS NULL THEN
    RETURN;
  END IF;

  -- Get determined roles
  determined_roles := public.determine_role_from_position(_profile_id);

  -- Get existing active roles (excluding admin)
  SELECT ARRAY_AGG(role) INTO existing_roles
  FROM public.user_roles
  WHERE profile_id = _profile_id 
    AND role != 'admin'
    AND is_active = true;

  -- Handle null case
  IF existing_roles IS NULL THEN
    existing_roles := ARRAY[]::public.app_role[];
  END IF;

  -- Find roles to add and remove
  SELECT ARRAY(
    SELECT unnest(determined_roles) 
    EXCEPT 
    SELECT unnest(existing_roles)
  ) INTO roles_to_add;

  SELECT ARRAY(
    SELECT unnest(existing_roles) 
    EXCEPT 
    SELECT unnest(determined_roles)
  ) INTO roles_to_remove;

  -- Remove roles that are no longer applicable
  IF array_length(roles_to_remove, 1) > 0 THEN
    FOREACH role_item IN ARRAY roles_to_remove
    LOOP
      -- Deactivate role
      UPDATE public.user_roles
      SET is_active = false, 
          deactivated_by = _assigned_by,
          deactivated_at = now(),
          updated_at = now()
      WHERE profile_id = _profile_id 
        AND role = role_item
        AND is_active = true;

      -- Log the change
      INSERT INTO public.role_audit_log (
        profile_id, old_role, new_role, action_type, assigned_by, 
        reason, organization_id
      ) VALUES (
        _profile_id, role_item, NULL, 'removed', _assigned_by,
        'Automatic role sync based on position', profile_record.organization_id
      );
    END LOOP;
  END IF;

  -- Add new roles
  IF array_length(roles_to_add, 1) > 0 THEN
    FOREACH role_item IN ARRAY roles_to_add
    LOOP
      -- Insert or reactivate role with proper user_id handling
      INSERT INTO public.user_roles (profile_id, user_id, role, organization_id, assigned_by)
      VALUES (_profile_id, profile_record.user_id, role_item, profile_record.organization_id, _assigned_by)
      ON CONFLICT (profile_id, role, organization_id) 
      DO UPDATE SET 
        is_active = true,
        user_id = profile_record.user_id,
        assigned_by = _assigned_by,
        assigned_at = now(),
        updated_at = now();

      -- Log the change
      INSERT INTO public.role_audit_log (
        profile_id, old_role, new_role, action_type, assigned_by, 
        reason, organization_id
      ) VALUES (
        _profile_id, NULL, role_item, 'assigned', _assigned_by,
        'Automatic role sync based on position', profile_record.organization_id
      );
    END LOOP;
  END IF;
END;
$function$;
