-- Add fields to profiles table for invitation management
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS invitation_token uuid DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS invited_at timestamp with time zone DEFAULT now();

-- Update user_id to be nullable so we can create placeholder profiles
ALTER TABLE public.profiles 
ALTER COLUMN user_id DROP NOT NULL;

-- Add index for invitation tokens
CREATE INDEX IF NOT EXISTS idx_profiles_invitation_token ON public.profiles(invitation_token);

