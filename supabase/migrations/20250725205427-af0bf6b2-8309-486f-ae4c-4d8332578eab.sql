-- Clean up orphaned auth users that don't have employee profiles
-- This removes users that were created during failed imports and have no application data

DELETE FROM auth.users 
WHERE id NOT IN (
  SELECT DISTINCT user_id 
  FROM public.employee_info 
  WHERE user_id IS NOT NULL
);