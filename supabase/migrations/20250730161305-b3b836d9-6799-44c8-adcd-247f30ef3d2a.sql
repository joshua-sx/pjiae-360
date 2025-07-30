-- Create onboarding_drafts table for persistent draft storage
CREATE TABLE public.onboarding_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID,
  current_step INTEGER NOT NULL DEFAULT 0,
  entry_method TEXT,
  draft_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 days')
);

-- Enable RLS
ALTER TABLE public.onboarding_drafts ENABLE ROW LEVEL SECURITY;

-- Create policies for secure access
CREATE POLICY "Users can manage their own drafts" 
ON public.onboarding_drafts 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create index for performance
CREATE INDEX idx_onboarding_drafts_user_id ON public.onboarding_drafts(user_id);
CREATE INDEX idx_onboarding_drafts_expires_at ON public.onboarding_drafts(expires_at);

-- Create trigger for automatic updated_at
CREATE TRIGGER update_onboarding_drafts_last_saved_at
BEFORE UPDATE ON public.onboarding_drafts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to cleanup expired drafts
CREATE OR REPLACE FUNCTION public.cleanup_expired_drafts()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM public.onboarding_drafts 
  WHERE expires_at < now();
$$;

-- Create function to get active draft for user
CREATE OR REPLACE FUNCTION public.get_user_active_draft(_user_id UUID)
RETURNS SETOF public.onboarding_drafts
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT * FROM public.onboarding_drafts 
  WHERE user_id = _user_id 
    AND expires_at > now()
  ORDER BY last_saved_at DESC 
  LIMIT 1;
$$;