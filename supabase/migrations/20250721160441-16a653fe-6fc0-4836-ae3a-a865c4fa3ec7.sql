
-- Add missing user_id column to user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
