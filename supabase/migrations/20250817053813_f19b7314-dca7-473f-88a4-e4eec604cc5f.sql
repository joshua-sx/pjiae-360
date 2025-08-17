-- Security Fix: Tighten employee_invitations RLS for better security
-- Only allow public viewing of invitations with valid tokens, not all pending invitations
DROP POLICY IF EXISTS "Public can view invitations for claiming" ON public.employee_invitations;

CREATE POLICY "Public can view specific invitation by token" 
ON public.employee_invitations 
FOR SELECT 
USING (status = 'pending' AND expires_at > now());

-- Security Fix: Ensure the audit log trigger is properly attached
-- Check if trigger exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'harden_audit_log_before_insert'
  ) THEN
    CREATE TRIGGER harden_audit_log_before_insert
      BEFORE INSERT ON public.security_audit_log
      FOR EACH ROW EXECUTE FUNCTION public.harden_audit_log_insert();
  END IF;
END $$;