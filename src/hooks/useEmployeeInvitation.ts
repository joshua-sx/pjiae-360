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

      // First create a profile entry for the user
      const { data: profileData, error: profileInsertError } = await supabase
        .from('profiles')
        .insert({
          first_name: employeeData.firstName,
          last_name: employeeData.lastName,
          email: employeeData.email
        })
        .select('id')
        .single();

      if (profileInsertError || !profileData) {
        throw new Error('Failed to create user profile');
      }

      // Create employee info without email field
      const { data: invited, error: insertError } = await supabase
        .from('employee_info')
        .insert({
          job_title: employeeData.jobTitle,
          department_id: employeeData.departmentId,
          division_id: employeeData.divisionId,
          organization_id: profile.organization_id,
          status: 'invited'
        })
        .select('id')
        .single();

      if (insertError || !invited) {
        throw new Error('Failed to create employee invitation');
      }

      // Send welcome email
      const { error: emailError } = await supabase.functions.invoke(
        'send-account-welcome',
        {
          body: {
            email: employeeData.email,
            firstName: employeeData.firstName,
            lastName: employeeData.lastName
          }
        }
      );

      if (emailError) {
        throw new Error('Failed to send invitation email');
      }

      return { success: true, employeeId: invited.id };
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
      // Find profile by email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (profileError || !profile) {
        throw new Error('Invalid invitation email');
      }

      // Find employee_info without user_id (invited status)
      const { data: employeeInfo, error: employeeError } = await supabase
        .from('employee_info')
        .select('*')
        .eq('status', 'invited')
        .is('user_id', null)
        .single();

      if (employeeError || !employeeInfo) {
        throw new Error('No pending invitation found');
      }

      // Update employee_info with user_id
      const { error: updateError } = await supabase
        .from('employee_info')
        .update({
          user_id: userId,
          status: 'active'
        })
        .eq('id', employeeInfo.id);

      if (updateError) {
        throw new Error('Failed to link profile to user');
      }

      // Update profile with user_id
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ user_id: userId })
        .eq('id', profile.id);

      if (profileUpdateError) {
        throw new Error('Failed to update profile');
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