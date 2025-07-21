
-- Add unique constraint on (email, organization_id) to profiles table
-- This allows the edge function to use onConflict: 'email,organization_id' for upserts
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_email_organization_unique 
UNIQUE (email, organization_id);
