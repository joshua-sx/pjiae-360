import { supabase } from '@/integrations/supabase/client'
import { OnboardingData } from '@/components/onboarding/OnboardingTypes'
import { useAuth } from './useAuth'

export interface SaveOnboardingDataResult {
  success: boolean
  error?: string
  organizationId?: string
}

const findOrCreateOrganization = async (orgName?: string): Promise<string> => {
  // Verify user authentication with session check
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    throw new Error('Authentication required: Please log in to continue')
  }

  // Check if user already has a profile with an organization
  const { data: userProfile } = await supabase
    .from('employee_info')
    .select('organization_id')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (userProfile?.organization_id) {
    return userProfile.organization_id
  }

  // Generate organization name
  const organizationName = orgName || `${session.user.email?.split('@')[0]}'s Organization`

  // Check if organization with this name already exists
  const { data: existingOrg } = await supabase
    .from('organizations')
    .select('id')
    .eq('name', organizationName)
    .maybeSingle()

  if (existingOrg) {
    return existingOrg.id
  }

  // Create new organization with proper error handling
  const { data: newOrg, error: createError } = await supabase
    .from('organizations')
    .insert({ 
      name: organizationName,
      status: 'active'
    })
    .select('id')
    .single()

  if (createError) {
    console.error('Error creating organization:', createError)
    
    // Provide more specific error messages based on the error
    if (createError.code === '42501' || createError.message.includes('permission denied')) {
      throw new Error('Authentication issue: Please try logging out and back in')
    }
    if (createError.code === 'PGRST301' || createError.message.includes('JWT')) {
      throw new Error('Session expired: Please log in again')
    }
    
    throw new Error(`Failed to create organization: ${createError.message}`)
  }

  if (!newOrg?.id) {
    throw new Error('Organization created but no ID returned')
  }

  return newOrg.id
}

const saveStructure = async (organizationId: string, data: OnboardingData) => {
  if (data.orgStructure.length === 0) return
  const divisions = data.orgStructure.filter(i => i.type === 'division')
  const departments = data.orgStructure.filter(i => i.type === 'department')

  for (const division of divisions) {
    const { error } = await supabase
      .from('divisions')
      .upsert({ 
        name: division.name, 
        organization_id: organizationId 
      }, {
        onConflict: 'name,organization_id',
        ignoreDuplicates: true
      })
      .select()
      .single()
    if (error && !error.message.includes('duplicate')) {
      console.warn(`Failed to save division ${division.name}: ${error.message}`)
    }
  }

  for (const department of departments) {
    let divisionId = null
    if (department.parent) {
      const { data: div } = await supabase
        .from('divisions')
        .select('id')
        .eq('name', department.parent)
        .eq('organization_id', organizationId)
        .single()
      divisionId = div?.id || null
    }

    const { error } = await supabase
      .from('departments')
      .upsert({
        name: department.name,
        organization_id: organizationId,
        division_id: divisionId,
      }, {
        onConflict: 'name,organization_id',
        ignoreDuplicates: true
      })
      .select()
      .single()
    if (error && !error.message.includes('duplicate')) {
      console.warn(`Failed to save department ${department.name}: ${error.message}`)
    }
  }
}

const importEmployees = async (organizationId: string, data: OnboardingData) => {
  if (data.people.length === 0) return
  
  // Transform the data to match the edge function's expected format
  const { data: result, error } = await supabase.functions.invoke('import-employees', {
    body: {
      orgName: data.orgName,
      people: data.people,
      adminInfo: data.adminInfo,
    },
  })
  
  if (error) throw new Error(`Failed to import employees: ${error.message}`)
  
  // Log import results for debugging
  if (result) {
    console.log('Import completed:', result)
    if (result.errors?.length > 0) {
      console.warn('Import errors:', result.errors)
    }
  }
}

const saveAppraisalCycle = async (
  organizationId: string,
  userId: string,
  data: OnboardingData
) => {
  if (!data.appraisalCycle) return

  const cycleData = {
    name: data.appraisalCycle.cycleName,
    start_date: data.appraisalCycle.startDate,
    end_date:
      data.appraisalCycle.frequency === 'annual'
        ? new Date(
            new Date(data.appraisalCycle.startDate).setFullYear(
              new Date(data.appraisalCycle.startDate).getFullYear() + 1
            )
          )
            .toISOString()
            .split('T')[0]
        : new Date(
            new Date(data.appraisalCycle.startDate).setMonth(
              new Date(data.appraisalCycle.startDate).getMonth() + 6
            )
          )
            .toISOString()
            .split('T')[0],
    organization_id: organizationId,
    status: 'active' as const,
    year: new Date(data.appraisalCycle.startDate).getFullYear(),
  }

  const { data: cycleResult, error: cycleError } = await supabase
    .from('appraisal_cycles')
    .upsert(cycleData, { 
      onConflict: 'organization_id,year',
      ignoreDuplicates: false 
    })
    .select()
    .single()
  if (cycleError) throw new Error(`Failed to save appraisal cycle: ${cycleError.message}`)

  // Save goal setting windows first
  let goalWindowsData: any[] = [];
  if (data.appraisalCycle.goalSettingWindows && data.appraisalCycle.goalSettingWindows.length > 0) {
    const windowInserts = data.appraisalCycle.goalSettingWindows.map(window => ({
      cycle_id: cycleResult.id,
      name: window.name,
      start_date: window.startDate.toISOString().split('T')[0],
      end_date: window.endDate.toISOString().split('T')[0]
    }));

    const { data: windows, error: windowsError } = await supabase
      .from('goal_setting_windows')
      .insert(windowInserts)
      .select();

    if (windowsError) throw new Error(`Failed to save goal setting windows: ${windowsError.message}`);
    goalWindowsData = windows || [];
  }

  // Save review periods with goal window references
  if (data.appraisalCycle.reviewPeriods && data.appraisalCycle.reviewPeriods.length > 0) {
    const periodInserts = data.appraisalCycle.reviewPeriods.map(p => {
      // Find matching goal window by ID if specified
      const goalWindow = goalWindowsData.find(gw => 
        p.goalWindowId === gw.id || 
        p.goalWindowId === data.appraisalCycle?.goalSettingWindows?.find(gsw => gsw.id === p.goalWindowId)?.id
      );

      return {
        start_date: p.startDate.toISOString().split('T')[0],
        end_date: p.endDate.toISOString().split('T')[0],
        cycle_id: cycleResult.id,
        phase: 'year_end' as const,
        goal_window_id: goalWindow?.id || null
      };
    });

    const { error } = await supabase.from('cycle_phases').upsert(periodInserts, {
      onConflict: 'cycle_id,phase',
      ignoreDuplicates: false
    })
    if (error) throw new Error(`Failed to save review periods: ${error.message}`)
  }

  if (
    data.appraisalCycle.competencyCriteria?.competencies &&
    data.appraisalCycle.competencyCriteria.competencies.length > 0
  ) {
    const competenciesToInsert = data.appraisalCycle.competencyCriteria.competencies.map(c => ({
      name: c.name,
      description: c.description,
      organization_id: organizationId,
      code: c.name.toLowerCase().replace(/\s+/g, '_'), // Generate a code from the name
    }))
    const { error } = await supabase.from('competencies').insert(competenciesToInsert)
    if (error) throw new Error(`Failed to save competencies: ${error.message}`)
  }
}

export const useOnboardingPersistence = () => {
  const { user } = useAuth()

  const saveOnboardingData = async (data: OnboardingData): Promise<SaveOnboardingDataResult> => {
    try {
      // Double-check authentication with session verification
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        throw new Error('Authentication required: Please log in to continue')
      }

      const userId = session.user.id

      // Create or find organization first
      const organizationId = await findOrCreateOrganization(data.orgName)

      // Update organization name if provided
      if (data.orgName) {
        const { error: orgError } = await supabase
          .from('organizations')
          .update({ name: data.orgName })
          .eq('id', organizationId)
        if (orgError) {
          console.warn('Failed to update organization name:', orgError.message)
        }
      }

      // Ensure user has employee_info record with the organization
      const { data: existingEmployee } = await supabase
        .from('employee_info')
        .select('id')
        .eq('user_id', userId)
        .eq('organization_id', organizationId)
        .maybeSingle()

      if (!existingEmployee) {
        const { error: employeeError } = await supabase
          .from('employee_info')
          .insert({
            user_id: userId,
            organization_id: organizationId,
            status: 'active'
          })

        if (employeeError) {
          console.error('Error creating employee record:', employeeError)
          
          // Provide more specific error messages
          if (employeeError.code === '42501' || employeeError.message.includes('permission denied')) {
            throw new Error('Authentication issue: Please try logging out and back in')
          }
          
          throw new Error(`Failed to create employee record: ${employeeError.message}`)
        }
      }

      // Ensure user has admin role for the organization
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('organization_id', organizationId)
        .eq('role', 'admin')
        .maybeSingle()

      if (!existingRole) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            organization_id: organizationId,
            role: 'admin'
          })

        if (roleError) {
          console.error('Error assigning admin role:', roleError)
          
          // Provide more specific error messages for role assignment
          if (roleError.code === '42501' || roleError.message.includes('permission denied')) {
            console.warn('Role assignment failed due to permissions, continuing with setup')
          } else {
            throw new Error(`Failed to assign admin role: ${roleError.message}`)
          }
        }
      }

      // Save all data in sequence
      await saveStructure(organizationId, data)
      await importEmployees(organizationId, data)
      await saveAppraisalCycle(organizationId, userId, data)

      return { success: true, organizationId }
    } catch (error: any) {
      const base = 'Failed to save onboarding data. '
      let message = error?.message || base
      
      // Provide more helpful error messages based on error type
      if (error?.message.includes('Authentication required') || error?.message.includes('Session expired')) {
        message = 'Please log in again to continue'
      } else if (error?.message.includes('Permission denied') || error?.message.includes('Authentication issue')) {
        message = 'Authentication issue: Please try logging out and back in'
      } else if (error?.message.includes('duplicate key')) {
        message = 'Some data already exists. Please check for duplicate entries.'
      } else if (error?.message.includes('network')) {
        message = 'Network error. Please check your connection and try again.'
      }

      console.error('Failed to save onboarding data:', error)
      return { success: false, error: message }
    }
  }

  return { saveOnboardingData }
}

