-- Fix Database Function Security Gap: Add SET search_path = '' to all functions
-- This prevents search path manipulation attacks

-- 1. Fix soft_delete_record function
CREATE OR REPLACE FUNCTION public.soft_delete_record(_table_name text, _record_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  _sql text;
  _org_id uuid;
BEGIN
  -- Verify user has access to the organization
  _org_id := public.get_user_organization_id();
  
  -- Build dynamic SQL for soft delete
  _sql := format(
    'UPDATE public.%I SET deleted_at = now() WHERE id = $1 AND organization_id = $2 AND deleted_at IS NULL',
    _table_name
  );
  
  -- Execute the soft delete
  EXECUTE _sql USING _record_id, _org_id;
  
  -- Return true if a row was affected
  RETURN FOUND;
END;
$function$;

-- 2. Fix restore_record function
CREATE OR REPLACE FUNCTION public.restore_record(_table_name text, _record_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  _sql text;
  _org_id uuid;
BEGIN
  -- Verify user has admin role
  IF NOT public.has_role('admin') THEN
    RAISE EXCEPTION 'Only administrators can restore deleted records';
  END IF;
  
  -- Get organization ID
  _org_id := public.get_user_organization_id();
  
  -- Build dynamic SQL for restore
  _sql := format(
    'UPDATE public.%I SET deleted_at = NULL WHERE id = $1 AND organization_id = $2 AND deleted_at IS NOT NULL',
    _table_name
  );
  
  -- Execute the restore
  EXECUTE _sql USING _record_id, _org_id;
  
  -- Return true if a row was affected
  RETURN FOUND;
END;
$function$;

-- 3. Fix get_division_employees function
CREATE OR REPLACE FUNCTION public.get_division_employees(_profile_id uuid)
 RETURNS TABLE(profile_id uuid)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
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
  AND organization_id = public.get_user_organization_id();
END;
$function$;

-- 4. Fix permanent_delete_old_records function
CREATE OR REPLACE FUNCTION public.permanent_delete_old_records(_table_name text, _days_old integer DEFAULT 90)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  _sql text;
  _deleted_count integer;
  _org_id uuid;
BEGIN
  -- Verify user has admin role
  IF NOT public.has_role('admin') THEN
    RAISE EXCEPTION 'Only administrators can permanently delete records';
  END IF;
  
  -- Get organization ID
  _org_id := public.get_user_organization_id();
  
  -- Build dynamic SQL for permanent deletion
  _sql := format(
    'DELETE FROM public.%I WHERE organization_id = $1 AND deleted_at IS NOT NULL AND deleted_at < now() - interval ''%s days''',
    _table_name,
    _days_old
  );
  
  -- Execute the permanent deletion
  EXECUTE _sql USING _org_id;
  
  -- Get count of deleted rows
  GET DIAGNOSTICS _deleted_count = ROW_COUNT;
  
  RETURN _deleted_count;
END;
$function$;

-- 5. Fix audit_trigger_func function
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  _old_data JSONB;
  _new_data JSONB;
  _user_id UUID;
  _org_id UUID;
BEGIN
  -- Get user info
  _user_id := auth.uid();
  
  -- Get organization ID from the record
  IF TG_OP = 'DELETE' THEN
    _org_id := OLD.organization_id;
  ELSE
    _org_id := NEW.organization_id;
  END IF;
  
  -- Build old and new data JSON
  IF TG_OP = 'DELETE' THEN
    _old_data := to_jsonb(OLD);
    _new_data := NULL;
  ELSIF TG_OP = 'INSERT' THEN
    _old_data := NULL;
    _new_data := to_jsonb(NEW);
  ELSE -- UPDATE
    _old_data := to_jsonb(OLD);
    _new_data := to_jsonb(NEW);
  END IF;
  
  -- Insert audit record
  INSERT INTO public.audit_log (
    table_name,
    record_id,
    action,
    old_values,
    new_values,
    user_id,
    organization_id
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    _old_data,
    _new_data,
    _user_id,
    _org_id
  );
  
  -- Return appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$function$;

-- 6. Fix get_audit_history function
CREATE OR REPLACE FUNCTION public.get_audit_history(_table_name text, _record_id uuid, _limit integer DEFAULT 50)
 RETURNS TABLE(id uuid, action text, old_values jsonb, new_values jsonb, user_id uuid, created_at timestamp with time zone, context jsonb)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.action,
    al.old_values,
    al.new_values,
    al.user_id,
    al.created_at,
    al.context
  FROM public.audit_log al
  WHERE al.table_name = _table_name
    AND al.record_id = _record_id
    AND al.organization_id = public.get_user_organization_id()
  ORDER BY al.created_at DESC
  LIMIT _limit;
END;
$function$;

-- 7. Fix get_recent_audit_activity function
CREATE OR REPLACE FUNCTION public.get_recent_audit_activity(_limit integer DEFAULT 100, _table_filter text DEFAULT NULL::text, _user_filter uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, table_name text, record_id uuid, action text, old_values jsonb, new_values jsonb, user_id uuid, created_at timestamp with time zone, context jsonb)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.table_name,
    al.record_id,
    al.action,
    al.old_values,
    al.new_values,
    al.user_id,
    al.created_at,
    al.context
  FROM public.audit_log al
  WHERE al.organization_id = public.get_user_organization_id()
    AND (_table_filter IS NULL OR al.table_name = _table_filter)
    AND (_user_filter IS NULL OR al.user_id = _user_filter)
  ORDER BY al.created_at DESC
  LIMIT _limit;
END;
$function$;

-- 8. Fix determine_role_from_position function
CREATE OR REPLACE FUNCTION public.determine_role_from_position(_profile_id uuid)
 RETURNS app_role[]
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
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

-- 9. Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  existing_profile_id UUID;
  default_org_id UUID;
  new_profile_id UUID;
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
      name = COALESCE(
        (NEW.raw_user_meta_data ->> 'first_name') || ' ' || (NEW.raw_user_meta_data ->> 'last_name'),
        name
      ),
      status = 'active',
      updated_at = now()
    WHERE id = existing_profile_id;
    
    new_profile_id := existing_profile_id;
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
    INSERT INTO public.employee_info (
      user_id, email, first_name, last_name, name, organization_id, status
    )
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data ->> 'first_name',
      NEW.raw_user_meta_data ->> 'last_name',
      COALESCE(
        (NEW.raw_user_meta_data ->> 'first_name') || ' ' || (NEW.raw_user_meta_data ->> 'last_name'),
        NEW.email
      ),
      COALESCE((NEW.raw_user_meta_data ->> 'organization_id')::UUID, default_org_id),
      'active'
    ) RETURNING id INTO new_profile_id;
  END IF;

  -- Assign employee role only (security: no automatic admin assignment)
  INSERT INTO public.user_roles (profile_id, user_id, role, organization_id)
  SELECT 
    new_profile_id,
    NEW.id,
    'employee'::app_role,
    organization_id
  FROM public.employee_info 
  WHERE id = new_profile_id
  ON CONFLICT (profile_id, role, organization_id) 
  DO UPDATE SET 
    is_active = true,
    user_id = NEW.id,
    assigned_at = now(),
    updated_at = now();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$function$;

-- 10. Fix get_direct_reports function
CREATE OR REPLACE FUNCTION public.get_direct_reports(_profile_id uuid)
 RETURNS TABLE(profile_id uuid)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT id
  FROM public.employee_info
  WHERE manager_id = _profile_id
  AND organization_id = public.get_user_organization_id();
END;
$function$;

-- 11. Fix validate_role_assignment function
CREATE OR REPLACE FUNCTION public.validate_role_assignment(_profile_id uuid, _role app_role, _assigned_by uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  has_admin boolean := false;
  has_director boolean := false;
  has_manager boolean := false;
  target_org_id uuid;
  assigner_org_id uuid;
BEGIN
  -- Get assigner's roles
  SELECT 
    bool_or(ur.role = 'admin'),
    bool_or(ur.role = 'director'),
    bool_or(ur.role = 'manager')
  INTO has_admin, has_director, has_manager
  FROM public.user_roles ur
  JOIN public.employee_info p ON p.id = ur.profile_id
  WHERE ur.profile_id = _assigned_by
  AND ur.is_active = true;

  -- Get organization IDs
  SELECT organization_id INTO target_org_id
  FROM public.employee_info WHERE id = _profile_id;
  
  SELECT organization_id INTO assigner_org_id
  FROM public.employee_info WHERE id = _assigned_by;

  -- Must be in same organization
  IF target_org_id != assigner_org_id THEN
    RETURN false;
  END IF;

  -- Admin role can only be assigned by existing admins
  IF _role = 'admin' AND NOT has_admin THEN
    RETURN false;
  END IF;

  -- Director role requires admin or director
  IF _role = 'director' AND NOT (has_admin OR has_director) THEN
    RETURN false;
  END IF;

  -- Manager role requires admin, director, or manager
  IF _role = 'manager' AND NOT (has_admin OR has_director OR has_manager) THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$function$;

-- 12. Fix handle_profile_role_sync function
CREATE OR REPLACE FUNCTION public.handle_profile_role_sync()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Sync roles after profile updates, passing the current user as assigner
  PERFORM public.sync_user_roles(NEW.id, public.get_user_profile_id());
  RETURN NEW;
END;
$function$;

-- 13. Fix get_role_audit_history function
CREATE OR REPLACE FUNCTION public.get_role_audit_history(_profile_id uuid, _limit integer DEFAULT 50)
 RETURNS TABLE(id uuid, old_role app_role, new_role app_role, action_type text, assigned_by_name text, reason text, created_at timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ral.id,
    ral.old_role,
    ral.new_role,
    ral.action_type,
    COALESCE(p.first_name || ' ' || p.last_name, p.name, 'System') as assigned_by_name,
    ral.reason,
    ral.created_at
  FROM public.role_audit_log ral
  LEFT JOIN public.employee_info p ON p.id = ral.assigned_by
  WHERE ral.profile_id = _profile_id
    AND ral.organization_id = public.get_user_organization_id()
  ORDER BY ral.created_at DESC
  LIMIT _limit;
END;
$function$;

-- 14. Fix sync_user_roles function
CREATE OR REPLACE FUNCTION public.sync_user_roles(_profile_id uuid, _assigned_by uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
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

-- 15. Fix assign_user_role function
CREATE OR REPLACE FUNCTION public.assign_user_role(_profile_id uuid, _role app_role, _reason text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  _assigned_by uuid;
  _org_id uuid;
  _user_id uuid;
BEGIN
  -- Get current user's profile ID
  _assigned_by := public.get_user_profile_id();
  
  -- Get organization ID and user_id
  SELECT organization_id, user_id INTO _org_id, _user_id
  FROM public.employee_info WHERE id = _profile_id;

  -- Validate assignment
  IF NOT public.validate_role_assignment(_profile_id, _role, _assigned_by) THEN
    RAISE EXCEPTION 'Insufficient permissions to assign role %', _role;
  END IF;

  -- Insert or update role
  INSERT INTO public.user_roles (profile_id, user_id, role, organization_id, assigned_by)
  VALUES (_profile_id, _user_id, _role, _org_id, _assigned_by)
  ON CONFLICT (profile_id, role, organization_id) 
  DO UPDATE SET 
    is_active = true,
    user_id = _user_id,
    assigned_by = _assigned_by,
    assigned_at = now(),
    updated_at = now();

  -- Log the assignment
  INSERT INTO public.role_audit_log (
    profile_id, new_role, action_type, assigned_by, reason, organization_id
  ) VALUES (
    _profile_id, _role, 'assigned', _assigned_by, _reason, _org_id
  );

  RETURN true;
END;
$function$;

-- 16. Fix validate_role_hierarchy function
CREATE OR REPLACE FUNCTION public.validate_role_hierarchy(_manager_id uuid, _employee_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  manager_roles public.app_role[];
  employee_roles public.app_role[];
  manager_highest_role public.app_role;
  employee_highest_role public.app_role;
BEGIN
  -- Get manager roles
  SELECT ARRAY_AGG(role ORDER BY 
    CASE role 
      WHEN 'admin' THEN 5
      WHEN 'director' THEN 4  
      WHEN 'manager' THEN 3
      WHEN 'supervisor' THEN 2
      WHEN 'employee' THEN 1
    END DESC
  ) INTO manager_roles
  FROM public.user_roles ur
  JOIN public.employee_info p ON p.id = ur.profile_id
  WHERE ur.profile_id = _manager_id 
    AND ur.is_active = true;

  -- Get employee roles  
  SELECT ARRAY_AGG(role ORDER BY 
    CASE role 
      WHEN 'admin' THEN 5
      WHEN 'director' THEN 4  
      WHEN 'manager' THEN 3
      WHEN 'supervisor' THEN 2
      WHEN 'employee' THEN 1
    END DESC
  ) INTO employee_roles
  FROM public.user_roles ur
  JOIN public.employee_info p ON p.id = ur.profile_id
  WHERE ur.profile_id = _employee_id 
    AND ur.is_active = true;

  -- Get highest roles
  manager_highest_role := manager_roles[1];
  employee_highest_role := employee_roles[1];

  -- Validate hierarchy (manager must have equal or higher role)
  RETURN (
    CASE manager_highest_role 
      WHEN 'admin' THEN 5
      WHEN 'director' THEN 4  
      WHEN 'manager' THEN 3
      WHEN 'supervisor' THEN 2
      WHEN 'employee' THEN 1
      ELSE 0
    END
  ) >= (
    CASE employee_highest_role 
      WHEN 'admin' THEN 5
      WHEN 'director' THEN 4  
      WHEN 'manager' THEN 3
      WHEN 'supervisor' THEN 2
      WHEN 'employee' THEN 1
      ELSE 0
    END
  );
END;
$function$;

-- 17. Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;