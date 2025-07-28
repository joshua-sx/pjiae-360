-- Add missing foreign key relationship between employee_info and profiles
-- This requires adding the foreign key constraint properly

-- First, add the missing 'invited' status to user_status enum
ALTER TYPE user_status ADD VALUE IF NOT EXISTS 'invited';

-- Add missing column to appraisal_appraisers table
ALTER TABLE appraisal_appraisers ADD COLUMN IF NOT EXISTS is_primary boolean DEFAULT true;

-- Add proper foreign key constraint between employee_info and profiles
-- We need to ensure the relationship works via user_id
-- Since both tables reference auth.users, we can join them through user_id

-- Update the profiles table to ensure it has proper constraints
ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
  IF NOT EXISTS;