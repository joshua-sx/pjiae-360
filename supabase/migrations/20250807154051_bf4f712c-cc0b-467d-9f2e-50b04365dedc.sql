-- Clean up onboarding drafts for users with active employee status
-- This prevents users who completed onboarding from seeing stale draft recovery modals
DELETE FROM public.onboarding_drafts 
WHERE user_id IN (
  SELECT user_id FROM public.employee_info WHERE status = 'active'
);

-- Create an improved function to handle draft cleanup when onboarding completes
CREATE OR REPLACE FUNCTION public.cleanup_user_drafts_on_activation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- When employee status changes to 'active', delete their onboarding drafts
  IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
    DELETE FROM public.onboarding_drafts WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically cleanup drafts when employee becomes active
DROP TRIGGER IF EXISTS trigger_cleanup_drafts_on_activation ON public.employee_info;
CREATE TRIGGER trigger_cleanup_drafts_on_activation
  AFTER UPDATE ON public.employee_info
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_user_drafts_on_activation();