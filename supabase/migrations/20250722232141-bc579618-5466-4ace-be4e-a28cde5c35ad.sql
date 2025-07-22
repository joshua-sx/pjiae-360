-- Rename profiles table to employee_info
ALTER TABLE public.profiles RENAME TO employee_info;

-- Rename indexes referencing the old table
ALTER INDEX IF EXISTS idx_profiles_organization_id RENAME TO idx_employee_info_organization_id;
ALTER INDEX IF EXISTS idx_profiles_user_id RENAME TO idx_employee_info_user_id;
ALTER INDEX IF EXISTS idx_profiles_manager_id RENAME TO idx_employee_info_manager_id;
ALTER INDEX IF EXISTS idx_profiles_division_id RENAME TO idx_employee_info_division_id;
ALTER INDEX IF EXISTS idx_profiles_department_id RENAME TO idx_employee_info_department_id;
ALTER INDEX IF EXISTS idx_profiles_role_id RENAME TO idx_employee_info_role_id;
ALTER INDEX IF EXISTS idx_profiles_status RENAME TO idx_employee_info_status;
ALTER INDEX IF EXISTS idx_profiles_invitation_token RENAME TO idx_employee_info_invitation_token;

-- Update handle_new_user function to use new table name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  existing_profile_id UUID;
  default_org_id UUID;
BEGIN
  SELECT id INTO existing_profile_id
  FROM public.employee_info
  WHERE email = NEW.email
    AND user_id IS NULL
  LIMIT 1;

  IF existing_profile_id IS NOT NULL THEN
    UPDATE public.employee_info
    SET
      user_id = NEW.id,
      first_name = COALESCE(NEW.raw_user_meta_data ->> 'first_name', first_name),
      last_name = COALESCE(NEW.raw_user_meta_data ->> 'last_name', last_name),
      status = 'active',
      updated_at = now()
    WHERE id = existing_profile_id;
  ELSE
    SELECT id INTO default_org_id
    FROM public.organizations
    WHERE name = 'Default Organization'
    LIMIT 1;

    IF default_org_id IS NULL THEN
      INSERT INTO public.organizations (name, domain)
      VALUES ('Default Organization', NULL)
      RETURNING id INTO default_org_id;
    END IF;

    INSERT INTO public.employee_info (user_id, email, first_name, last_name, organization_id, status)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data ->> 'first_name',
      NEW.raw_user_meta_data ->> 'last_name',
      COALESCE((NEW.raw_user_meta_data ->> 'organization_id')::UUID, default_org_id),
      'active'
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update determine_role_from_position function
CREATE OR REPLACE FUNCTION public.determine_role_from_position(_profile_id UUID)
RETURNS public.app_role[]
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $function$
DECLARE
  profile_record RECORD;
  determined_roles public.app_role[] := ARRAY[]::public.app_role[];
  is_division_head BOOLEAN := false;
  is_department_head BOOLEAN := false;
  has_supervisor_title BOOLEAN := false;
BEGIN
  SELECT p.*, d.name as department_name, div.name as division_name
  INTO profile_record
  FROM public.employee_info p
  LEFT JOIN public.departments d ON d.id = p.department_id
  LEFT JOIN public.divisions div ON div.id = p.division_id
  WHERE p.id = _profile_id;

  IF NOT FOUND THEN
    RETURN ARRAY['employee']::public.app_role[];
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.divisions
    WHERE id = profile_record.division_id
      AND organization_id = profile_record.organization_id
  ) INTO is_division_head;

  SELECT EXISTS(
    SELECT 1 FROM public.departments
    WHERE id = profile_record.department_id
      AND organization_id = profile_record.organization_id
  ) INTO is_department_head;

  IF profile_record.job_title IS NOT NULL THEN
    has_supervisor_title := (
      LOWER(profile_record.job_title) LIKE '%supervisor%' OR
      LOWER(profile_record.job_title) LIKE '%lead%' OR
      LOWER(profile_record.job_title) LIKE '%coordinator%'
    );
  END IF;

  determined_roles := determined_roles || 'employee';

  IF has_supervisor_title THEN
    determined_roles := determined_roles || 'supervisor';
  END IF;

  IF is_department_head THEN
    determined_roles := determined_roles || 'manager';
  END IF;

  IF is_division_head THEN
    determined_roles := determined_roles || 'director';
  END IF;

  RETURN determined_roles;
END;
$function$;

-- Update sync_user_roles function
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
  SELECT * INTO profile_record FROM public.employee_info WHERE id = _profile_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF profile_record.user_id IS NULL THEN
    RETURN;
  END IF;

  determined_roles := public.determine_role_from_position(_profile_id);

  SELECT ARRAY_AGG(role) INTO existing_roles
  FROM public.user_roles
  WHERE profile_id = _profile_id
    AND role != 'admin'
    AND is_active = true;

  IF existing_roles IS NULL THEN
    existing_roles := ARRAY[]::public.app_role[];
  END IF;

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

  IF array_length(roles_to_remove, 1) > 0 THEN
    FOREACH role_item IN ARRAY roles_to_remove
    LOOP
      UPDATE public.user_roles
      SET is_active = false,
          deactivated_by = _assigned_by,
          deactivated_at = now(),
          updated_at = now()
      WHERE profile_id = _profile_id
        AND role = role_item
        AND is_active = true;

      INSERT INTO public.role_audit_log (
        profile_id, old_role, new_role, action_type, assigned_by,
        reason, organization_id
      ) VALUES (
        _profile_id, role_item, NULL, 'removed', _assigned_by,
        'Automatic role sync based on position', profile_record.organization_id
      );
    END LOOP;
  END IF;

  IF array_length(roles_to_add, 1) > 0 THEN
    FOREACH role_item IN ARRAY roles_to_add
    LOOP
      INSERT INTO public.user_roles (profile_id, user_id, role, organization_id, assigned_by)
      VALUES (_profile_id, profile_record.user_id, role_item, profile_record.organization_id, _assigned_by)
      ON CONFLICT (profile_id, role, organization_id)
      DO UPDATE SET
        is_active = true,
        user_id = profile_record.user_id,
        assigned_by = _assigned_by,
        assigned_at = now(),
        updated_at = now();

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

-- Update handle_profile_role_sync function and trigger
CREATE OR REPLACE FUNCTION public.handle_profile_role_sync()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $function$
BEGIN
  PERFORM public.sync_user_roles(NEW.id);
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS sync_user_roles_on_profile_update ON public.employee_info;
CREATE TRIGGER sync_user_roles_on_profile_update
  AFTER INSERT OR UPDATE OF job_title, department_id, division_id, manager_id
  ON public.employee_info
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_profile_role_sync();

-- Update get_user_profile_id function
CREATE OR REPLACE FUNCTION public.get_user_profile_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $function$
BEGIN
  RETURN (
    SELECT id
    FROM public.employee_info
    WHERE user_id = auth.uid()
  );
END;
$function$;

-- Update get_direct_reports function
CREATE OR REPLACE FUNCTION public.get_direct_reports(_profile_id UUID)
RETURNS TABLE(profile_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER STABLE
AS $function$
BEGIN
  RETURN QUERY
  SELECT id
  FROM public.employee_info
  WHERE manager_id = _profile_id
    AND organization_id = get_user_organization_id();
END;
$function$;

-- Update get_division_employees function
CREATE OR REPLACE FUNCTION public.get_division_employees(_profile_id UUID)
RETURNS TABLE(profile_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER STABLE
AS $function$
DECLARE
  user_division_id UUID;
BEGIN
  SELECT division_id INTO user_division_id
  FROM public.employee_info
  WHERE id = _profile_id;

  RETURN QUERY
  SELECT id
  FROM public.employee_info
  WHERE division_id = user_division_id
    AND organization_id = get_user_organization_id();
END;
$function$;

-- Update get_current_user_roles function
CREATE OR REPLACE FUNCTION public.get_current_user_roles()
RETURNS TABLE(role public.app_role)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $function$
  SELECT ur.role
  FROM public.user_roles ur
  JOIN public.employee_info p ON p.id = ur.profile_id
  WHERE p.user_id = auth.uid()
    AND ur.is_active = true;
$function$;

-- Update get_suggested_appraisers function
CREATE OR REPLACE FUNCTION get_suggested_appraisers(employee_id UUID)
RETURNS TABLE(
    appraiser_id UUID,
    appraiser_name TEXT,
    appraiser_role TEXT,
    hierarchy_level INTEGER
) AS $function$
BEGIN
    RETURN QUERY
    WITH employee_info AS (
        SELECT p.manager_id, p.department_id, p.division_id, p.organization_id
        FROM public.employee_info p
        WHERE p.id = employee_id
    ),
    hierarchy AS (
        SELECT p.id, p.name, COALESCE(r.name, 'Manager') as role_name, 1 as level
        FROM employee_info ei
        JOIN public.employee_info p ON p.id = ei.manager_id
        LEFT JOIN public.roles r ON r.id = p.role_id
        WHERE p.status = 'active'

        UNION ALL

        SELECT dh.head_id, p.name, COALESCE(r.name, 'Department Head') as role_name, 2 as level
        FROM employee_info ei
        JOIN public.department_heads dh ON dh.department_id = ei.department_id
        JOIN public.employee_info p ON p.id = dh.head_id
        LEFT JOIN public.roles r ON r.id = p.role_id
        WHERE p.status = 'active' AND dh.head_id != employee_id

        UNION ALL

        SELECT dd.director_id, p.name, COALESCE(r.name, 'Division Director') as role_name, 3 as level
        FROM employee_info ei
        JOIN public.division_directors dd ON dd.division_id = ei.division_id
        JOIN public.employee_info p ON p.id = dd.director_id
        LEFT JOIN public.roles r ON r.id = p.role_id
        WHERE p.status = 'active' AND dd.director_id != employee_id
    )
    SELECT h.id, h.name, h.role_name, h.level
    FROM hierarchy h
    ORDER BY h.level
    LIMIT 2;
END;
$function$;

-- Update assign_appraisers function
CREATE OR REPLACE FUNCTION assign_appraisers(
    employee_id UUID,
    appraiser_ids UUID[],
    assigned_by UUID
) RETURNS BOOLEAN AS $function$
DECLARE
    appraiser_id UUID;
    user_org_id UUID;
    i INTEGER := 1;
BEGIN
    SELECT organization_id INTO user_org_id FROM public.employee_info WHERE id = assigned_by;

    DELETE FROM appraiser_assignments WHERE employee_id = assign_appraisers.employee_id;

    FOREACH appraiser_id IN ARRAY appraiser_ids
    LOOP
        INSERT INTO appraiser_assignments (
            employee_id,
            appraiser_id,
            assigned_by,
            organization_id,
            is_primary
        ) VALUES (
            assign_appraisers.employee_id,
            appraiser_id,
            assigned_by,
            user_org_id,
            i = 1
        );
        i := i + 1;
    END LOOP;

    RETURN TRUE;
END;
$function$;

-- Update get_editable_employees function
CREATE OR REPLACE FUNCTION get_editable_employees(user_id UUID)
RETURNS TABLE(
    employee_id UUID,
    employee_name TEXT,
    employee_role TEXT,
    can_edit BOOLEAN
) AS $function$
BEGIN
    RETURN QUERY
    WITH user_info AS (
        SELECT p.id, p.organization_id, p.department_id, p.division_id, COALESCE(r.name, 'Employee') as role_name
        FROM public.employee_info p
        LEFT JOIN public.roles r ON r.id = p.role_id
        WHERE p.id = user_id
    )
    SELECT
        p.id,
        COALESCE(p.name, p.email),
        COALESCE(r.name, 'Employee'),
        CASE
            WHEN ui.role_name = 'Admin' THEN TRUE
            WHEN EXISTS (
                SELECT 1 FROM division_directors dd
                WHERE dd.director_id = ui.id AND dd.division_id = p.division_id
            ) THEN TRUE
            WHEN EXISTS (
                SELECT 1 FROM department_heads dh
                WHERE dh.head_id = ui.id AND dh.department_id = p.department_id
            ) THEN TRUE
            WHEN p.manager_id = ui.id THEN TRUE
            WHEN p.id = ui.id THEN TRUE
            ELSE FALSE
        END as can_edit
    FROM user_info ui
    CROSS JOIN public.employee_info p
    LEFT JOIN public.roles r ON r.id = p.role_id
    WHERE p.organization_id = ui.organization_id
    AND p.status = 'active';
END;
$function$;

-- Update audit trigger
DROP TRIGGER IF EXISTS audit_profiles_trigger ON public.profiles;
DROP TRIGGER IF EXISTS audit_employee_info_trigger ON public.employee_info;
CREATE TRIGGER audit_employee_info_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.employee_info
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- Update updated_at trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_employee_info_updated_at ON public.employee_info;
CREATE TRIGGER update_employee_info_updated_at
  BEFORE UPDATE ON public.employee_info
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

