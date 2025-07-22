-- Update profiles table to link to the correct authenticated user
-- First, let's check if we need to update the user_id in profiles table
UPDATE profiles 
SET user_id = (SELECT id FROM auth.users WHERE email = profiles.email)
WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM auth.users);

