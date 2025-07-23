import { supabase } from '@/integrations/supabase/client';
import { OnboardingData } from '@/components/onboarding/OnboardingTypes';
import { useAuth } from './useAuth';

export interface SaveOnboardingDataResult {
  success: boolean;
  error?: string;
  organizationId?: string;
}

export const useOnboardingPersistence = () => {
  const { user } = useAuth();

  const saveOnboardingData = async (data: OnboardingData): Promise<SaveOnboardingDataResult> => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get user's profile to find organization
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('User not authenticated');
      }

      const userId = userData.user.id;
      
      // Get user's organization from auth metadata or use a default
      const userOrgId = userData.user.user_metadata?.organization_id;
      let organizationId = userOrgId;

      // If no organization ID in metadata, try to find or create one
      if (!organizationId) {
        // Try to find an existing organization or create a default one
        const { data: orgData, error: orgQueryError } = await supabase
          .from('organizations')
          .select('id')
          .limit(1)
          .single();

        if (orgQueryError && orgQueryError.code !== 'PGRST116') {
          throw new Error(`Failed to find organization: ${orgQueryError.message}`);
        }

        if (orgData) {
          organizationId = orgData.id;
        } else {
          // Create a new organization
          const { data: newOrg, error: createOrgError } = await supabase
            .from('organizations')
            .insert({ name: data.orgName || 'New Organization' })
            .select('id')
            .single();

          if (createOrgError) {
            throw new Error(`Failed to create organization: ${createOrgError.message}`);
          }
          organizationId = newOrg.id;
        }
      }

      // 1. Update organization name if provided
      if (data.orgName) {
        const { error: orgError } = await supabase
          .from('organizations')
          .update({ name: data.orgName })
          .eq('id', organizationId);

        if (orgError) throw new Error(`Failed to update organization: ${orgError.message}`);
      }

      // 2. Save organizational structure (simplified)
      if (data.orgStructure.length > 0) {
        const divisions = data.orgStructure.filter(item => item.type === 'division');
        const departments = data.orgStructure.filter(item => item.type === 'department');

        // Save divisions first
        if (divisions.length > 0) {
          for (const division of divisions) {
            // Insert directly without upsert to avoid conflicts
            const { error: divError } = await (supabase as any)
              .from('divisions')
              .insert({
                name: division.name,
                organization_id: organizationId
              })
              .select()
              .single();

            if (divError && !divError.message.includes('duplicate')) {
              console.warn(`Failed to save division ${division.name}: ${divError.message}`);
            }
          }
        }

        // Save departments
        if (departments.length > 0) {
          for (const department of departments) {
            // Find division ID if parent is specified
            let divisionId = null;
            if (department.parent) {
              const { data: divisionData } = await supabase
                .from('divisions')
                .select('id')
                .eq('name', department.parent)
                .eq('organization_id', organizationId)
                .single();
              
              divisionId = divisionData?.id || null;
            }

            const { error: deptError } = await (supabase as any)
              .from('departments')
              .insert({
                name: department.name,
                organization_id: organizationId,
                division_id: divisionId
              })
              .select()
              .single();

            if (deptError && !deptError.message.includes('duplicate')) {
              console.warn(`Failed to save department ${department.name}: ${deptError.message}`);
            }
          }
        }
      }

      // 3. Use the import-employees edge function to handle the bulk import
      if (data.people.length > 0) {
        console.log('Calling import-employees edge function...');
        
        const { error: importError } = await supabase.functions.invoke('import-employees', {
          body: {
            employees: data.people,
            organizationId: organizationId,
            entryMethod: data.entryMethod,
            columnMapping: data.csvData.columnMapping
          }
        });

        if (importError) {
          throw new Error(`Failed to import employees: ${importError.message}`);
        }
      }

      // 4. Save appraisal cycle if configured
      if (data.appraisalCycle) {
        const cycleData = {
          name: data.appraisalCycle.cycleName,
          frequency: data.appraisalCycle.frequency,
          start_date: data.appraisalCycle.startDate,
          end_date: data.appraisalCycle.frequency === 'annual' 
            ? new Date(new Date(data.appraisalCycle.startDate).setFullYear(new Date(data.appraisalCycle.startDate).getFullYear() + 1)).toISOString().split('T')[0]
            : new Date(new Date(data.appraisalCycle.startDate).setMonth(new Date(data.appraisalCycle.startDate).getMonth() + 6)).toISOString().split('T')[0],
          organization_id: organizationId,
          created_by: userId,
          status: 'active'
        };

        const { data: cycleResult, error: cycleError } = await supabase
          .from('cycles')
          .insert(cycleData)
          .select()
          .single();

        if (cycleError) throw new Error(`Failed to save appraisal cycle: ${cycleError.message}`);

        // Save review periods
        if (data.appraisalCycle.reviewPeriods && data.appraisalCycle.reviewPeriods.length > 0) {
          const periodInserts = data.appraisalCycle.reviewPeriods.map(period => ({
            name: period.name,
            start_date: period.startDate.toISOString().split('T')[0],
            end_date: period.endDate.toISOString().split('T')[0],
            cycle_id: cycleResult.id,
            organization_id: organizationId,
            status: 'draft'
          }));

          const { error: periodError } = await supabase
            .from('periods')
            .insert(periodInserts);

          if (periodError) throw new Error(`Failed to save review periods: ${periodError.message}`);
        }

        // Save competencies if provided
        if (data.appraisalCycle.competencyCriteria?.competencies && data.appraisalCycle.competencyCriteria.competencies.length > 0) {
          const competenciesToInsert = data.appraisalCycle.competencyCriteria.competencies.map(comp => ({
            name: comp.name,
            description: comp.description,
            organization_id: organizationId,
            is_active: true
          }));

          const { error: compError } = await supabase
            .from('competencies')
            .insert(competenciesToInsert);

          if (compError) throw new Error(`Failed to save competencies: ${compError.message}`);
        }
      }

      console.log("Onboarding data saved successfully");
      return { 
        success: true, 
        organizationId: organizationId
      };

    } catch (error) {
      console.error('Failed to save onboarding data:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to save onboarding data. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('duplicate key')) {
          errorMessage = 'Some data already exists. Please check for duplicate entries.';
        } else if (error.message.includes('permission')) {
          errorMessage = 'Permission denied. Please contact support.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  return { saveOnboardingData };
};