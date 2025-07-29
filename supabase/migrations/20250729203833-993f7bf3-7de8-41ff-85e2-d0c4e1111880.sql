-- Assign admin role to your user account to fix access issues
INSERT INTO public.user_roles (user_id, role, organization_id, is_active)
VALUES (
  'fd5980fd-c35f-4943-9ce6-9cbd5e138af2', 
  'admin'::app_role, 
  'd0bca65b-283b-4507-b96a-fc32c5a7514a', 
  true
);