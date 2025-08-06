-- Clean up duplicate employee_info records and ensure proper admin role assignment
-- First, let's see what we have
SELECT 'Current employee_info records' as info, user_id, organization_id, status, created_at 
FROM employee_info 
WHERE user_id = auth.uid()
UNION ALL
SELECT 'Current user_roles' as info, user_id::text, organization_id, role::text, created_at 
FROM user_roles 
WHERE user_id = auth.uid();

-- Get the most recent organization for this user
WITH latest_org AS (
  SELECT organization_id, MAX(created_at) as latest_created
  FROM employee_info 
  WHERE user_id = auth.uid()
  GROUP BY organization_id
  ORDER BY latest_created DESC
  LIMIT 1
)
-- Clean up old duplicate records, keeping only the latest organization
DELETE FROM user_roles 
WHERE user_id = auth.uid() 
AND organization_id NOT IN (SELECT organization_id FROM latest_org);

DELETE FROM employee_info 
WHERE user_id = auth.uid() 
AND organization_id NOT IN (SELECT organization_id FROM latest_org);

-- Ensure admin role exists for the remaining organization
WITH latest_org AS (
  SELECT organization_id 
  FROM employee_info 
  WHERE user_id = auth.uid()
  LIMIT 1
)
INSERT INTO user_roles (user_id, role, organization_id, is_active)
SELECT auth.uid(), 'admin', lo.organization_id, true
FROM latest_org lo
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND organization_id = lo.organization_id 
  AND role = 'admin' 
  AND is_active = true
);

-- Update employee status to active
UPDATE employee_info 
SET status = 'active'
WHERE user_id = auth.uid();

-- Verify final state
SELECT 'Final employee_info' as info, user_id, organization_id, status 
FROM employee_info 
WHERE user_id = auth.uid()
UNION ALL
SELECT 'Final user_roles' as info, user_id::text, organization_id, role::text 
FROM user_roles 
WHERE user_id = auth.uid() AND is_active = true;