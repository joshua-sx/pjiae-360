import type { ImportRequest, ImportResult, DatabaseContext } from './types.ts'

export interface OrganizationResult {
  success: boolean
  organizationId?: string
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

  constructor(supabaseAdmin: any) {
    this.supabaseAdmin = supabaseAdmin
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
      return { success: true, organizationId: org.id }
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

  // User management
  async findOrCreateUser(
    person: ImportRequest['people'][0], 
    organizationId: string, 
    invitedBy: string
  ): Promise<UserCreationResult> {
    try {
      console.log(`Processing employee: ${person.email}`)

      // First, try to create the user - if it fails because user exists, we'll handle it
      const { data: newUser, error: createUserError } = await this.supabaseAdmin.auth.admin.createUser({
        email: person.email,
        email_confirm: true,
        user_metadata: {
          first_name: person.firstName,
          last_name: person.lastName,
          organization_id: organizationId,
          invited_by: invitedBy
        }
      })

      if (newUser?.user) {
        console.log(`New user created: ${person.email}`)
        return { 
          success: true, 
          userId: newUser.user.id, 
          isNewUser: true 
        }
      }

      // If creation failed, check if it's because user already exists
      if (createUserError) {
        if (createUserError.message.includes('already been registered') || 
            createUserError.message.includes('User already registered')) {
          console.log(`User already exists: ${person.email}`)
          
          // Get the existing user by email
          const { data: existingUsersData, error: getUserError } =
            await this.supabaseAdmin.auth.admin.listUsers()

          if (getUserError) {
            console.error(`Error getting existing user:`, getUserError)
            return { 
              success: false, 
              isNewUser: false, 
              error: `Failed to get existing user: ${getUserError.message}` 
            }
          }

          const existingUser = existingUsersData?.users?.find((user: any) => user.email === person.email)
          
          if (existingUser) {
            return { 
              success: true, 
              userId: existingUser.id, 
              isNewUser: false 
            }
          } else {
            return { 
              success: false, 
              isNewUser: false, 
              error: `User exists but could not be found: ${person.email}` 
            }
          }
        }

        // Other creation errors
        console.error(`Error creating user for ${person.email}:`, createUserError)
        return { 
          success: false, 
          isNewUser: false, 
          error: `Failed to create user: ${createUserError.message}` 
        }
      }

      // This should never be reached
      return { 
        success: false, 
        isNewUser: false, 
        error: 'Unexpected error in user creation process' 
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
    email: string,
    role: string = 'employee'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error: roleError } = await this.supabaseAdmin
        .from('user_roles')
        .upsert({
          profile_id: profileId,
          user_id: userId,
          role: role.toLowerCase() as any,
          organization_id: organizationId,
          is_active: true
        }, { onConflict: 'profile_id,role,organization_id' })

      if (roleError) {
        console.error(`Error assigning ${role} role for ${email}:`, roleError)
        return { success: false, error: roleError.message }
      } else {
        console.log(`${role} role assigned to ${email}`)
        return { success: true }
      }
    } catch (error) {
      console.error(`Role assignment error for ${email}:`, error)
      return { success: false, error: error.message }
    }
  }

  // Admin role assignment
  async assignAdminRole(
    profileId: string,
    userId: string,
    organizationId: string,
    email: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error: roleError } = await this.supabaseAdmin
        .from('user_roles')
        .upsert({
          profile_id: profileId,
          user_id: userId,
          role: 'admin' as any,
          organization_id: organizationId,
          is_active: true
        }, { onConflict: 'profile_id,role,organization_id' })

      if (roleError) {
        console.error(`Error assigning admin role for ${email}:`, roleError)
        return { success: false, error: roleError.message }
      } else {
        console.log(`Admin role assigned to ${email}`)
        return { success: true }
      }
    } catch (error) {
      console.error(`Admin role assignment error for ${email}:`, error)
      return { success: false, error: error.message }
    }
  }

  // Admin profile update
  async updateAdminProfile(
    adminInfo: ImportRequest['adminInfo'],
    userId: string,
    organizationId: string
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
            person.email,
            person.role || 'employee'
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