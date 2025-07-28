import { supabase } from '@/integrations/supabase/client'
import { OnboardingData } from '@/components/onboarding/OnboardingTypes'
import { useAuth } from './useAuth'

export interface SaveOnboardingDataResult {
  success: boolean
  error?: string
  organizationId?: string
}

const findOrCreateOrganization = async (orgName?: string): Promise<string> => {
  // First check if the current user already has an organization
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // Check if user already has a profile with an organization
  const { data: userProfile } = await supabase
    .from('employee_info')
    .select('organization_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (userProfile?.organization_id) {
    return userProfile.organization_id
  }

  // Generate organization name
  const organizationName = orgName || `${user.email?.split('@')[0]}'s Organization`

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
    if (createError.code === '42501') {
      throw new Error('Permission denied: Unable to create organization. Please contact support.')
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
    const { error } = await (supabase as any)
      .from('divisions')
      .insert({ name: division.name, organization_id: organizationId })
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

    const { error } = await (supabase as any)
      .from('departments')
      .insert({
        name: department.name,
        organization_id: organizationId,
        division_id: divisionId,
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
    .insert(cycleData)
    .select()
    .single()
  if (cycleError) throw new Error(`Failed to save appraisal cycle: ${cycleError.message}`)

  if (data.appraisalCycle.reviewPeriods && data.appraisalCycle.reviewPeriods.length > 0) {
    const periodInserts = data.appraisalCycle.reviewPeriods.map(p => ({
      start_date: p.startDate.toISOString().split('T')[0],
      end_date: p.endDate.toISOString().split('T')[0],
      cycle_id: cycleResult.id,
      phase: 'goal_setting' as const, // Default phase, could be dynamic based on review period type
    }))
    const { error } = await supabase.from('cycle_phases').insert(periodInserts)
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
      if (!user) throw new Error('User not authenticated')

      const { data: userData, error } = await supabase.auth.getUser()
      if (error || !userData.user) throw new Error('User not authenticated')

      const userId = userData.user.id

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
          throw new Error('Failed to create employee record')
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
          // Don't fail the whole process for role assignment
        }
      }

      // Save all data in sequence
      await saveStructure(organizationId, data)
      await importEmployees(organizationId, data)
      await saveAppraisalCycle(organizationId, userId, data)

      return { success: true, organizationId }
    } catch (error: any) {
      const base = 'Failed to save onboarding data. '
      const message =
        error?.message.includes('duplicate key')
          ? 'Some data already exists. Please check for duplicate entries.'
          : error?.message.includes('Permission denied')
          ? 'Permission denied: Unable to create organization. Please contact support.'
          : error?.message.includes('network')
          ? 'Network error. Please check your connection and try again.'
          : error?.message || base

      console.error('Failed to save onboarding data:', error)
      return { success: false, error: message }
    }
  }

  return { saveOnboardingData }
}

