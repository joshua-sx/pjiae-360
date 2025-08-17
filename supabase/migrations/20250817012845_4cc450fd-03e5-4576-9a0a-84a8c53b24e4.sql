-- Add server-side function to cleanup drafts when onboarding completes
CREATE OR REPLACE FUNCTION public.cleanup_user_drafts_on_completion(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Delete all drafts for the user when they complete onboarding
  DELETE FROM public.onboarding_drafts 
  WHERE user_id = _user_id;
  
  -- Log the cleanup
  INSERT INTO public.security_audit_log (
    user_id, 
    event_type, 
    event_details, 
    success
  ) VALUES (
    _user_id,
    'onboarding_drafts_cleanup',
    jsonb_build_object('reason', 'onboarding_completed'),
    true
  );
END;
$$;