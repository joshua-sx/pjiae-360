-- Step 1: Create user_roles table for role assignments
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  assigned_by UUID REFERENCES public.profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(profile_id, role, organization_id)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_roles
CREATE POLICY "Organization access for user_roles" 
ON public.user_roles 
FOR ALL 
USING (organization_id = get_user_organization_id());

-- Step 3: Create security definer functions for role checking
CREATE OR REPLACE FUNCTION public.has_role(_profile_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE profile_id = _profile_id
      AND role = _role
      AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_roles(_profile_id UUID)
RETURNS TABLE(role public.app_role)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT ur.role
  FROM public.user_roles ur
  WHERE ur.profile_id = _profile_id
    AND ur.is_active = true;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_roles()
RETURNS TABLE(role public.app_role)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT ur.role
  FROM public.user_roles ur
  JOIN public.profiles p ON p.id = ur.profile_id
  WHERE p.user_id = auth.uid()
    AND ur.is_active = true;
$$;

-- Step 4: Create role determination function
CREATE OR REPLACE FUNCTION public.determine_role_from_position(_profile_id UUID)
RETURNS public.app_role[]
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  profile_record RECORD;
  determined_roles public.app_role[] := ARRAY[]::public.app_role[];
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
    RETURN ARRAY['employee']::public.app_role[];
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
  determined_roles := determined_roles || 'employee';

  -- Add supervisor role if applicable
  IF has_supervisor_title THEN
    determined_roles := determined_roles || 'supervisor';
  END IF;

  -- Add manager role if department head
  IF is_department_head THEN
    determined_roles := determined_roles || 'manager';
  END IF;

  -- Add director role if division head
  IF is_division_head THEN
    determined_roles := determined_roles || 'director';
  END IF;

  -- Note: Admin role is never auto-assigned, must be manually set

  RETURN determined_roles;
END;
$$;

-- Step 5: Create function to sync user roles
CREATE OR REPLACE FUNCTION public.sync_user_roles(_profile_id UUID)
RETURNS VOID
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  profile_record RECORD;
  determined_roles public.app_role[];
  role_item public.app_role;
BEGIN
  -- Get profile information
  SELECT * INTO profile_record FROM public.profiles WHERE id = _profile_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Get determined roles
  determined_roles := public.determine_role_from_position(_profile_id);

  -- Deactivate all non-admin roles for this user
  UPDATE public.user_roles
  SET is_active = false, updated_at = now()
  WHERE profile_id = _profile_id 
    AND role != 'admin'
    AND is_active = true;

  -- Insert/activate determined roles
  FOREACH role_item IN ARRAY determined_roles
  LOOP
    INSERT INTO public.user_roles (profile_id, user_id, role, organization_id)
    VALUES (_profile_id, profile_record.user_id, role_item, profile_record.organization_id)
    ON CONFLICT (profile_id, role, organization_id) 
    DO UPDATE SET 
      is_active = true,
      updated_at = now();
  END LOOP;
END;
$$;

-- Step 6: Create trigger to auto-sync roles when profile changes
CREATE OR REPLACE FUNCTION public.handle_profile_role_sync()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
BEGIN
  -- Sync roles after profile updates
  PERFORM public.sync_user_roles(NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_user_roles_on_profile_update
  AFTER INSERT OR UPDATE OF job_title, department_id, division_id, manager_id
  ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_profile_role_sync();

-- Step 7: Create trigger for updated_at on user_roles
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Step 8: Sync roles for all existing profiles
DO $$
DECLARE
  profile_record RECORD;
BEGIN
  FOR profile_record IN SELECT id FROM public.profiles LOOP
    PERFORM public.sync_user_roles(profile_record.id);
  END LOOP;
END;
$$;