-- Add the missing audit log hardening trigger
CREATE TRIGGER audit_log_harden_insert
  BEFORE INSERT ON public.security_audit_log
  FOR EACH ROW
  EXECUTE FUNCTION public.harden_audit_log_insert();

-- Fix employee_invitations RLS to prevent data leakage
DROP POLICY IF EXISTS "Public can view specific invitation by token" ON public.employee_invitations;

CREATE POLICY "Public can view invitation by valid token only"
  ON public.employee_invitations
  FOR SELECT
  USING (
    -- Only allow access if the token matches exactly and invitation is valid
    token = current_setting('request.jwt.claims', true)::json->>'invitation_token'
    AND status = 'pending'
    AND expires_at > now()
  );

-- Alternative: Create a more secure function-based approach for invitation validation
CREATE OR REPLACE FUNCTION public.validate_invitation_token_secure(_token text)
RETURNS TABLE(
  is_valid boolean,
  organization_id uuid,
  email text,
  employee_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    true as is_valid,
    ei.organization_id,
    ei.email,
    ei.employee_id
  FROM public.employee_invitations ei
  WHERE ei.token = _token
    AND ei.status = 'pending'
    AND ei.expires_at > now()
  LIMIT 1;
  
  -- If no valid invitation found, return invalid result
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, null::uuid, null::text, null::uuid;
  END IF;
END;
$$;

-- Remove the problematic public SELECT policy entirely
DROP POLICY IF EXISTS "Public can view invitation by valid token only" ON public.employee_invitations;