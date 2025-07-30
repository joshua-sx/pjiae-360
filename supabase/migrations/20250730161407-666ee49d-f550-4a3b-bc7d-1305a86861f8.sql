-- Fix search path security warnings for the functions

-- Update cleanup function with proper search path
CREATE OR REPLACE FUNCTION public.cleanup_expired_drafts()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  DELETE FROM public.onboarding_drafts 
  WHERE expires_at < now();
$$;

-- Update get active draft function with proper search path
CREATE OR REPLACE FUNCTION public.get_user_active_draft(_user_id UUID)
RETURNS SETOF public.onboarding_drafts
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT * FROM public.onboarding_drafts 
  WHERE user_id = _user_id 
    AND expires_at > now()
  ORDER BY last_saved_at DESC 
  LIMIT 1;
$$;