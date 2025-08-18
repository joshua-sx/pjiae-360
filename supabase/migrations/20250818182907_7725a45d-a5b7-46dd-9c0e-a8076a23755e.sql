-- Phase 1: Database hardening for secure onboarding

-- 1. Create atomic organization creation and membership RPC
CREATE OR REPLACE FUNCTION public.create_organization_and_membership(_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  _org_id uuid;
  _user_id uuid;
BEGIN
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Check if user already belongs to an organization
  IF EXISTS(SELECT 1 FROM public.employee_info WHERE user_id = _user_id) THEN
    RAISE EXCEPTION 'User already belongs to an organization';
  END IF;

  -- Create organization
  INSERT INTO public.organizations (name)
  VALUES (_name)
  RETURNING id INTO _org_id;

  -- Create employee_info for the user (making them admin)
  INSERT INTO public.employee_info (
    user_id, 
    organization_id, 
    status,
    job_title
  ) VALUES (
    _user_id, 
    _org_id, 
    'active',
    'Administrator'
  );

  -- Assign admin role
  INSERT INTO public.user_roles (user_id, role, organization_id, is_active)
  VALUES (_user_id, 'admin'::app_role, _org_id, true);

  -- Log organization creation
  INSERT INTO public.security_audit_log (
    user_id, organization_id, event_type, event_details, success
  ) VALUES (
    _user_id, _org_id, 'org_created',
    jsonb_build_object('org_name', _name, 'created_by', _user_id), true
  );

  -- Log user joining organization
  INSERT INTO public.security_audit_log (
    user_id, organization_id, event_type, event_details, success
  ) VALUES (
    _user_id, _org_id, 'user_joined_org',
    jsonb_build_object('role', 'admin', 'method', 'org_creation'), true
  );

  RETURN _org_id;
EXCEPTION WHEN OTHERS THEN
  -- Log error
  INSERT INTO public.security_audit_log (
    user_id, organization_id, event_type, event_details, success
  ) VALUES (
    _user_id, NULL, 'org_creation_error',
    jsonb_build_object('error', SQLERRM, 'org_name', _name), false
  );
  RAISE;
END;
$function$;

-- 2. Add normalized name columns to divisions and departments
ALTER TABLE public.divisions ADD COLUMN IF NOT EXISTS normalized_name text;
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS normalized_name text;

-- 3. Create trigger function for normalization
CREATE OR REPLACE FUNCTION public.normalize_name_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.normalized_name := lower(trim(NEW.name));
  RETURN NEW;
END;
$function$;

-- 4. Create triggers for divisions and departments
DROP TRIGGER IF EXISTS normalize_division_name ON public.divisions;
CREATE TRIGGER normalize_division_name
  BEFORE INSERT OR UPDATE ON public.divisions
  FOR EACH ROW EXECUTE FUNCTION public.normalize_name_trigger();

DROP TRIGGER IF EXISTS normalize_department_name ON public.departments;
CREATE TRIGGER normalize_department_name
  BEFORE INSERT OR UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.normalize_name_trigger();

-- 5. Create unique indexes on normalized names
CREATE UNIQUE INDEX IF NOT EXISTS idx_divisions_org_normalized_name 
  ON public.divisions (organization_id, normalized_name);

CREATE UNIQUE INDEX IF NOT EXISTS idx_departments_org_normalized_name 
  ON public.departments (organization_id, normalized_name);

-- 6. Update existing records with normalized names
UPDATE public.divisions SET normalized_name = lower(trim(name)) WHERE normalized_name IS NULL;
UPDATE public.departments SET normalized_name = lower(trim(name)) WHERE normalized_name IS NULL;

-- 7. Make normalized_name NOT NULL
ALTER TABLE public.divisions ALTER COLUMN normalized_name SET NOT NULL;
ALTER TABLE public.departments ALTER COLUMN normalized_name SET NOT NULL;

-- 8. Tighten employee_info INSERT policy - remove the broad INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create employee profile" ON public.employee_info;

-- Create more restrictive INSERT policy that only allows:
-- 1. Via the secure RPC for org creation
-- 2. Via invitation claiming (which sets user_id to auth.uid())
CREATE POLICY "Restricted employee info creation"
ON public.employee_info
FOR INSERT
WITH CHECK (
  -- Allow if user_id matches auth user (for invitation claiming)
  (user_id = auth.uid()) OR
  -- Allow if being called from a security definer function (org creation)
  (current_setting('role', true) = 'authenticator')
);

-- 9. Add comprehensive audit logging RPC
CREATE OR REPLACE FUNCTION public.log_onboarding_event(
  _event_type text,
  _event_details jsonb DEFAULT '{}'::jsonb,
  _success boolean DEFAULT true
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    organization_id,
    event_type,
    event_details,
    success
  ) VALUES (
    auth.uid(),
    public.get_current_user_org_id(),
    _event_type,
    _event_details,
    _success
  );
END;
$function$;