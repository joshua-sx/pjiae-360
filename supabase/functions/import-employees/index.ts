
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@2.0.0'
import { z } from 'https://deno.land/x/zod@v3.22.2/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ImportRequest {
  orgName: string
  people: Array<{
    id: string
    firstName: string
    lastName: string
    email: string
    jobTitle: string
    department: string
    division: string
    employeeId?: number
    role?: string
  }>
  adminInfo: {
    name: string
    email: string
    role: string
  }
}

interface ImportResult {
  success: boolean
  message: string
  imported: number
  failed: number
  errors: Array<{
    email: string
    error: string
  }>
  organizationId?: string
}

const importRequestSchema = z.object({
  orgName: z.string(),
  people: z.array(
    z.object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email(),
      jobTitle: z.string(),
      department: z.string().optional(),
      division: z.string().optional(),
      employeeId: z.number().optional(),
      role: z.string().optional()
    })
  ),
  adminInfo: z.object({
    name: z.string(),
    email: z.string().email(),
    role: z.string()
  })
})

// Initialize Resend with graceful handling of missing API key
const resendApiKey = Deno.env.get('RESEND_API_KEY')
const resend = resendApiKey ? new Resend(resendApiKey) : null

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create regular client for organization checks
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Create admin client for user creation
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    // Verify the requesting user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: corsHeaders }
      )
    }

    const body = await req.json()
    const { orgName, people, adminInfo }: ImportRequest = importRequestSchema.parse(body)
    console.log('Starting enhanced import for organization:', orgName)
    console.log('Importing', people.length, 'people with auth user creation')

    // Get or create organization
    const { data: orgData, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .eq('name', orgName)
      .single()
    let org = orgData

    if (orgError && orgError.code === 'PGRST116') {
      const { data: newOrg, error: createOrgError } = await supabaseAdmin
        .from('organizations')
        .insert({ name: orgName })
        .select('id')
        .single()
      
      if (createOrgError) {
        console.error('Error creating organization:', createOrgError)
        throw createOrgError
      }
      org = newOrg
    } else if (orgError) {
      console.error('Error fetching organization:', orgError)
      throw orgError
    }

    const organizationId = org.id
    console.log('Using organization ID:', organizationId)

    // Create unique divisions and departments
    const divisions = [...new Set(people.map(p => p.division).filter(Boolean))]
    const departments = [...new Set(people.map(p => p.department).filter(Boolean))]

    console.log('Creating divisions:', divisions)
    console.log('Creating departments:', departments)

    // Insert divisions
    const divisionMap: Record<string, string> = {}
    if (divisions.length > 0) {
      const { data: insertedDivisions, error: divisionError } = await supabaseAdmin
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
      const { data: insertedDepartments, error: departmentError } = await supabaseAdmin
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

    const result: ImportResult = {
      success: true,
      message: 'Import completed',
      imported: 0,
      failed: 0,
      errors: [],
      organizationId
    }

    // Process each employee
    for (const person of people) {
      try {
        console.log(`Processing employee: ${person.email}`)

        // Check if user already exists using listUsers method
        const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        
        if (listError) {
          console.error(`Error listing users:`, listError)
          result.errors.push({
            email: person.email,
            error: `Failed to check existing users: ${listError.message}`
          })
          result.failed++
          continue
        }

        const existingUser = usersData.users.find(u => u.email === person.email)
        
        let userId: string
        let isNewUser = false

        if (existingUser) {
          userId = existingUser.id
          console.log(`User already exists: ${person.email}`)
        } else {
          // Create new auth user
          const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
            email: person.email,
            email_confirm: true,
            user_metadata: {
              first_name: person.firstName,
              last_name: person.lastName,
              organization_id: organizationId,
              invited_by: user.id
            }
          })

          if (createUserError) {
            console.error(`Error creating user for ${person.email}:`, createUserError)
            result.errors.push({
              email: person.email,
              error: `Failed to create user: ${createUserError.message}`
            })
            result.failed++
            continue
          }

          userId = newUser.user.id
          isNewUser = true
          console.log(`Created new user: ${person.email}`)
        }

        // Create or update profile using the correct employee_info table
        const profileData = {
          user_id: userId,
          email: person.email,
          first_name: person.firstName,
          last_name: person.lastName,
          job_title: person.jobTitle,
          organization_id: organizationId,
          division_id: person.division ? divisionMap[person.division] : null,
          department_id: person.department ? departmentMap[person.department] : null,
          status: isNewUser ? 'invited' : 'active'
        }

        const { data: profile, error: profileError } = await supabaseAdmin
          .from('employee_info')
          .upsert(profileData, { onConflict: 'email,organization_id' })
          .select('id')
          .single()

        if (profileError) {
          console.error(`Error creating profile for ${person.email}:`, profileError)
          result.errors.push({
            email: person.email,
            error: `Failed to create profile: ${profileError.message}`
          })
          result.failed++
          continue
        }

        // Assign employee role explicitly to ensure proper role setup
        try {
          const { error: roleError } = await supabaseAdmin
            .from('user_roles')
            .upsert({
              profile_id: profile.id,
              user_id: userId,
              role: 'employee',
              organization_id: organizationId,
              is_active: true
            }, { onConflict: 'profile_id,role,organization_id' })

          if (roleError) {
            console.error(`Error assigning role for ${person.email}:`, roleError)
            // Don't fail import for role assignment errors, continue processing
          } else {
            console.log(`Employee role assigned to ${person.email}`)
          }
        } catch (roleError) {
          console.error(`Role assignment error for ${person.email}:`, roleError)
          // Continue with import even if role assignment fails
        }

        // Send invitation email for new users
        if (isNewUser && resend) {
          try {
            const inviteLink = `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?type=invite&token_hash=${encodeURIComponent('placeholder')}&redirect_to=${encodeURIComponent(req.headers.get('origin') || 'http://localhost:3000')}`
            
            await resend.emails.send({
              from: 'Team <onboarding@resend.dev>',
              to: [person.email],
              subject: `Welcome to ${orgName} - Complete Your Account Setup`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h1 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
                    Welcome to ${orgName}!
                  </h1>
                  
                  <p>Hi ${person.firstName},</p>
                  
                  <p>You've been added to the ${orgName} performance management system. Your account has been created with the following details:</p>
                  
                  <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <strong>Your Details:</strong><br>
                    Name: ${person.firstName} ${person.lastName}<br>
                    Email: ${person.email}<br>
                    Job Title: ${person.jobTitle}<br>
                    ${person.department ? `Department: ${person.department}<br>` : ''}
                    ${person.division ? `Division: ${person.division}<br>` : ''}
                  </div>
                  
                  <p>To access your account, please check your email for a sign-in link from Supabase, or visit our platform and use the "Forgot Password" option to set up your password.</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${req.headers.get('origin') || 'http://localhost:3000'}" 
                       style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                      Access Platform
                    </a>
                  </div>
                  
                  <p>If you have any questions, please contact your administrator.</p>
                  
                  <p>Best regards,<br>The ${orgName} Team</p>
                </div>
              `
            })
            
            console.log(`Invitation email sent to ${person.email}`)
          } catch (emailError) {
            console.error(`Error sending email to ${person.email}:`, emailError)
            // Don't fail the import for email errors
          }
        } else if (isNewUser && !resend) {
          console.log(`Skipping email for ${person.email} - Resend not configured`)
        }

        result.imported++
        console.log(`Successfully processed ${person.email}`)

      } catch (error) {
        console.error(`Error processing ${person.email}:`, error)
        result.errors.push({
          email: person.email,
          error: error.message || 'Unknown error occurred'
        })
        result.failed++
      }
    }

    // Update admin user's profile using the correct employee_info table
    try {
      const { error: adminUpdateError } = await supabaseAdmin
        .from('employee_info')
        .update({
          organization_id: organizationId,
          first_name: adminInfo.name.split(' ')[0] || adminInfo.name,
          last_name: adminInfo.name.split(' ').slice(1).join(' ') || '',
          status: 'active',
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      // Admin role assignment removed - will be handled by automatic role sync
    } catch (adminError) {
      console.error('Error updating admin profile:', adminError)
    }

    // Update result message
    if (result.failed > 0) {
      result.message = `Import completed with ${result.imported} successful and ${result.failed} failed imports`
      result.success = result.imported > 0
    } else {
      result.message = `Successfully imported ${result.imported} employees with auth users and invitations`
    }

    console.log('Import completed:', result)

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Import error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Import failed', 
        details: error.message,
        imported: 0,
        failed: 0,
        errors: []
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
