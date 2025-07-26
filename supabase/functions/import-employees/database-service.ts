import type { ImportRequest, ImportResult, DatabaseContext } from './types.ts'
import { securityLog } from './validation.ts'
import { createClerkClient } from 'https://esm.sh/@clerk/backend@2.6.0?target=deno'

export interface OrganizationResult {
  success: boolean
  organizationId?: string
  clerkOrganizationId?: string
  error?: string
}

export interface UserCreationResult {
  success: boolean
  userId?: string
  isNewUser: boolean
  error?: string
}

export interface ProfileCreationResult {
  success: boolean
  profileId?: string
  error?: string
}

// Database service for handling all database operations
export class DatabaseService {
  private supabaseAdmin: any
  private clerkClient: ReturnType<typeof createClerkClient>

  constructor(supabaseAdmin: any) {
    this.supabaseAdmin = supabaseAdmin
    this.clerkClient = createClerkClient({
      secretKey: Deno.env.get('CLERK_SECRET_KEY') ?? ''
    })
  }

  // Organization management
  async findOrCreateOrganization(orgName: string): Promise<OrganizationResult> {
    try {
      // Get or create organization
      const { data: orgData, error: orgError } = await this.supabaseAdmin
        .from('organizations')
        .select('id')
        .eq('name', orgName)
        .single()
      
      let org = orgData

      if (orgError && orgError.code === 'PGRST116') {
        const { data: newOrg, error: createOrgError } = await this.supabaseAdmin
          .from('organizations')
          .insert({ name: orgName })
          .select('id')
          .single()
        
        if (createOrgError) {
          console.error('Error creating organization:', createOrgError)
          return { success: false, error: createOrgError.message }
        }
        org = newOrg
      } else if (orgError) {
        console.error('Error fetching organization:', orgError)
        return { success: false, error: orgError.message }
      }

      console.log('Using organization ID:', org.id)

      // Find or create Clerk organization
      let clerkOrgId: string | undefined
      try {
        const orgList = await this.clerkClient.organizations.getOrganizationList({ query: orgName })
        if (orgList && orgList.data && orgList.data.length > 0) {
          clerkOrgId = orgList.data[0].id
        } else {
          const created = await this.clerkClient.organizations.createOrganization({ name: orgName })
          clerkOrgId = created.id
          securityLog('clerk_org_created', { name: orgName, clerkOrgId })
        }
      } catch (clerkError) {
        console.error('Clerk organization error:', clerkError)
        securityLog('clerk_org_error', { name: orgName, error: clerkError.message }, 'error')
        return { success: false, error: 'Failed to create organization in Clerk' }
      }

      return { success: true, organizationId: org.id, clerkOrganizationId: clerkOrgId }
    } catch (error) {
      console.error('Error in findOrCreateOrganization:', error)
      return { success: false, error: error.message }
    }
  }

  // Division and department management
  async createDivisionsAndDepartments(
    people: ImportRequest['people'], 
    organizationId: string
  ): Promise<{ divisionMap: Record<string, string>; departmentMap: Record<string, string> }> {
    // Create unique divisions and departments
    const divisions = [...new Set(people.map(p => p.division).filter(Boolean))]
    const departments = [...new Set(people.map(p => p.department).filter(Boolean))]

    console.log('Creating divisions:', divisions)
    console.log('Creating departments:', departments)

    // Insert divisions
    const divisionMap: Record<string, string> = {}
    if (divisions.length > 0) {
      const { data: insertedDivisions, error: divisionError } = await this.supabaseAdmin
        .from('divisions')
        .upsert(
          divisions.map(name => ({
            name,
            organization_id: organizationId
          })),
          { onConflict: 'name,organization_id' }
        )
        .select('id, name')

      if (divisionError) {
        console.error('Error inserting divisions:', divisionError)
        throw divisionError
      }

      insertedDivisions?.forEach(div => {
        divisionMap[div.name] = div.id
      })
    }

    // Insert departments
    const departmentMap: Record<string, string> = {}
    if (departments.length > 0) {
      const { data: insertedDepartments, error: departmentError } = await this.supabaseAdmin
        .from('departments')
        .upsert(
          departments.map(name => ({
            name,
            organization_id: organizationId,
            division_id: null
          })),
          { onConflict: 'name,organization_id' }
        )
        .select('id, name')

      if (departmentError) {
        console.error('Error inserting departments:', departmentError)
        throw departmentError
      }

      insertedDepartments?.forEach(dept => {
        departmentMap[dept.name] = dept.id
      })
    }

    return { divisionMap, departmentMap }
  }

  // Helper method to find user by email with pagination
  async findUserByEmail(email: string): Promise<any | null> {
    try {
      const result = await this.clerkClient.users.getUserList({ emailAddress: [email] })
      if (result && result.data && result.data.length > 0) {
        return result.data[0]
      }
      return null
    } catch (error) {
      console.error('Error searching Clerk user:', error)
      securityLog('clerk_user_search_error', { email, error: error.message }, 'error')
      return null
    }
  }

  // User management
  async findOrCreateUser(
    person: ImportRequest['people'][0],
    organizationId: string,
    invitedBy: string
  ): Promise<UserCreationResult> {
    try {
      console.log(`Processing employee: ${person.email}`)

      try {
        const created = await this.clerkClient.users.createUser({
          emailAddress: [person.email],
          firstName: person.firstName,
          lastName: person.lastName
        })
        securityLog('clerk_user_created', { email: person.email })
        return { success: true, userId: created.id, isNewUser: true }
      } catch (createError: any) {
        if (createError?.errors?.[0]?.code === 'uniqueness_violation') {
          const existing = await this.findUserByEmail(person.email)
          if (existing) {
            securityLog('clerk_user_exists', { email: person.email })
            return { success: true, userId: existing.id, isNewUser: false }
          }
          return { success: false, isNewUser: false, error: `User exists but could not be found: ${person.email}` }
        }
        securityLog('clerk_user_create_error', { email: person.email, error: createError.message }, 'error')
        return { success: false, isNewUser: false, error: `Failed to create user: ${createError.message}` }
      }
    } catch (error) {
      console.error(`Error in findOrCreateUser for ${person.email}:`, error)
      return {
        success: false,
        isNewUser: false,
        error: error.message 
      }
    }
  }

  // Profile management
  async createOrUpdateProfile(
    person: ImportRequest['people'][0],
    userId: string,
    isNewUser: boolean,
    context: DatabaseContext
  ): Promise<ProfileCreationResult> {
    try {
      const profileData = {
        user_id: userId,
        email: person.email,
        first_name: person.firstName,
        last_name: person.lastName,
        job_title: person.jobTitle,
        organization_id: context.organizationId,
        division_id: person.division ? context.divisionMap[person.division] : null,
        department_id: person.department ? context.departmentMap[person.department] : null,
        status: isNewUser ? 'invited' : 'active'
      }

      const { data: profile, error: profileError } = await this.supabaseAdmin
        .from('employee_info')
        .upsert(profileData, { onConflict: 'email,organization_id' })
        .select('id')
        .single()

      if (profileError) {
        console.error(`Error creating profile for ${person.email}:`, profileError)
        return { 
          success: false, 
          error: `Failed to create profile: ${profileError.message}` 
        }
      }

      return { 
        success: true, 
        profileId: profile.id 
      }
    } catch (error) {
      console.error(`Error in createOrUpdateProfile for ${person.email}:`, error)
      return { 
        success: false, 
        error: error.message 
      }
    }
  }

  // Role assignment
  async assignEmployeeRole(
    profileId: string,
    userId: string,
    organizationId: string,
    clerkOrganizationId: string,
    email: string,
    role: string = 'employee'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.clerkClient.organizations.createOrganizationMembership({
        organizationId: clerkOrganizationId,
        userId,
        role
      })
      securityLog('clerk_role_assigned', { email, role })
      return { success: true }
    } catch (error) {
      console.error(`Role assignment error for ${email}:`, error)
      securityLog('clerk_role_error', { email, role, error: error.message }, 'error')
      return { success: false, error: error.message }
    }
  }

  // Admin role assignment
  async assignAdminRole(
    profileId: string,
    userId: string,
    organizationId: string,
    clerkOrganizationId: string,
    email: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.clerkClient.organizations.createOrganizationMembership({
        organizationId: clerkOrganizationId,
        userId,
        role: 'admin'
      })
      securityLog('clerk_role_assigned', { email, role: 'admin' })
      return { success: true }
    } catch (error) {
      console.error(`Admin role assignment error for ${email}:`, error)
      securityLog('clerk_role_error', { email, role: 'admin', error: error.message }, 'error')
      return { success: false, error: error.message }
    }
  }

  // Admin profile update
  async updateAdminProfile(
    adminInfo: ImportRequest['adminInfo'],
    userId: string,
    organizationId: string,
    clerkOrganizationId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Update the admin's profile
      const { data: profile, error: adminUpdateError } = await this.supabaseAdmin
        .from('employee_info')
        .upsert({
          user_id: userId,
          email: adminInfo.email,
          organization_id: organizationId,
          first_name: adminInfo.name.split(' ')[0] || adminInfo.name,
          last_name: adminInfo.name.split(' ').slice(1).join(' ') || '',
          status: 'active',
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select('id')
        .single()

      if (adminUpdateError) {
        console.error('Error updating admin profile:', adminUpdateError)
        return { success: false, error: adminUpdateError.message }
      }

      // Assign admin role to the user
      if (profile?.id) {
        const adminRoleResult = await this.assignAdminRole(
          profile.id,
          userId,
          organizationId,
          clerkOrganizationId,
          adminInfo.email
        )
        
        if (!adminRoleResult.success) {
          console.warn('Failed to assign admin role:', adminRoleResult.error)
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in updateAdminProfile:', error)
      return { success: false, error: error.message }
    }
  }

  // Batch employee processing with improved performance
  async processEmployeeBatch(
    people: ImportRequest['people'],
    context: DatabaseContext,
    invitedBy: string
  ): Promise<{
    successful: Array<{ email: string; userId: string; profileId: string; isNewUser: boolean }>
    failed: Array<{ email: string; error: string }>
  }> {
    const successful: Array<{ email: string; userId: string; profileId: string; isNewUser: boolean }> = []
    const failed: Array<{ email: string; error: string }> = []
    const BATCH_SIZE = 10 // Process in smaller concurrent batches

    console.log(`Processing ${people.length} employees in batches of ${BATCH_SIZE}`)

    // Process employees in smaller concurrent batches for better performance
    for (let i = 0; i < people.length; i += BATCH_SIZE) {
      const batch = people.slice(i, i + BATCH_SIZE)
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1
      const totalBatches = Math.ceil(people.length / BATCH_SIZE)
      
      console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} employees)`)

      // Process batch concurrently
      const batchPromises = batch.map(async (person) => {
        try {
          console.log(`Processing employee: ${person.email}`)

          // Create or find user
          const userResult = await this.findOrCreateUser(person, context.organizationId, invitedBy)
          if (!userResult.success) {
            return { success: false, email: person.email, error: userResult.error! }
          }

          // Create or update profile
          const profileResult = await this.createOrUpdateProfile(
            person, 
            userResult.userId!, 
            userResult.isNewUser, 
            context
          )
          if (!profileResult.success) {
            return { success: false, email: person.email, error: profileResult.error! }
          }

          // Assign employee role
          const roleResult = await this.assignEmployeeRole(
            profileResult.profileId!,
            userResult.userId!,
            context.organizationId,
            context.clerkOrganizationId,
            person.email,
            person.role || 'member'
          )
          // Don't fail the import for role assignment errors, just log them
          if (!roleResult.success) {
            console.warn(`Role assignment failed for ${person.email}: ${roleResult.error}`)
          }

          console.log(`Successfully processed: ${person.email}`)
          return {
            success: true,
            email: person.email,
            userId: userResult.userId!,
            profileId: profileResult.profileId!,
            isNewUser: userResult.isNewUser
          }

        } catch (error) {
          console.error(`Error processing employee ${person.email}:`, error)
          return { success: false, email: person.email, error: error.message || 'Unknown error occurred' }
        }
      })

      // Wait for batch to complete
      const batchResults = await Promise.all(batchPromises)

      // Separate successful and failed results
      batchResults.forEach(result => {
        if (result.success) {
          successful.push({
            email: result.email,
            userId: result.userId,
            profileId: result.profileId,
            isNewUser: result.isNewUser
          })
        } else {
          failed.push({ email: result.email, error: result.error })
        }
      })

      console.log(`Batch ${batchNumber} completed. Current totals - Success: ${successful.length}, Failed: ${failed.length}`)
    }

    console.log(`Import processing completed. Total successful: ${successful.length}, Total failed: ${failed.length}`)
    return { successful, failed }
  }
}