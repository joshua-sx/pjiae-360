-- Update the status constraint to include 'invited' as a valid status
ALTER TABLE public.employee_info 
DROP CONSTRAINT profiles_status_check;

ALTER TABLE public.employee_info 
ADD CONSTRAINT profiles_status_check 
CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text, 'pending'::text, 'invited'::text]));