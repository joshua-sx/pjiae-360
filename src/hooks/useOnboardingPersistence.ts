import { supabase } from '@/integrations/supabase/client'
import { OnboardingData } from '@/components/onboarding/OnboardingTypes'
import { useAuth } from './useAuth'
import { useDemoGuard } from '@/lib/demo-mode-guard'

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

  // Use the new simplified find_or_create_org_for_user function
  const organizationName = orgName || `${session.user.email?.split('@')[0]}'s Organization`
  
  const { data: orgId, error: orgError } = await supabase.rpc('find_or_create_org_for_user', {
    _name: organizationName
  });

  if (orgError) {
    // Handle specific error cases
    if (orgError.message?.includes('User already belongs to an organization')) {
      // This shouldn't happen with the new function, but handle gracefully
      console.warn('User already has organization, proceeding...');
      const { data: existingProfile } = await supabase
        .from('employee_info')
        .select('organization_id')
        .eq('user_id', session.user.id)
        .maybeSingle();
      
      if (existingProfile?.organization_id) {
        return existingProfile.organization_id;
      }
    }
    throw orgError;
  }

  return orgId
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
          normalized_name: division.name.toLowerCase().trim(),
          organization_id: organizationId 
        }, {
          onConflict: 'organization_id,normalized_name',
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
        normalized_name: department.name.toLowerCase().trim(),
        organization_id: organizationId,
        division_id: divisionId,
      }, {
        onConflict: 'organization_id,normalized_name',
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
      organizationId: organizationId, // Send organizationId instead of orgName
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

export const useOnboardingPersistence = () => {
  const { user } = useAuth()
  const { guardDatabaseOperation } = useDemoGuard()

  const saveOnboardingData = async (data: OnboardingData): Promise<SaveOnboardingDataResult> => {
    try {
      // Guard against demo mode violations
      guardDatabaseOperation('save onboarding data')

      // Double-check authentication with session verification
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        throw new Error('Authentication required: Please log in to continue')
      }

      const userId = session.user.id

      // Log onboarding start
      await supabase.rpc('log_onboarding_event', {
        _event_type: 'onboarding_started',
        _event_details: { 
          entry_method: data.entryMethod,
          has_org_name: !!data.orgName,
          people_count: data.people?.length || 0
        }
      });

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

      // Ensure user has admin role for the organization using secure function
      const { data: currentRoles } = await supabase.rpc('get_current_user_roles');
      const hasAdminRole = currentRoles?.some(r => r.role === 'admin');

      if (!hasAdminRole) {
        const { data: roleResult, error: roleError } = await supabase.rpc('assign_user_role_secure', {
          _target_user_id: userId,
          _role: 'admin',
          _reason: 'Organization onboarding setup'
        });

        if (roleError || !(roleResult as any)?.success) {
          console.error('Error assigning admin role:', roleError || (roleResult as any)?.error)
          
          // Provide more specific error messages for role assignment
          if (roleError?.message?.includes('permission denied') || (roleResult as any)?.error?.includes('permission')) {
            console.warn('Role assignment failed due to permissions, continuing with setup')
          } else {
            throw new Error(`Failed to assign admin role: ${roleError?.message || (roleResult as any)?.error || 'Unknown error'}`)
          }
        }
      }

      // Save all data in sequence
      await saveStructure(organizationId, data)
      await importEmployees(organizationId, data) // Now passes organizationId
      await saveAppraisalCycle(organizationId, userId, data)

      // Log onboarding completion
      await supabase.rpc('log_onboarding_event', {
        _event_type: 'onboarding_completed',
        _event_details: { 
          organization_id: organizationId,
          has_appraisal_cycle: !!data.appraisalCycle
        }
      });

      // Safety net: Persist role assignments for any remaining users without roles
      if (data.people?.length > 0) {
        try {
          // Get current employee info for email-to-id mapping
          const { data: employees, error: fetchError } = await supabase
            .from('employee_info')
            .select('id, user_id, profiles!inner(email)')
            .eq('organization_id', organizationId);

          if (!fetchError && employees) {
            const emailToEmployeeMap = new Map(
              employees.map(emp => [
                (emp as any).profiles?.email || '', 
                { id: emp.id, userId: emp.user_id }
              ])
            );

            const roleAssignments = data.people
              .filter(person => person.role && person.role !== 'Employee')
              .map(async (person) => {
                const empInfo = emailToEmployeeMap.get(person.email);
                if (!empInfo?.userId) return { success: false, email: person.email };

                try {
                  // Map role to valid enum values
                  const roleMap: Record<string, string> = {
                    'Director': 'director',
                    'Manager': 'manager', 
                    'Supervisor': 'supervisor',
                    'Employee': 'employee'
                  };

                  const { error } = await supabase.rpc('assign_user_role_secure', {
                    _target_user_id: empInfo.userId,
                    _role: (roleMap[person.role!] || 'employee') as 'admin' | 'director' | 'manager' | 'supervisor' | 'employee',
                    _reason: 'Onboarding completion safety net'
                  });

                  return { success: !error, email: person.email, error: error?.message };
                } catch (err) {
                  console.error(`Role assignment failed for ${person.email}:`, err);
                  return { success: false, email: person.email, error: String(err) };
                }
              });

            if (roleAssignments.length > 0) {
              await Promise.all(roleAssignments);
            }
          }
        } catch (error) {
          console.error('Role assignment safety net failed:', error);
          // Don't fail the entire onboarding for role assignment issues
        }
      }

      return { success: true, organizationId }
    } catch (error: any) {
      const base = 'Failed to save onboarding data. '
      let message = error?.message || base
      
      // Handle specific error cases more gracefully
      if (error?.message.includes('User already belongs to an organization')) {
        // This is not actually an error with the new function - try to get the org ID
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: existingProfile } = await supabase
              .from('employee_info')
              .select('organization_id')
              .eq('user_id', session.user.id)
              .maybeSingle();
            
            if (existingProfile?.organization_id) {
              console.log('User already has organization, proceeding with existing one');
              return { success: true, organizationId: existingProfile.organization_id };
            }
          }
        } catch (fallbackError) {
          console.error('Fallback organization lookup failed:', fallbackError);
        }
      }
      
      // Provide more helpful error messages based on error type
      if (error?.message.includes('Authentication required') || error?.message.includes('Session expired')) {
        message = 'Please log in again to continue'
      } else if (error?.message.includes('Permission denied') || error?.message.includes('Authentication issue')) {
        message = 'Authentication issue: Please try logging out and back in'
      } else if (error?.message.includes('duplicate key')) {
        message = 'Some data already exists. Please check for duplicate entries.'
      } else if (error?.message.includes('network')) {
        message = 'Network error. Please check your connection and try again.'
      } else if (error?.code === '42P17') {
        message = 'Database configuration issue. Please try again in a moment.'
      }

      console.error('Failed to save onboarding data:', error)
      
      // Log onboarding error (but don't fail if logging fails)
      try {
        await supabase.rpc('log_onboarding_event', {
          _event_type: 'onboarding_error',
          _event_details: { error: error?.message || 'Unknown error' },
          _success: false
        });
      } catch (logError) {
        console.warn('Failed to log onboarding error:', logError);
      }
      
      return { success: false, error: message }
    }
  }

  return { saveOnboardingData }
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
