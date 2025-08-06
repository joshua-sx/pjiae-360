-- Allow nullable user_id in employee_info for invited employees
ALTER TABLE public.employee_info 
ALTER COLUMN user_id DROP NOT NULL;

-- Add constraint to ensure user_id is required when status is not 'invited'
ALTER TABLE public.employee_info 
ADD CONSTRAINT employee_info_user_id_required_when_active 
CHECK (
  (status = 'invited' AND user_id IS NULL) OR 
  (status != 'invited' AND user_id IS NOT NULL)
);

-- Allow nullable user_id in profiles table for invited users
ALTER TABLE public.profiles 
ALTER COLUMN user_id DROP NOT NULL;

-- Add unique constraint on email for profiles to prevent duplicates
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_email_unique UNIQUE (email);