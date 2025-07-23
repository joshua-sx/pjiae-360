-- Update database functions to use employee_info instead of profiles

-- Update has_role function
CREATE OR REPLACE FUNCTION public.has_role(_role app_role)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.employee_info p ON p.id = ur.profile_id
    WHERE p.user_id = auth.uid()
    AND ur.role = _role
    AND ur.is_active = true
  );
END;
$function$;

-- Update validate_role_hierarchy function
CREATE OR REPLACE FUNCTION public.validate_role_hierarchy(_manager_id uuid, _employee_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
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

-- Update get_role_audit_history function
CREATE OR REPLACE FUNCTION public.get_role_audit_history(_profile_id uuid, _limit integer DEFAULT 50)
 RETURNS TABLE(id uuid, old_role app_role, new_role app_role, action_type text, assigned_by_name text, reason text, created_at timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
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
    AND ral.organization_id = get_user_organization_id()
  ORDER BY ral.created_at DESC
  LIMIT _limit;
END;
$function$;

-- Update get_user_organization_id function
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
  RETURN (SELECT organization_id FROM public.employee_info WHERE user_id = auth.uid());
END;
$function$;