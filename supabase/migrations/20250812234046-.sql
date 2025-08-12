-- Employee Management Functions
CREATE OR REPLACE FUNCTION public.get_organization_employees()
RETURNS TABLE(
  employee_id uuid,
  user_id uuid,
  email text,
  first_name text,
  last_name text,
  full_name text,
  job_title text,
  department_id uuid,
  department_name text,
  division_id uuid,
  division_name text,
  manager_id uuid,
  hire_date date,
  status user_status,
  employee_number text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT 
    ei.id as employee_id,
    ei.user_id,
    p.email,
    p.first_name,
    p.last_name,
    CASE 
      WHEN p.first_name IS NOT NULL AND p.last_name IS NOT NULL 
      THEN TRIM(p.first_name || ' ' || p.last_name)
      ELSE p.email
    END as full_name,
    ei.job_title,
    ei.department_id,
    d.name as department_name,
    ei.division_id,
    div.name as division_name,
    ei.manager_id,
    ei.hire_date,
    ei.status,
    ei.employee_number,
    ei.created_at,
    ei.updated_at
  FROM public.employee_info ei
  LEFT JOIN public.profiles p ON p.user_id = ei.user_id
  LEFT JOIN public.departments d ON d.id = ei.department_id
  LEFT JOIN public.divisions div ON div.id = ei.division_id
  WHERE ei.organization_id = public.get_current_user_org_id();
$function$;

CREATE OR REPLACE FUNCTION public.get_organization_employee_by_id(_employee_id uuid)
RETURNS TABLE(
  employee_id uuid,
  user_id uuid,
  email text,
  first_name text,
  last_name text,
  full_name text,
  job_title text,
  department_id uuid,
  department_name text,
  division_id uuid,
  division_name text,
  manager_id uuid,
  hire_date date,
  status user_status,
  employee_number text,
  organization_id uuid
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT 
    ei.id as employee_id,
    ei.user_id,
    p.email,
    p.first_name,
    p.last_name,
    CASE 
      WHEN p.first_name IS NOT NULL AND p.last_name IS NOT NULL 
      THEN TRIM(p.first_name || ' ' || p.last_name)
      ELSE p.email
    END as full_name,
    ei.job_title,
    ei.department_id,
    d.name as department_name,
    ei.division_id,
    div.name as division_name,
    ei.manager_id,
    ei.hire_date,
    ei.status,
    ei.employee_number,
    ei.organization_id
  FROM public.employee_info ei
  LEFT JOIN public.profiles p ON p.user_id = ei.user_id
  LEFT JOIN public.departments d ON d.id = ei.department_id
  LEFT JOIN public.divisions div ON div.id = ei.division_id
  WHERE ei.id = _employee_id 
    AND ei.organization_id = public.get_current_user_org_id();
$function$;

-- Invitation & Onboarding Functions
CREATE OR REPLACE FUNCTION public.create_employee_invitation(
  _email text,
  _first_name text,
  _last_name text,
  _job_title text,
  _department_id uuid DEFAULT NULL,
  _division_id uuid DEFAULT NULL,
  _role_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  _org_id uuid;
  _profile_id uuid;
  _employee_id uuid;
BEGIN
  -- Get current user's organization
  _org_id := public.get_current_user_org_id();
  
  IF _org_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not in any organization');
  END IF;

  -- Validate department/division belong to organization
  IF _department_id IS NOT NULL THEN
    IF NOT EXISTS(SELECT 1 FROM public.departments WHERE id = _department_id AND organization_id = _org_id) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Department not found in organization');
    END IF;
  END IF;

  IF _division_id IS NOT NULL THEN
    IF NOT EXISTS(SELECT 1 FROM public.divisions WHERE id = _division_id AND organization_id = _org_id) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Division not found in organization');
    END IF;
  END IF;

  -- Create profile entry for invited user
  INSERT INTO public.profiles (first_name, last_name, email, user_id)
  VALUES (_first_name, _last_name, _email, NULL)
  RETURNING id INTO _profile_id;

  -- Create employee info for invited user
  INSERT INTO public.employee_info (
    job_title, department_id, division_id, organization_id, status, user_id
  ) VALUES (
    _job_title, _department_id, _division_id, _org_id, 'invited', NULL
  ) RETURNING id INTO _employee_id;

  RETURN jsonb_build_object(
    'success', true, 
    'employee_id', _employee_id,
    'profile_id', _profile_id
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$function$;

CREATE OR REPLACE FUNCTION public.claim_employee_invitation(_email text, _user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  _profile_record RECORD;
  _employee_record RECORD;
BEGIN
  -- Find profile by email
  SELECT * INTO _profile_record
  FROM public.profiles
  WHERE email = _email AND user_id IS NULL;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid invitation email');
  END IF;

  -- Find employee_info without user_id (invited status)
  SELECT * INTO _employee_record
  FROM public.employee_info
  WHERE status = 'invited' AND user_id IS NULL
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'No pending invitation found');
  END IF;

  -- Update employee_info with user_id
  UPDATE public.employee_info
  SET user_id = _user_id, status = 'active'
  WHERE id = _employee_record.id;

  -- Update profile with user_id
  UPDATE public.profiles
  SET user_id = _user_id
  WHERE id = _profile_record.id;

  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$function$;

-- Appraiser & Assessment Functions
CREATE OR REPLACE FUNCTION public.get_potential_appraisers(_employee_id uuid)
RETURNS TABLE(
  appraiser_id uuid,
  user_id uuid,
  first_name text,
  last_name text,
  full_name text,
  job_title text,
  role text,
  hierarchy_level integer
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  _org_id uuid;
  _dept_id uuid;
  _manager_id uuid;
BEGIN
  -- Get employee details
  SELECT ei.organization_id, ei.department_id, ei.manager_id
  INTO _org_id, _dept_id, _manager_id
  FROM public.employee_info ei
  WHERE ei.id = _employee_id;

  -- Validate employee belongs to current user's organization
  IF _org_id != public.get_current_user_org_id() THEN
    RETURN;
  END IF;

  -- Return direct manager (highest priority)
  IF _manager_id IS NOT NULL THEN
    RETURN QUERY
    SELECT 
      ei.id as appraiser_id,
      ei.user_id,
      p.first_name,
      p.last_name,
      CASE 
        WHEN p.first_name IS NOT NULL AND p.last_name IS NOT NULL 
        THEN TRIM(p.first_name || ' ' || p.last_name)
        ELSE p.email
      END as full_name,
      ei.job_title,
      'manager'::text as role,
      1 as hierarchy_level
    FROM public.employee_info ei
    LEFT JOIN public.profiles p ON p.user_id = ei.user_id
    WHERE ei.id = _manager_id 
      AND ei.organization_id = _org_id
      AND ei.status = 'active';
  END IF;

  -- Return department managers (if different from direct manager)
  RETURN QUERY
  SELECT 
    ei.id as appraiser_id,
    ei.user_id,
    p.first_name,
    p.last_name,
    CASE 
      WHEN p.first_name IS NOT NULL AND p.last_name IS NOT NULL 
      THEN TRIM(p.first_name || ' ' || p.last_name)
      ELSE p.email
    END as full_name,
    ei.job_title,
    'department_manager'::text as role,
    2 as hierarchy_level
  FROM public.employee_info ei
  LEFT JOIN public.profiles p ON p.user_id = ei.user_id
  WHERE ei.department_id = _dept_id 
    AND ei.organization_id = _org_id
    AND ei.status = 'active'
    AND ei.id != _employee_id
    AND ei.id != COALESCE(_manager_id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND EXISTS(
      SELECT 1 FROM public.employee_info sub_ei 
      WHERE sub_ei.manager_id = ei.id
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_appraiser_assignment(_appraiser_id uuid, _employee_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT 
    CASE 
      WHEN _appraiser_id = _employee_id THEN
        jsonb_build_object('valid', false, 'reason', 'Cannot assign self as appraiser')
      WHEN NOT EXISTS(
        SELECT 1 FROM public.employee_info ei1, public.employee_info ei2
        WHERE ei1.id = _appraiser_id 
          AND ei2.id = _employee_id
          AND ei1.organization_id = ei2.organization_id
          AND ei1.organization_id = public.get_current_user_org_id()
      ) THEN
        jsonb_build_object('valid', false, 'reason', 'Appraiser and employee must be in same organization')
      ELSE
        jsonb_build_object('valid', true, 'reason', null)
    END;
$function$;

-- Department/Division Management Functions
CREATE OR REPLACE FUNCTION public.get_organization_structure()
RETURNS TABLE(
  dept_id uuid,
  dept_name text,
  dept_division_id uuid,
  div_id uuid,
  div_name text,
  employee_count bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT 
    d.id as dept_id,
    d.name as dept_name,
    d.division_id as dept_division_id,
    div.id as div_id,
    div.name as div_name,
    COUNT(ei.id) as employee_count
  FROM public.departments d
  LEFT JOIN public.divisions div ON div.id = d.division_id
  LEFT JOIN public.employee_info ei ON ei.department_id = d.id
  WHERE d.organization_id = public.get_current_user_org_id()
  GROUP BY d.id, d.name, d.division_id, div.id, div.name
  
  UNION ALL
  
  SELECT 
    NULL as dept_id,
    NULL as dept_name,
    NULL as dept_division_id,
    div.id as div_id,
    div.name as div_name,
    COUNT(ei.id) as employee_count
  FROM public.divisions div
  LEFT JOIN public.employee_info ei ON ei.division_id = div.id AND ei.department_id IS NULL
  WHERE div.organization_id = public.get_current_user_org_id()
    AND div.id NOT IN (
      SELECT DISTINCT division_id 
      FROM public.departments 
      WHERE division_id IS NOT NULL 
        AND organization_id = public.get_current_user_org_id()
    )
  GROUP BY div.id, div.name;
$function$;

CREATE OR REPLACE FUNCTION public.validate_dept_assignment(_dept_id uuid, _employee_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS(
    SELECT 1 
    FROM public.departments d, public.employee_info ei
    WHERE d.id = _dept_id 
      AND ei.id = _employee_id
      AND d.organization_id = ei.organization_id
      AND d.organization_id = public.get_current_user_org_id()
  );
$function$;