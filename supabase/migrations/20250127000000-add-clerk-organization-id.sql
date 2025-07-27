-- Add clerk_organization_id column to organizations table
ALTER TABLE organizations 
ADD COLUMN clerk_organization_id TEXT UNIQUE;

-- Add index for better performance
CREATE INDEX idx_organizations_clerk_id ON organizations(clerk_organization_id);

-- Add comment for documentation
COMMENT ON COLUMN organizations.clerk_organization_id IS 'Clerk organization ID for syncing with Clerk organization management';
