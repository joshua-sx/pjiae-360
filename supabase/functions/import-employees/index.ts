import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    // Set the auth token for the client
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: corsHeaders }
      )
    }

    const { orgName, people, adminInfo }: ImportRequest = await req.json()
    console.log('Starting import for organization:', orgName)
    console.log('Importing', people.length, 'people')

    // Get or create organization
    let { data: org, error: orgError } = await supabaseClient
      .from('organizations')
      .select('id')
      .eq('name', orgName)
      .single()

    if (orgError && orgError.code === 'PGRST116') {
      // Organization doesn't exist, create it
      const { data: newOrg, error: createOrgError } = await supabaseClient
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
      const { data: insertedDivisions, error: divisionError } = await supabaseClient
        .from('divisions')
        .upsert(
          divisions.map(name => ({ name, organization_id: organizationId })),
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
      const { data: insertedDepartments, error: departmentError } = await supabaseClient
        .from('departments')
        .upsert(
          departments.map(name => ({ 
            name, 
            organization_id: organizationId,
            division_id: null // For now, we'll keep departments separate from divisions
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

    // Create roles
    const roleNames = ['Director', 'Manager', 'Supervisor', 'Employee']
    const roleMap: Record<string, string> = {}
    
    const { data: insertedRoles, error: roleError } = await supabaseClient
      .from('roles')
      .upsert(
        roleNames.map(name => ({ name, organization_id: organizationId })),
        { onConflict: 'name,organization_id' }
      )
      .select('id, name')

    if (roleError) {
      console.error('Error inserting roles:', roleError)
      throw roleError
    }

    insertedRoles?.forEach(role => {
      roleMap[role.name] = role.id
    })

    // Prepare profile data for imported employees (they'll be invited, not immediately active)
    const profilesData = people.map(person => ({
      user_id: null, // Will be set when employee signs up
      email: person.email,
      first_name: person.firstName,
      last_name: person.lastName,
      name: `${person.firstName} ${person.lastName}`,
      job_title: person.jobTitle,
      organization_id: organizationId,
      division_id: person.division ? divisionMap[person.division] : null,
      department_id: person.department ? departmentMap[person.department] : null,
      role_id: person.role ? roleMap[person.role] : roleMap['Employee'],
      status: 'invited'
    }))

    // Update the admin user's profile to link them to this organization
    const { error: adminUpdateError } = await supabaseClient
      .from('profiles')
      .update({
        organization_id: organizationId,
        first_name: adminInfo.name.split(' ')[0] || adminInfo.name,
        last_name: adminInfo.name.split(' ').slice(1).join(' ') || '',
        name: adminInfo.name,
        role_id: roleMap['Director'], // Assume admin is a Director
        status: 'active',
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (adminUpdateError) {
      console.error('Error updating admin profile:', adminUpdateError)
      // Don't throw here, continue with employee import
    }

    console.log('Inserting', profilesData.length, 'profiles')

    // Insert profiles
    const { data: insertedProfiles, error: profileError } = await supabaseClient
      .from('profiles')
      .upsert(profilesData, { onConflict: 'email,organization_id' })
      .select('id, email, first_name, last_name')

    if (profileError) {
      console.error('Error inserting profiles:', profileError)
      throw profileError
    }

    console.log('Successfully imported', insertedProfiles?.length || 0, 'profiles')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Import completed successfully',
        imported: insertedProfiles?.length || 0,
        organizationId
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Import error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Import failed', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})