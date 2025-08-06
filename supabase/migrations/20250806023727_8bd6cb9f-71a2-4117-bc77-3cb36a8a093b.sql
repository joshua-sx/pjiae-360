-- Clean up duplicate employee_info records and ensure proper admin role assignment
-- Step 1: Remove duplicate user_roles (keep only one per organization)
DELETE FROM user_roles 
WHERE user_id = auth.uid() 
AND id NOT IN (
  SELECT DISTINCT ON (organization_id) id 
  FROM user_roles 
  WHERE user_id = auth.uid() 
  ORDER BY organization_id, created_at DESC
);

-- Step 2: Remove duplicate employee_info (keep only one per organization)
DELETE FROM employee_info 
WHERE user_id = auth.uid() 
AND id NOT IN (
  SELECT DISTINCT ON (organization_id) id 
  FROM employee_info 
  WHERE user_id = auth.uid() 
  ORDER BY organization_id, created_at DESC
);

-- Step 3: Ensure admin role exists for the user's organization
INSERT INTO user_roles (user_id, role, organization_id, is_active)
SELECT 
  auth.uid(), 
  'admin'::app_role, 
  ei.organization_id, 
  true
FROM employee_info ei
WHERE ei.user_id = auth.uid()
AND NOT EXISTS (
  SELECT 1 FROM user_roles ur
  WHERE ur.user_id = auth.uid() 
  AND ur.organization_id = ei.organization_id 
  AND ur.role = 'admin' 
  AND ur.is_active = true
)
LIMIT 1;

-- Step 4: Update employee status to active
UPDATE employee_info 
SET status = 'active'
WHERE user_id = auth.uid();