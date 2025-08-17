-- Add trigger for employee_info to cleanup drafts on activation
CREATE OR REPLACE TRIGGER trg_cleanup_drafts_on_employee_activation
  AFTER UPDATE ON public.employee_info
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_user_drafts_on_activation();

-- Add indexes for onboarding_drafts for faster lookups
CREATE INDEX IF NOT EXISTS idx_onboarding_drafts_user_id_expires 
  ON public.onboarding_drafts (user_id, expires_at DESC);

CREATE INDEX IF NOT EXISTS idx_onboarding_drafts_org_id_user_id 
  ON public.onboarding_drafts (organization_id, user_id) 
  WHERE organization_id IS NOT NULL;