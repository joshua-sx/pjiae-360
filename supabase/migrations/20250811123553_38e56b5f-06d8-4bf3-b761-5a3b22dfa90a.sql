-- Add the three users to PJIAE organization as active employees
INSERT INTO public.employee_info (user_id, organization_id, status, job_title)
VALUES 
  ('ce3fb8b8-5787-44ef-a274-03acd82d9833', '9486f5af-efd4-45d6-ac57-7dd2c04d80ce', 'active', 'Administrator'),
  ('894f5d19-76a5-4720-a9a6-b754d186766c', '9486f5af-efd4-45d6-ac57-7dd2c04d80ce', 'active', 'Administrator'),
  ('680b4fae-0e0a-45ce-93ec-861cd8dbe78e', '9486f5af-efd4-45d6-ac57-7dd2c04d80ce', 'active', 'Administrator')
ON CONFLICT (user_id, organization_id) DO UPDATE SET 
  status = 'active',
  job_title = 'Administrator';

-- Assign admin roles to each account
INSERT INTO public.user_roles (user_id, role, organization_id, is_active)
VALUES 
  ('ce3fb8b8-5787-44ef-a274-03acd82d9833', 'admin', '9486f5af-efd4-45d6-ac57-7dd2c04d80ce', true),
  ('894f5d19-76a5-4720-a9a6-b754d186766c', 'admin', '9486f5af-efd4-45d6-ac57-7dd2c04d80ce', true),
  ('680b4fae-0e0a-45ce-93ec-861cd8dbe78e', 'admin', '9486f5af-efd4-45d6-ac57-7dd2c04d80ce', true)
ON CONFLICT (user_id, role, organization_id) DO UPDATE SET 
  is_active = true;