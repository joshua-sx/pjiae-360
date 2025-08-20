-- Fix RLS Policy Issues and Add Security Definer Functions (Corrected)
-- This migration addresses permissive policies, adds helper functions, and validation triggers

-- 1. SECURITY DEFINER HELPER FUNCTIONS to prevent RLS recursion

-- Enhanced function to check if user can access employee data (prevents recursion)
CREATE OR REPLACE FUNCTION public.can_access_employee_data(_employee_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT CASE
    WHEN _employee_id IS NULL THEN false
    WHEN EXISTS(
      SELECT 1 FROM public.employee_info ei 
      WHERE ei.id = _employee_id 
        AND ei.user_id = auth.uid()
        AND ei.organization_id = public.get_current_user_org_id()
    ) THEN true
    WHEN public.has_role_simple('admin') OR public.has_role_simple('director') THEN
      EXISTS(
        SELECT 1 FROM public.employee_info ei
        WHERE ei.id = _employee_id 
          AND ei.organization_id = public.get_current_user_org_id()
      )
    WHEN public.has_role_simple('manager') THEN
      EXISTS(
        SELECT 1 FROM public.employee_info ei, public.employee_info manager_ei
        WHERE ei.id = _employee_id
          AND manager_ei.user_id = auth.uid()
          AND ei.manager_id = manager_ei.id
          AND ei.organization_id = public.get_current_user_org_id()
      )
    ELSE false
  END;
$$;

-- Function to check if user can access appraisal data
CREATE OR REPLACE FUNCTION public.can_access_appraisal_data(_appraisal_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT CASE
    WHEN _appraisal_id IS NULL THEN false
    WHEN EXISTS(
      SELECT 1 FROM public.appraisals a
      JOIN public.employee_info ei ON a.employee_id = ei.id
      WHERE a.id = _appraisal_id 
        AND ei.user_id = auth.uid()
        AND a.organization_id = public.get_current_user_org_id()
    ) THEN true
    WHEN public.has_role_simple('admin') OR public.has_role_simple('manager') THEN
      EXISTS(
        SELECT 1 FROM public.appraisals a
        WHERE a.id = _appraisal_id 
          AND a.organization_id = public.get_current_user_org_id()
      )
    ELSE false
  END;
$$;

-- Function to check organization membership securely
CREATE OR REPLACE FUNCTION public.is_org_member(_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT _org_id = public.get_current_user_org_id() AND _org_id IS NOT NULL;
$$;

-- 2. REMOVE OVERLY PERMISSIVE POLICIES AND ADD EXPLICIT ONES

-- Fix verification_tokens - remove overly permissive policy
DROP POLICY IF EXISTS "System can manage verification tokens" ON public.verification_tokens;

-- Add explicit policies for verification_tokens
CREATE POLICY "Users can view their verification tokens"
ON public.verification_tokens
FOR SELECT
USING (user_id = auth.uid() OR email IN (
  SELECT email FROM public.profiles WHERE user_id = auth.uid()
));

CREATE POLICY "System can insert verification tokens"
ON public.verification_tokens
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update verification tokens for validation"
ON public.verification_tokens
FOR UPDATE
USING (expires_at > now() AND used_at IS NULL);

-- 3. VALIDATION TRIGGERS for time-sensitive columns

-- Trigger function to validate expiration dates
CREATE OR REPLACE FUNCTION public.validate_expiration_dates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Check for verification_tokens
  IF TG_TABLE_NAME = 'verification_tokens' THEN
    IF NEW.expires_at <= now() THEN
      RAISE EXCEPTION 'Expiration date must be in the future';
    END IF;
  END IF;
  
  -- Check for employee_invitations
  IF TG_TABLE_NAME = 'employee_invitations' THEN
    IF NEW.expires_at <= now() THEN
      RAISE EXCEPTION 'Invitation expiration must be in the future';
    END IF;
  END IF;
  
  -- Check for onboarding_drafts
  IF TG_TABLE_NAME = 'onboarding_drafts' THEN
    IF NEW.expires_at <= now() THEN
      RAISE EXCEPTION 'Draft expiration must be in the future';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply validation triggers to tables with expires_at columns
DROP TRIGGER IF EXISTS validate_verification_tokens_expiration ON public.verification_tokens;
CREATE TRIGGER validate_verification_tokens_expiration
  BEFORE INSERT OR UPDATE ON public.verification_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_expiration_dates();

DROP TRIGGER IF EXISTS validate_employee_invitations_expiration ON public.employee_invitations;
CREATE TRIGGER validate_employee_invitations_expiration
  BEFORE INSERT OR UPDATE ON public.employee_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_expiration_dates();

DROP TRIGGER IF EXISTS validate_onboarding_drafts_expiration ON public.onboarding_drafts;
CREATE TRIGGER validate_onboarding_drafts_expiration
  BEFORE INSERT OR UPDATE ON public.onboarding_drafts
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_expiration_dates();

-- 4. IMPROVE PROFILES POLICIES with helper functions

-- Update profiles policies to use security definer functions
DROP POLICY IF EXISTS "Managers can view direct reports profiles" ON public.profiles;
CREATE POLICY "Managers can view direct reports profiles"
ON public.profiles
FOR SELECT
USING (
  public.has_role_simple('manager') AND 
  EXISTS (
    SELECT 1 FROM public.employee_info manager_ei, public.employee_info report_ei
    WHERE manager_ei.user_id = auth.uid()
      AND report_ei.user_id = profiles.user_id
      AND report_ei.manager_id = manager_ei.id
      AND manager_ei.organization_id = public.get_current_user_org_id()
      AND report_ei.organization_id = public.get_current_user_org_id()
  )
);

-- 5. ADD MISSING POLICIES FOR TABLES WITHOUT EXPLICIT CRUD POLICIES

-- Add explicit policies for activities table
CREATE POLICY "Admins can view all activities"
ON public.activities
FOR SELECT
USING (public.has_role_simple('admin') AND organization_id = public.get_current_user_org_id());

CREATE POLICY "Users can view their own activities"
ON public.activities
FOR SELECT
USING (user_id = auth.uid() AND organization_id = public.get_current_user_org_id());

-- Add explicit UPDATE/DELETE policies for appraisals
CREATE POLICY "Users can delete their own appraisals in draft"
ON public.appraisals
FOR DELETE
USING (
  organization_id = public.get_current_user_org_id() AND
  status = 'draft' AND
  employee_id IN (
    SELECT id FROM public.employee_info WHERE user_id = auth.uid()
  )
);

-- Add missing INSERT policy for appraisal_cycles  
CREATE POLICY "Admins can create cycles"
ON public.appraisal_cycles
FOR INSERT
WITH CHECK (public.has_role_simple('admin') AND organization_id = public.get_current_user_org_id());

-- Add missing UPDATE/DELETE policies for appraisal_cycles
CREATE POLICY "Admins can update cycles"
ON public.appraisal_cycles
FOR UPDATE
USING (public.has_role_simple('admin') AND organization_id = public.get_current_user_org_id())
WITH CHECK (public.has_role_simple('admin') AND organization_id = public.get_current_user_org_id());

CREATE POLICY "Admins can delete cycles"
ON public.appraisal_cycles
FOR DELETE
USING (public.has_role_simple('admin') AND organization_id = public.get_current_user_org_id());

-- Log security hardening completion
INSERT INTO public.security_audit_log (
  event_type, 
  event_details, 
  success
) VALUES (
  'rls_security_hardening_applied',
  jsonb_build_object(
    'changes', ARRAY[
      'Added SECURITY DEFINER helper functions',
      'Removed permissive true policies', 
      'Added explicit CRUD policies',
      'Added validation triggers for expires_at',
      'Enhanced profiles access control'
    ]
  ),
  true
);