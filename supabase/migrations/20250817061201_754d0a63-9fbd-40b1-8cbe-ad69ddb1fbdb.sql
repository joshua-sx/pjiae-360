-- Database hardening for tenancy isolation
-- Add BEFORE INSERT trigger on security_audit_log to enforce context
CREATE TRIGGER trg_harden_audit_log_insert
  BEFORE INSERT ON public.security_audit_log
  FOR EACH ROW
  EXECUTE FUNCTION public.harden_audit_log_insert();

-- Add performance index for organization-scoped audit log queries
CREATE INDEX IF NOT EXISTS idx_security_audit_log_org_created 
  ON public.security_audit_log(organization_id, created_at DESC);

-- Add documentation for role helper standardization
INSERT INTO public.security_audit_log (
  event_type, 
  event_details, 
  success
) VALUES (
  'tenancy_hardening_applied',
  jsonb_build_object(
    'changes', ARRAY[
      'audit_log_trigger_enabled',
      'audit_log_performance_index_added',
      'role_helper_standardization_documented'
    ],
    'recommendation', 'Use has_role() and has_role_at_least() for new policies',
    'deprecated_helper', 'has_role_simple() - keep for existing policies'
  ),
  true
);