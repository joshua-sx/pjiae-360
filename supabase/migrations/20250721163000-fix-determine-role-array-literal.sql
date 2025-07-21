-- Fix the determine_role_from_position function to properly handle enum array creation
-- Issue: "malformed array literal: 'employee'" error when creating profiles

CREATE OR REPLACE FUNCTION public.determine_role_from_position(_profile_id UUID)
RETURNS public.app_role[]
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  profile_record RECORD;
  determined_roles public.app_role[] := '{}';
  is_division_head BOOLEAN := false;
  is_department_head BOOLEAN := false;
  has_supervisor_title BOOLEAN := false;
BEGIN
  -- Get profile information
  SELECT p.*, d.name as department_name, div.name as division_name
  INTO profile_record
  FROM public.profiles p
  LEFT JOIN public.departments d ON d.id = p.department_id
  LEFT JOIN public.divisions div ON div.id = p.division_id
  WHERE p.id = _profile_id;

  IF NOT FOUND THEN
    -- Return array with employee role using array_append instead of array literal
    RETURN array_append(determined_roles, 'employee'::public.app_role);
  END IF;

  -- Check if user is division head (director)
  SELECT EXISTS(
    SELECT 1 FROM public.divisions 
    WHERE id = profile_record.division_id 
    AND organization_id = profile_record.organization_id
  ) INTO is_division_head;

  -- Check if user is department head (manager)
  SELECT EXISTS(
    SELECT 1 FROM public.departments 
    WHERE id = profile_record.department_id 
    AND organization_id = profile_record.organization_id
  ) INTO is_department_head;

  -- Check job title for supervisor keywords
  IF profile_record.job_title IS NOT NULL THEN
    has_supervisor_title := (
      LOWER(profile_record.job_title) LIKE '%supervisor%' OR
      LOWER(profile_record.job_title) LIKE '%lead%' OR
      LOWER(profile_record.job_title) LIKE '%coordinator%'
    );
  END IF;

  -- Determine roles based on hierarchy
  -- Everyone gets employee role
  determined_roles := array_append(determined_roles, 'employee'::public.app_role);

  -- Add supervisor role if applicable
  IF has_supervisor_title THEN
    determined_roles := array_append(determined_roles, 'supervisor'::public.app_role);
  END IF;

  -- Add manager role if department head
  IF is_department_head THEN
    determined_roles := array_append(determined_roles, 'manager'::public.app_role);
  END IF;

  -- Add director role if division head
  IF is_division_head THEN
    determined_roles := array_append(determined_roles, 'director'::public.app_role);
  END IF;

  -- Note: Admin role is never auto-assigned, must be manually set

  RETURN determined_roles;
END;
$$;