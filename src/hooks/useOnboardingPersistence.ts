import { supabase } from '@/integrations/supabase/client';
import { OnboardingData } from '@/components/onboarding/OnboardingTypes';

export interface SaveOnboardingDataResult {
  success: boolean;
  error?: string;
  organizationId?: string;
}

export const useOnboardingPersistence = () => {
  const saveOnboardingData = async (data: OnboardingData): Promise<SaveOnboardingDataResult> => {
    try {
      // Get current user data first
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('User not authenticated');
      }

      const userId = userData.user.id;
      
      // Get user's organization ID from their profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', userId)
        .single();

      if (profileError || !profile) {
        throw new Error('Could not find user profile');
      }

      const organizationId = profile.organization_id;
      const operations = [];

      // 1. Update organization
      if (data.orgName) {
        const { error: orgError } = await supabase
          .from('organizations')
          .update({ name: data.orgName })
          .eq('id', organizationId);

        if (orgError) throw new Error(`Failed to update organization: ${orgError.message}`);
        operations.push('organization');
      }

      // 2. Save employee profiles
      if (data.people.length > 0) {
        const profileInserts = data.people.map(person => ({
          email: person.email,
          first_name: person.firstName,
          last_name: person.lastName,
          job_title: person.jobTitle,
          organization_id: organizationId,
          user_id: userId, // This is required but we'll need to handle multiple users differently
          status: 'active'
        }));

        // For now, we'll skip this since we can't create multiple user accounts
        // This would need to be handled differently in a real system
        console.log('Employee profiles to be created:', profileInserts);
        operations.push('profiles');
      }

      // 3. Save organizational structure
      if (data.orgStructure.length > 0) {
        const divisions = data.orgStructure.filter(item => item.type === 'division');
        const departments = data.orgStructure.filter(item => item.type === 'department');

        // Save divisions first
        if (divisions.length > 0) {
          const divisionInserts = divisions.map(div => ({
            name: div.name,
            organization_id: organizationId
          }));

          const { error: divError } = await supabase
            .from('divisions')
            .upsert(divisionInserts, { onConflict: 'name,organization_id' });

          if (divError) throw new Error(`Failed to save divisions: ${divError.message}`);
          operations.push('divisions');
        }

        // Save departments
        if (departments.length > 0) {
          const departmentInserts = departments.map(dept => ({
            name: dept.name,
            organization_id: organizationId,
            division_id: null // You may want to link these properly based on your structure
          }));

          const { error: deptError } = await supabase
            .from('departments')
            .upsert(departmentInserts, { onConflict: 'name,organization_id' });

          if (deptError) throw new Error(`Failed to save departments: ${deptError.message}`);
          operations.push('departments');
        }
      }

      // 4. Save roles
      const roleTypes = ['directors', 'managers', 'supervisors', 'employees'] as const;
      for (const roleType of roleTypes) {
        if (data.roles[roleType].length > 0) {
          const roleInserts = data.roles[roleType].map(roleName => ({
            name: roleName,
            description: `${roleType.slice(0, -1)} role`,
            organization_id: organizationId
          }));

          const { error: roleError } = await supabase
            .from('roles')
            .upsert(roleInserts, { onConflict: 'name,organization_id' });

          if (roleError) throw new Error(`Failed to save ${roleType}: ${roleError.message}`);
        }
      }
      operations.push('roles');

      // 5. Save appraisal cycle if configured
      if (data.appraisalCycle) {
        const cycleData = {
          name: data.appraisalCycle.cycleName,
          frequency: data.appraisalCycle.frequency,
          start_date: data.appraisalCycle.startDate,
          end_date: new Date(new Date(data.appraisalCycle.startDate).getFullYear() + 1, 11, 31).toISOString().split('T')[0],
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
        if (data.appraisalCycle.reviewPeriods.length > 0) {
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
        operations.push('cycles');
      }

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