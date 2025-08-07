-- Clean up duplicate employee_info records
-- Keep only the most recent organization membership per user
WITH ranked_memberships AS (
  SELECT id, user_id, organization_id, created_at,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
  FROM employee_info
)
DELETE FROM employee_info 
WHERE id IN (
  SELECT id FROM ranked_memberships WHERE rn > 1
);

-- Add constraint to prevent multiple active organization memberships
ALTER TABLE employee_info 
ADD CONSTRAINT unique_user_organization 
UNIQUE (user_id);