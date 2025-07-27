import { supabase } from "@/integrations/supabase/client";
import { clerkClient } from "@clerk/clerk-sdk-node";

interface OrganizationMigrationResult {
  success: boolean;
  migratedCount: number;
  errors: string[];
  details: Array<{
    supabaseId: string;
    clerkId?: string;
    name: string;
    status: 'success' | 'error';
    error?: string;
  }>;
}

interface UserMigrationResult {
  success: boolean;
  migratedCount: number;
  errors: string[];
  details: Array<{
    userId: string;
    email: string;
    organizationId?: string;
    status: 'success' | 'error';
    error?: string;
  }>;
}

/**
 * Migrate existing Supabase organizations to Clerk
 * This should be run once during the migration process
 */
export async function migrateOrganizationsToClerk(): Promise<OrganizationMigrationResult> {
  const result: OrganizationMigrationResult = {
    success: true,
    migratedCount: 0,
    errors: [],
    details: []
  };

  try {
    // Get all organizations from Supabase that don't have a Clerk ID
    const { data: organizations, error } = await supabase
      .from('organizations')
      .select('id, name, created_at')
      .is('clerk_organization_id', null);

    if (error) {
      result.success = false;
      result.errors.push(`Failed to fetch organizations: ${error.message}`);
      return result;
    }

    if (!organizations || organizations.length === 0) {
      return result; // No organizations to migrate
    }

    // Migrate each organization to Clerk
    for (const org of organizations) {
      try {
        // Create organization in Clerk
        const clerkOrg = await clerkClient.organizations.createOrganization({
          name: org.name,
          createdBy: 'system', // You might want to track the actual creator
        });

        // Update Supabase organization with Clerk ID
        const { error: updateError } = await supabase
          .from('organizations')
          .update({ clerk_organization_id: clerkOrg.id })
          .eq('id', org.id);

        if (updateError) {
          result.errors.push(`Failed to update organization ${org.name}: ${updateError.message}`);
          result.details.push({
            supabaseId: org.id,
            name: org.name,
            status: 'error',
            error: updateError.message
          });
        } else {
          result.migratedCount++;
          result.details.push({
            supabaseId: org.id,
            clerkId: clerkOrg.id,
            name: org.name,
            status: 'success'
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Failed to create Clerk organization for ${org.name}: ${errorMessage}`);
        result.details.push({
          supabaseId: org.id,
          name: org.name,
          status: 'error',
          error: errorMessage
        });
      }
    }

    if (result.errors.length > 0) {
      result.success = false;
    }

  } catch (error) {
    result.success = false;
    result.errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}

/**
 * Migrate users to their respective Clerk organizations
 * This should be run after organizations are migrated
 */
export async function migrateUsersToClerkOrganizations(): Promise<UserMigrationResult> {
  const result: UserMigrationResult = {
    success: true,
    migratedCount: 0,
    errors: [],
    details: []
  };

  try {
    // Get all users with their organization info
    const { data: users, error } = await supabase
      .from('employee_info')
      .select(`
        user_id,
        email,
        organization_id,
        organizations!inner(clerk_organization_id, name)
      `)
      .not('organizations.clerk_organization_id', 'is', null);

    if (error) {
      result.success = false;
      result.errors.push(`Failed to fetch users: ${error.message}`);
      return result;
    }

    if (!users || users.length === 0) {
      return result; // No users to migrate
    }

    // Migrate each user to their Clerk organization
    for (const user of users) {
      try {
        const clerkOrgId = (user.organizations as any).clerk_organization_id;
        
        if (!clerkOrgId) {
          result.errors.push(`No Clerk organization ID for user ${user.email}`);
          result.details.push({
            userId: user.user_id,
            email: user.email,
            status: 'error',
            error: 'No Clerk organization ID found'
          });
          continue;
        }

        // Add user to Clerk organization
        await clerkClient.organizations.createOrganizationMembership({
          organizationId: clerkOrgId,
          userId: user.user_id,
          role: 'basic_member' // You might want to map roles properly
        });

        result.migratedCount++;
        result.details.push({
          userId: user.user_id,
          email: user.email,
          organizationId: clerkOrgId,
          status: 'success'
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Failed to add user ${user.email} to organization: ${errorMessage}`);
        result.details.push({
          userId: user.user_id,
          email: user.email,
          status: 'error',
          error: errorMessage
        });
      }
    }

    if (result.errors.length > 0) {
      result.success = false;
    }

  } catch (error) {
    result.success = false;
    result.errors.push(`User migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}

/**
 * Verify the migration by checking data consistency
 */
export async function verifyMigration() {
  const verification = {
    organizationsWithoutClerkId: 0,
    organizationsWithClerkId: 0,
    usersInClerkOrganizations: 0,
    inconsistencies: [] as string[]
  };

  try {
    // Check organizations
    const { data: orgsWithoutClerk } = await supabase
      .from('organizations')
      .select('id, name')
      .is('clerk_organization_id', null);

    const { data: orgsWithClerk } = await supabase
      .from('organizations')
      .select('id, name, clerk_organization_id')
      .not('clerk_organization_id', 'is', null);

    verification.organizationsWithoutClerkId = orgsWithoutClerk?.length || 0;
    verification.organizationsWithClerkId = orgsWithClerk?.length || 0;

    // Check for any inconsistencies
    if (orgsWithoutClerk && orgsWithoutClerk.length > 0) {
      verification.inconsistencies.push(
        `${orgsWithoutClerk.length} organizations still don't have Clerk IDs`
      );
    }

    return verification;

  } catch (error) {
    verification.inconsistencies.push(
      `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return verification;
  }
}
