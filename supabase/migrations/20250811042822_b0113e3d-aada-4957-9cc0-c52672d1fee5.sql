-- Assign admin roles to all existing users who have employee_info records
INSERT INTO public.user_roles (user_id, role, organization_id, is_active)
SELECT DISTINCT 
  ei.user_id,
  'admin'::app_role,
  ei.organization_id,
  true
FROM public.employee_info ei
WHERE ei.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = ei.user_id 
    AND ur.organization_id = ei.organization_id
  );