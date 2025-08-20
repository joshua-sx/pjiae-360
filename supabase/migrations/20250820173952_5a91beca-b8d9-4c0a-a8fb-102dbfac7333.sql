-- Create a function to get filtered employees with search, division, department, and status filters
CREATE OR REPLACE FUNCTION public.get_secure_employee_directory_filtered(
  _search text DEFAULT NULL,
  _division_ids text[] DEFAULT NULL,
  _department_ids text[] DEFAULT NULL,
  _status text DEFAULT NULL,
  _limit integer DEFAULT 1000,
  _offset integer DEFAULT 0
)
RETURNS TABLE(
  employee_id uuid,
  user_id uuid,
  first_name text,
  last_name text,
  job_title text,
  status user_status,
  employment_type text,
  location text,
  organization_id uuid,
  department_name text,
  division_name text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  _org_id uuid;
BEGIN
  -- Get current user's organization
  _org_id := public.get_current_user_org_id();
  
  IF _org_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    ei.id as employee_id,
    ei.user_id,
    p.first_name,
    p.last_name,
    ei.job_title,
    ei.status,
    ei.employment_type,
    ei.location,
    ei.organization_id,
    d.name as department_name,
    div.name as division_name
  FROM public.employee_info ei
  LEFT JOIN public.profiles p ON p.user_id = ei.user_id
  LEFT JOIN public.departments d ON d.id = ei.department_id
  LEFT JOIN public.divisions div ON div.id = ei.division_id
  WHERE ei.organization_id = _org_id
    -- Search filter
    AND (
      _search IS NULL OR 
      _search = '' OR
      LOWER(p.first_name) LIKE LOWER('%' || _search || '%') OR
      LOWER(p.last_name) LIKE LOWER('%' || _search || '%') OR
      LOWER(p.email) LIKE LOWER('%' || _search || '%') OR
      LOWER(ei.job_title) LIKE LOWER('%' || _search || '%')
    )
    -- Division filter
    AND (
      _division_ids IS NULL OR 
      array_length(_division_ids, 1) IS NULL OR
      ei.division_id::text = ANY(_division_ids)
    )
    -- Department filter
    AND (
      _department_ids IS NULL OR 
      array_length(_department_ids, 1) IS NULL OR
      ei.department_id::text = ANY(_department_ids)
    )
    -- Status filter
    AND (
      _status IS NULL OR 
      _status = 'all' OR
      ei.status::text = _status
    )
  ORDER BY p.last_name, p.first_name
  LIMIT _limit
  OFFSET _offset;
END;
$$;

-- Create a function to count filtered employees
CREATE OR REPLACE FUNCTION public.get_secure_employee_directory_count_filtered(
  _search text DEFAULT NULL,
  _division_ids text[] DEFAULT NULL,
  _department_ids text[] DEFAULT NULL,
  _status text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  _org_id uuid;
  _count integer;
BEGIN
  -- Get current user's organization
  _org_id := public.get_current_user_org_id();
  
  IF _org_id IS NULL THEN
    RETURN 0;
  END IF;

  SELECT COUNT(*)::integer INTO _count
  FROM public.employee_info ei
  LEFT JOIN public.profiles p ON p.user_id = ei.user_id
  WHERE ei.organization_id = _org_id
    -- Search filter
    AND (
      _search IS NULL OR 
      _search = '' OR
      LOWER(p.first_name) LIKE LOWER('%' || _search || '%') OR
      LOWER(p.last_name) LIKE LOWER('%' || _search || '%') OR
      LOWER(p.email) LIKE LOWER('%' || _search || '%') OR
      LOWER(ei.job_title) LIKE LOWER('%' || _search || '%')
    )
    -- Division filter
    AND (
      _division_ids IS NULL OR 
      array_length(_division_ids, 1) IS NULL OR
      ei.division_id::text = ANY(_division_ids)
    )
    -- Department filter
    AND (
      _department_ids IS NULL OR 
      array_length(_department_ids, 1) IS NULL OR
      ei.department_id::text = ANY(_department_ids)
    )
    -- Status filter
    AND (
      _status IS NULL OR 
      _status = 'all' OR
      ei.status::text = _status
    );

  RETURN _count;
END;
$$;