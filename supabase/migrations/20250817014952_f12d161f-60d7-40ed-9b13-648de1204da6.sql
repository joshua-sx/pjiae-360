
-- 1) Create an index to speed up draft lookups
CREATE INDEX IF NOT EXISTS onboarding_drafts_user_last_saved_idx
  ON public.onboarding_drafts (user_id, last_saved_at DESC);

-- 2) Attach a trigger to clean up drafts when an employee becomes active
DROP TRIGGER IF EXISTS trg_cleanup_user_drafts_on_activation ON public.employee_info;

CREATE TRIGGER trg_cleanup_user_drafts_on_activation
AFTER UPDATE OF status ON public.employee_info
FOR EACH ROW
WHEN (NEW.status = 'active' AND (OLD.status IS DISTINCT FROM NEW.status))
EXECUTE FUNCTION public.cleanup_user_drafts_on_activation();
