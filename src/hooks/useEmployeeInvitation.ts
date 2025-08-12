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
      // Use secure RPC function to create invitation
      const { data: result, error: inviteError } = await supabase.rpc(
        'create_employee_invitation',
        {
          _email: employeeData.email,
          _first_name: employeeData.firstName,
          _last_name: employeeData.lastName,
          _job_title: employeeData.jobTitle,
          _department_id: employeeData.departmentId,
          _division_id: employeeData.divisionId,
          _role_id: employeeData.roleId
        }
      );

      if (inviteError) {
        throw new Error(inviteError.message);
      }

      const resultData = result as any;
      if (!resultData?.success) {
        throw new Error(resultData?.error || 'Failed to create invitation');
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

      return { success: true, employeeId: resultData.employee_id };
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
      // Use secure RPC function to claim invitation
      const { data: result, error: claimError } = await supabase.rpc(
        'claim_employee_invitation',
        {
          _email: email,
          _user_id: userId
        }
      );

      if (claimError) {
        throw new Error(claimError.message);
      }

      const resultData = result as any;
      if (!resultData?.success) {
        throw new Error(resultData?.error || 'Failed to claim invitation');
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