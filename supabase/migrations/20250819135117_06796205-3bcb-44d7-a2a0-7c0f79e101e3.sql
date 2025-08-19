-- Fix infinite recursion in employee_info RLS policies by creating secure helper functions
-- Drop existing problematic policies
DROP POLICY IF EXISTS "employee_info_select_hr_full_access" ON public.employee_info;
DROP POLICY IF EXISTS "employee_info_select_manager_reports" ON public.employee_info;
DROP POLICY IF EXISTS "employee_info_select_supervisor_limited" ON public.employee_info;
DROP POLICY IF EXISTS "employee_info_select_self" ON public.employee_info;
DROP POLICY IF EXISTS "employee_info_insert_org_admins" ON public.employee_info;
DROP POLICY IF EXISTS "employee_info_insert_self" ON public.employee_info;
DROP POLICY IF EXISTS "employee_info_update_org_admins" ON public.employee_info;
DROP POLICY IF EXISTS "employee_info_update_self" ON public.employee_info;
DROP POLICY IF EXISTS "employee_info_delete_org_admins" ON public.employee_info;

-- Create helper functions to avoid recursion
CREATE OR REPLACE FUNCTION public.get_current_employee_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT id FROM public.employee_info 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_current_department_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT department_id FROM public.employee_info 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$$;

-- Create new non-recursive RLS policies for employee_info
CREATE POLICY "employee_info_select_all"
ON public.employee_info
FOR SELECT
TO authenticated
USING (
  -- Users can see themselves
  user_id = auth.uid()
  OR
  -- Admin/Director roles can see all in their org
  (organization_id = get_current_user_org_id() AND has_role('admin'))
  OR
  (organization_id = get_current_user_org_id() AND has_role('director'))
);

CREATE POLICY "employee_info_insert_admins"
ON public.employee_info
FOR INSERT
TO authenticated
WITH CHECK (
  organization_id = get_current_user_org_id() 
  AND (has_role('admin') OR has_role('director'))
);

CREATE POLICY "employee_info_insert_self"
ON public.employee_info
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "employee_info_update_admins"
ON public.employee_info
FOR UPDATE
TO authenticated
USING (
  organization_id = get_current_user_org_id() 
  AND (has_role('admin') OR has_role('director'))
)
WITH CHECK (
  organization_id = get_current_user_org_id() 
  AND (has_role('admin') OR has_role('director'))
);

CREATE POLICY "employee_info_update_self"
ON public.employee_info
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "employee_info_delete_admins"
ON public.employee_info
FOR DELETE
TO authenticated
USING (
  organization_id = get_current_user_org_id() 
  AND (has_role('admin') OR has_role('director'))
);

-- Create storage buckets for onboarding assets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('org-assets', 'org-assets', true),
  ('employee-imports', 'employee-imports', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for org-assets bucket (public logos)
CREATE POLICY "Org assets are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'org-assets');

CREATE POLICY "Users can upload org assets"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'org-assets' 
  AND auth.uid() IS NOT NULL
  AND get_current_user_org_id()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their org assets"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'org-assets' 
  AND auth.uid() IS NOT NULL
  AND get_current_user_org_id()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their org assets"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'org-assets' 
  AND auth.uid() IS NOT NULL
  AND get_current_user_org_id()::text = (storage.foldername(name))[1]
);

-- Create RLS policies for employee-imports bucket (private CSVs)
CREATE POLICY "Users can view their org import files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'employee-imports' 
  AND auth.uid() IS NOT NULL
  AND get_current_user_org_id()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload import files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'employee-imports' 
  AND auth.uid() IS NOT NULL
  AND get_current_user_org_id()::text = (storage.foldername(name))[1]
);

-- Add file_path column to import_batches for CSV storage reference
ALTER TABLE public.import_batches 
ADD COLUMN IF NOT EXISTS file_path text;

-- Add logo_url column to organizations for logo storage reference
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS logo_file_path text;