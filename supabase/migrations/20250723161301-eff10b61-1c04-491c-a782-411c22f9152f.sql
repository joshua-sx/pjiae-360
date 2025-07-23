-- Rename profiles table to employee_info and update all related objects
-- Phase 1: Rename the table
ALTER TABLE public.profiles RENAME TO employee_info;

-- Phase 2: Rename all indexes
ALTER INDEX IF EXISTS idx_profiles_division_id RENAME TO idx_employee_info_division_id;
ALTER INDEX IF EXISTS idx_profiles_department_id RENAME TO idx_employee_info_department_id;
ALTER INDEX IF EXISTS idx_profiles_role_id RENAME TO idx_employee_info_role_id;
ALTER INDEX IF EXISTS idx_profiles_status RENAME TO idx_employee_info_status;
ALTER INDEX IF EXISTS idx_profiles_manager_id RENAME TO idx_employee_info_manager_id;
ALTER INDEX IF EXISTS idx_profiles_invitation_token RENAME TO idx_employee_info_invitation_token;

-- Phase 3: Update RLS policies
DROP POLICY IF EXISTS "Admins can view deleted profiles" ON public.employee_info;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.employee_info;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.employee_info;
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.employee_info;

CREATE POLICY "Admins can view deleted employee info" 
ON public.employee_info 
FOR SELECT 
USING ((organization_id = get_user_organization_id()) AND (deleted_at IS NOT NULL) AND has_role('admin'::app_role));

CREATE POLICY "Users can insert their own employee info" 
ON public.employee_info 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own employee info" 
ON public.employee_info 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can view employee info in their organization" 
ON public.employee_info 
FOR SELECT 
USING ((organization_id = get_user_organization_id()) AND (deleted_at IS NULL));

-- Phase 4: Update database functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  existing_profile_id UUID;
  default_org_id UUID;
BEGIN
  -- Check if there's an existing profile with this email
  SELECT id INTO existing_profile_id 
  FROM public.employee_info 
  WHERE email = NEW.email 
  AND user_id IS NULL
  LIMIT 1;
  
  IF existing_profile_id IS NOT NULL THEN
    -- Update existing profile to link to the new user
    UPDATE public.employee_info 
    SET 
      user_id = NEW.id,
      first_name = COALESCE(NEW.raw_user_meta_data ->> 'first_name', first_name),
      last_name = COALESCE(NEW.raw_user_meta_data ->> 'last_name', last_name),
      status = 'active',
      updated_at = now()
    WHERE id = existing_profile_id;
  ELSE
    -- Get default organization ID if no profile exists
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
    -- Log the error but don't block user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$function$;

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

CREATE OR REPLACE FUNCTION public.get_direct_reports(_profile_id uuid)
RETURNS TABLE(profile_id uuid)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT id
  FROM public.employee_info
  WHERE manager_id = _profile_id
  AND organization_id = get_user_organization_id();
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_division_employees(_profile_id uuid)
RETURNS TABLE(profile_id uuid)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $function$
DECLARE
  user_division_id UUID;
BEGIN
  -- Get the user's division
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

CREATE OR REPLACE FUNCTION public.get_current_user_roles()
RETURNS TABLE(role app_role)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT ur.role
  FROM public.user_roles ur
  JOIN public.employee_info p ON p.id = ur.profile_id
  WHERE p.user_id = auth.uid()
  AND ur.is_active = true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.determine_role_from_position(_profile_id uuid)
RETURNS app_role[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  profile_record RECORD;
  determined_roles public.app_role[] := ARRAY[]::public.app_role[];
  is_division_head BOOLEAN := false;
  is_department_head BOOLEAN := false;
  has_supervisor_title BOOLEAN := false;
  has_manager_title BOOLEAN := false;
  has_director_title BOOLEAN := false;
  direct_reports_count INTEGER := 0;
BEGIN
  -- Get profile information with related data
  SELECT p.*, d.name as department_name, div.name as division_name,
         COALESCE(p.job_title, '') as job_title_safe
  INTO profile_record
  FROM public.employee_info p
  LEFT JOIN public.departments d ON d.id = p.department_id
  LEFT JOIN public.divisions div ON div.id = p.division_id
  WHERE p.id = _profile_id;

  IF NOT FOUND THEN
    RETURN ARRAY['employee']::public.app_role[];
  END IF;

  -- Count direct reports
  SELECT COUNT(*) INTO direct_reports_count
  FROM public.employee_info 
  WHERE manager_id = _profile_id 
  AND organization_id = profile_record.organization_id
  AND deleted_at IS NULL;

  -- Check job title for role keywords (case insensitive)
  IF profile_record.job_title_safe IS NOT NULL THEN
    has_director_title := (
      LOWER(profile_record.job_title_safe) LIKE '%director%' OR
      LOWER(profile_record.job_title_safe) LIKE '%head%' OR
      LOWER(profile_record.job_title_safe) LIKE '%chief%' OR
      LOWER(profile_record.job_title_safe) LIKE '%vp%' OR
      LOWER(profile_record.job_title_safe) LIKE '%vice president%'
    );
    
    has_manager_title := (
      LOWER(profile_record.job_title_safe) LIKE '%manager%' OR
      LOWER(profile_record.job_title_safe) LIKE '%team lead%'
    );
    
    has_supervisor_title := (
      LOWER(profile_record.job_title_safe) LIKE '%supervisor%' OR
      LOWER(profile_record.job_title_safe) LIKE '%lead%' OR
      LOWER(profile_record.job_title_safe) LIKE '%coordinator%'
    );
  END IF;

  -- Check if user manages a division or department
  SELECT EXISTS(
    SELECT 1 FROM public.divisions 
    WHERE id = profile_record.division_id 
    AND organization_id = profile_record.organization_id
    AND EXISTS(
      SELECT 1 FROM public.employee_info p2 
      WHERE p2.division_id = profile_record.division_id 
      AND p2.manager_id = _profile_id
      AND p2.deleted_at IS NULL
    )
  ) INTO is_division_head;

  SELECT EXISTS(
    SELECT 1 FROM public.departments 
    WHERE id = profile_record.department_id 
    AND organization_id = profile_record.organization_id
    AND EXISTS(
      SELECT 1 FROM public.employee_info p2 
      WHERE p2.department_id = profile_record.department_id 
      AND p2.manager_id = _profile_id
      AND p2.deleted_at IS NULL
    )
  ) INTO is_department_head;

  -- Determine roles based on hierarchy and responsibilities
  -- Everyone gets employee role as base
  determined_roles := determined_roles || 'employee';

  -- Add supervisor role if applicable
  IF has_supervisor_title OR (direct_reports_count > 0 AND direct_reports_count <= 5) THEN
    determined_roles := determined_roles || 'supervisor';
  END IF;

  -- Add manager role if applicable
  IF has_manager_title OR is_department_head OR (direct_reports_count > 5) THEN
    determined_roles := determined_roles || 'manager';
  END IF;

  -- Add director role if applicable
  IF has_director_title OR is_division_head OR (direct_reports_count > 15) THEN
    determined_roles := determined_roles || 'director';
  END IF;

  -- Note: Admin role is never auto-assigned for security reasons
  RETURN determined_roles;
END;
$function$;

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
  SELECT * INTO profile_record FROM public.employee_info WHERE id = _profile_id;
  
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

-- Phase 5: Update triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.employee_info;
DROP TRIGGER IF EXISTS sync_user_roles_on_profile_update ON public.employee_info;
DROP TRIGGER IF EXISTS audit_profiles_trigger ON public.employee_info;

CREATE TRIGGER update_employee_info_updated_at
BEFORE UPDATE ON public.employee_info
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER sync_user_roles_on_employee_info_update
AFTER INSERT OR UPDATE OF job_title, department_id, division_id, manager_id ON public.employee_info
FOR EACH ROW
EXECUTE FUNCTION public.handle_profile_role_sync();

CREATE TRIGGER audit_employee_info_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.employee_info
FOR EACH ROW
EXECUTE FUNCTION public.audit_trigger_func();