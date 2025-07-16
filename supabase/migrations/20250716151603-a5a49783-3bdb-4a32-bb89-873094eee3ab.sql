-- Add onboarding completion tracking to profiles table
ALTER TABLE public.profiles 
ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN onboarding_completed_at TIMESTAMP WITH TIME ZONE;