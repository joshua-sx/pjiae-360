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

      // Insert the invited employee profile
      const { data: invited, error: insertError } = await supabase
        .from('employee_info')
        .insert({
          email: employeeData.email,
          first_name: employeeData.firstName,
          last_name: employeeData.lastName,
          job_title: employeeData.jobTitle,
          department_id: employeeData.departmentId,
          division_id: employeeData.divisionId,
          role_id: employeeData.roleId,
          organization_id: profile.organization_id,
          status: 'invited'
        })
        .select('invitation_token')
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

      return { success: true, token: invited.invitation_token };
    } catch (error) {
      console.error('Failed to invite employee:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  };

  const claimProfile = async (token: string, userId: string) => {
    try {
      const { data: invited, error: fetchError } = await supabase
        .from('employee_info')
        .select('*')
        .eq('invitation_token', token)
        .single();

      if (fetchError || !invited) {
        throw new Error('Invalid or expired invitation token');
      }

      const invitedAt = new Date(invited.invited_at);
      const expiration = new Date(invitedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
      if (new Date() > expiration) {
        throw new Error('Invitation token has expired');
      }

      if (invited.user_id) {
        throw new Error('Profile already claimed');
      }

      const { error: updateError } = await supabase
        .from('employee_info')
        .update({
          user_id: userId,
          status: 'active',
          invitation_token: null
        })
        .eq('id', invited.id);

      if (updateError) {
        throw new Error('Failed to link profile to user');
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