import { supabase } from '@/integrations/supabase/client';

export interface InviteEmployeeData {
  email: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  departmentId?: string;
  divisionId?: string;
  roleId?: string;
}

export const useEmployeeInvitation = () => {
  const inviteEmployee = async (employeeData: InviteEmployeeData) => {
    try {
      // Get current user's organization
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('User not authenticated');
      }

      const { data: profile, error: profileError } = await supabase
        .from('employee_info')
        .select('organization_id')
        .eq('user_id', userData.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Could not find user profile');
      }

      // Create the invited employee profile
      const { data: newProfile, error: createError } = await supabase
        .from('employee_info')
        .insert({
          email: employeeData.email,
          first_name: employeeData.firstName,
          last_name: employeeData.lastName,
          job_title: employeeData.jobTitle,
          organization_id: profile.organization_id,
          department_id: employeeData.departmentId || null,
          division_id: employeeData.divisionId || null,
          role_id: employeeData.roleId || null,
          status: 'invited',
          user_id: null // Will be populated when they sign up
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      return { success: true, profile: newProfile };
    } catch (error) {
      console.error('Failed to invite employee:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  };

  const claimProfile = async (email: string, userId: string) => {
    try {
      // Find existing profile with this email that hasn't been claimed
      const { data: existingProfile, error: findError } = await supabase
        .from('employee_info')
        .select('id')
        .eq('email', email)
        .is('user_id', null)
        .maybeSingle();

      if (findError) {
        return { success: false, error: findError.message };
      }

      if (!existingProfile) {
        return { success: false, error: 'No invitation found for this email' };
      }

      // Update the profile to link it to the user
      const { error: updateError } = await supabase
        .from('employee_info')
        .update({
          user_id: userId,
          status: 'active'
        })
        .eq('id', existingProfile.id);

      if (updateError) {
        throw updateError;
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to claim profile:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  };

  return { inviteEmployee, claimProfile };
};