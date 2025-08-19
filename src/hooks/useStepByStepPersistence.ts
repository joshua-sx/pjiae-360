import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OnboardingData } from '@/components/onboarding/OnboardingTypes';
import { useAuth } from './useAuth';
import { useDemoGuard } from '@/lib/demo-mode-guard';

interface StepSaveResult {
  success: boolean;
  error?: string;
  organizationId?: string;
}

export const useStepByStepPersistence = () => {
  const { user } = useAuth();
  const { guardDatabaseOperation } = useDemoGuard();
  const [isLoading, setIsLoading] = useState(false);

  const ensureOrganization = async (orgName?: string): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('Authentication required');
    }

    const organizationName = orgName || `${session.user.email?.split('@')[0]}'s Organization`;
    
    const { data: orgId, error: orgError } = await supabase.rpc('find_or_create_org_for_user', {
      _name: organizationName
    });

    if (orgError) {
      throw new Error(`Failed to create organization: ${orgError.message}`);
    }

    return orgId;
  };

  const saveOrgDetails = useCallback(async (data: OnboardingData): Promise<StepSaveResult> => {
    try {
      guardDatabaseOperation('save organization details');
      setIsLoading(true);

      const organizationId = await ensureOrganization(data.orgName);

      // Update organization name if provided
      if (data.orgName) {
        const { error: orgError } = await supabase
          .from('organizations')
          .update({ name: data.orgName })
          .eq('id', organizationId);
        
        if (orgError) {
          console.warn('Failed to update organization name:', orgError.message);
        }
      }

      // Upload logo if provided
      if (data.logo) {
        const fileExt = data.logo.name.split('.').pop();
        const fileName = `${organizationId}/logo.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('org-assets')
          .upload(fileName, data.logo, { upsert: true });

        if (uploadError) {
          console.warn('Failed to upload logo:', uploadError.message);
        } else {
          // Update organization with logo path
          const { error: logoError } = await supabase
            .from('organizations')
            .update({ logo_file_path: fileName })
            .eq('id', organizationId);
          
          if (logoError) {
            console.warn('Failed to update logo path:', logoError.message);
          }
        }
      }

      // Save organization settings
      const settings = {
        industry: data.orgProfile.industry,
        company_size: data.orgProfile.companySize,
        locale: data.orgProfile.locale,
        timezone: data.orgProfile.timezone,
        currency: data.orgProfile.currency,
        work_week: data.orgProfile.workWeek,
        fiscal_year_start: data.orgProfile.fiscalYearStart,
        public_holidays: data.orgProfile.publicHolidays,
        organization_id: organizationId
      };

      const { error: settingsError } = await supabase
        .from('organization_settings')
        .upsert(settings, { onConflict: 'organization_id' });

      if (settingsError) {
        console.warn('Failed to save organization settings:', settingsError.message);
      }

      return { success: true, organizationId };
    } catch (error: any) {
      console.error('Failed to save organization details:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [guardDatabaseOperation]);

  const saveOrgStructure = useCallback(async (data: OnboardingData, organizationId: string): Promise<StepSaveResult> => {
    try {
      guardDatabaseOperation('save organization structure');
      setIsLoading(true);

      if (data.orgStructure.length === 0) {
        return { success: true, organizationId };
      }
      
      const divisions = data.orgStructure.filter(i => i.type === 'division');
      const departments = data.orgStructure.filter(i => i.type === 'department');

      // Save divisions first
      const divisionIdMap = new Map<string, string>();
      for (const division of divisions) {
        const { data: savedDivision, error } = await supabase
          .from('divisions')
          .upsert({ 
            name: division.name,
            normalized_name: division.name.toLowerCase().trim(),
            organization_id: organizationId 
          }, {
            onConflict: 'organization_id,normalized_name',
            ignoreDuplicates: false
          })
          .select()
          .single();
          
        if (error && !error.message.includes('duplicate')) {
          console.warn(`Failed to save division ${division.name}: ${error.message}`);
        } else if (savedDivision) {
          divisionIdMap.set(division.id, savedDivision.id);
        }
      }

      // Save departments
      for (const department of departments) {
        let divisionId = null;
        if (department.parent) {
          divisionId = divisionIdMap.get(department.parent) || null;
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
            ignoreDuplicates: false
          });
          
        if (error && !error.message.includes('duplicate')) {
          console.warn(`Failed to save department ${department.name}: ${error.message}`);
        }
      }

      return { success: true, organizationId };
    } catch (error: any) {
      console.error('Failed to save organization structure:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [guardDatabaseOperation]);

  const savePeople = useCallback(async (data: OnboardingData, organizationId: string): Promise<StepSaveResult> => {
    try {
      guardDatabaseOperation('save people data');
      setIsLoading(true);

      if (data.people.length === 0) {
        return { success: true, organizationId };
      }

      // Upload CSV file if it exists
      let filePath: string | null = null;
      if (data.csvData.rawData && data.entryMethod === 'csv') {
        const fileName = `${organizationId}/employees_${Date.now()}.csv`;
        const { error: uploadError } = await supabase.storage
          .from('employee-imports')
          .upload(fileName, new Blob([data.csvData.rawData], { type: 'text/csv' }));

        if (uploadError) {
          console.warn('Failed to upload CSV file:', uploadError.message);
        } else {
          filePath = fileName;
        }
      }

      // Import employees using edge function
      const { data: result, error } = await supabase.functions.invoke('import-employees', {
        body: {
          organizationId: organizationId,
          people: data.people,
          adminInfo: data.adminInfo,
          csvFilePath: filePath
        },
      });
      
      if (error) {
        throw new Error(`Failed to import employees: ${error.message}`);
      }

      // Store import batch info
      if (filePath) {
        const { error: batchError } = await supabase
          .from('import_batches')
          .insert({
            organization_id: organizationId,
            uploaded_by: user?.id,
            total_records: data.people.length,
            successful_records: result?.successful || 0,
            failed_records: result?.errors?.length || 0,
            status: 'completed',
            file_path: filePath
          });

        if (batchError) {
          console.warn('Failed to save import batch info:', batchError.message);
        }
      }

      return { success: true, organizationId };
    } catch (error: any) {
      console.error('Failed to save people data:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [guardDatabaseOperation, user]);

  const saveAppraisal = useCallback(async (data: OnboardingData, organizationId: string): Promise<StepSaveResult> => {
    try {
      guardDatabaseOperation('save appraisal cycle');
      setIsLoading(true);

      if (!data.appraisalCycle) {
        return { success: true, organizationId };
      }

      const cycleData = {
        name: data.appraisalCycle.cycleName,
        start_date: data.appraisalCycle.startDate,
        end_date: data.appraisalCycle.frequency === 'annual'
          ? new Date(new Date(data.appraisalCycle.startDate).setFullYear(
              new Date(data.appraisalCycle.startDate).getFullYear() + 1
            )).toISOString().split('T')[0]
          : new Date(new Date(data.appraisalCycle.startDate).setMonth(
              new Date(data.appraisalCycle.startDate).getMonth() + 6
            )).toISOString().split('T')[0],
        organization_id: organizationId,
        status: 'active' as const,
        year: new Date(data.appraisalCycle.startDate).getFullYear(),
      };

      const { data: cycleResult, error: cycleError } = await supabase
        .from('appraisal_cycles')
        .upsert(cycleData, { 
          onConflict: 'organization_id,year',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (cycleError) {
        throw new Error(`Failed to save appraisal cycle: ${cycleError.message}`);
      }

      // Save goal setting windows
      if (data.appraisalCycle.goalSettingWindows?.length > 0) {
        const windowInserts = data.appraisalCycle.goalSettingWindows.map(window => ({
          cycle_id: cycleResult.id,
          name: window.name,
          start_date: window.startDate.toISOString().split('T')[0],
          end_date: window.endDate.toISOString().split('T')[0]
        }));

        const { error: windowsError } = await supabase
          .from('goal_setting_windows')
          .insert(windowInserts);

        if (windowsError) {
          console.warn('Failed to save goal setting windows:', windowsError.message);
        }
      }

      // Save review periods
      if (data.appraisalCycle.reviewPeriods?.length > 0) {
        const periodInserts = data.appraisalCycle.reviewPeriods.map(p => ({
          start_date: p.startDate.toISOString().split('T')[0],
          end_date: p.endDate.toISOString().split('T')[0],
          cycle_id: cycleResult.id,
          phase: 'year_end' as const,
          goal_window_id: null
        }));

        const { error } = await supabase
          .from('cycle_phases')
          .upsert(periodInserts, {
            onConflict: 'cycle_id,phase',
            ignoreDuplicates: false
          });

        if (error) {
          console.warn('Failed to save review periods:', error.message);
        }
      }

      // Save competencies
      if (data.appraisalCycle.competencyCriteria?.competencies?.length > 0) {
        const competenciesToInsert = data.appraisalCycle.competencyCriteria.competencies.map(c => ({
          name: c.name,
          description: c.description,
          organization_id: organizationId,
          code: c.name.toLowerCase().replace(/\s+/g, '_'),
        }));

        const { error } = await supabase
          .from('competencies')
          .insert(competenciesToInsert);

        if (error) {
          console.warn('Failed to save competencies:', error.message);
        }
      }

      return { success: true, organizationId };
    } catch (error: any) {
      console.error('Failed to save appraisal cycle:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [guardDatabaseOperation]);

  const loadPersistedData = useCallback(async (): Promise<OnboardingData | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      // Get user's organization
      const { data: userRoles } = await supabase.rpc('get_current_user_roles');
      if (!userRoles?.length) return null;

      const { data: orgData } = await supabase
        .from('organizations')
        .select(`
          id, name, logo_file_path,
          organization_settings(*)
        `)
        .single();

      if (!orgData) return null;

      // Load organization structure
      const { data: structure } = await supabase.rpc('get_organization_structure');
      
      // Load employees  
      const { data: employees } = await supabase.rpc('get_organization_employees');

      // Load appraisal cycles
      const { data: cycles } = await supabase
        .from('appraisal_cycles')
        .select(`
          *,
          goal_setting_windows(*),
          cycle_phases(*)
        `)
        .eq('organization_id', orgData.id);

      // Transform back to OnboardingData format
      const persistedData: Partial<OnboardingData> = {
        orgName: orgData.name,
        orgStructure: structure?.map(s => ({
          id: s.div_id || s.dept_id || '',
          name: s.div_name || s.dept_name || '',
          type: s.dept_id ? 'department' : 'division',
          parent: s.dept_division_id || undefined
        })) || [],
        people: employees?.map(e => ({
          id: e.employee_id,
          firstName: e.first_name || '',
          lastName: e.last_name || '',
          email: e.email || '',
          phoneNumber: '',
          jobTitle: e.job_title || '',
          department: e.department_name || '',
          division: e.division_name || '',
          status: (e.status === 'invited' ? 'pending' : e.status) as 'active' | 'pending' | 'inactive'
        })) || []
      };

      return persistedData as OnboardingData;
    } catch (error) {
      console.error('Failed to load persisted data:', error);
      return null;
    }
  }, []);

  return {
    saveOrgDetails,
    saveOrgStructure,
    savePeople,
    saveAppraisal,
    loadPersistedData,
    isLoading
  };
};