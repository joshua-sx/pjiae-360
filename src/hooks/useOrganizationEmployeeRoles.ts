import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { AppRole } from './usePermissions';

export interface EmployeeWithRole {
  id: string;
  name: string;
  email: string;
  job_title?: string;
  current_roles?: AppRole[];
  user_id: string;
  department?: string;
  division?: string;
  status?: string;
}

// Organization-aware hook that uses secure RPC functions
export const useOrganizationEmployeeRoles = () => {
  return useQuery({
    queryKey: ['organization-employee-roles'],
    queryFn: async (): Promise<EmployeeWithRole[]> => {
      // Fetch employees in current organization
      const { data: employees, error: employeesError } = await supabase
        .from('employee_info')
        .select(`
          id,
          user_id,
          job_title,
          status,
          department:departments(name),
          division:divisions(name)
        `);

      if (employeesError) throw employeesError;

      if (!employees || employees.length === 0) {
        return [];
      }

      // Fetch profiles for all employees
      const userIds = employees.map(emp => emp.user_id).filter(Boolean);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email')
        .in('user_id', userIds);

      // Get current user's roles for reference (organization-scoped)
      const { data: currentUserRoles } = await supabase.rpc('get_current_user_roles');
      
      // For security, only show roles if user has management permissions
      const hasManagementRights = currentUserRoles?.some(r => 
        ['admin', 'director', 'manager'].includes(r.role)
      );

      // Get actual role assignments for all users in organization
      let userRoles: { user_id: string; role: string }[] = [];
      if (hasManagementRights && userIds.length > 0) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', userIds)
          .eq('is_active', true);
        
        userRoles = roles || [];
      }

      // Combine the data
      return employees.map(emp => {
        const profile = profiles?.find(p => p.user_id === emp.user_id);
        
        // Get actual roles for this user
        const empRoles = userRoles
          .filter(r => r.user_id === emp.user_id)
          .map(r => r.role as AppRole);
        
        return {
          id: emp.id,
          name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Unknown',
          email: profile?.email || '',
          job_title: emp.job_title,
          // Show actual roles if user has management rights, empty array if no roles assigned
          current_roles: hasManagementRights ? empRoles : undefined,
          user_id: emp.user_id || '',
          department: emp.department?.name,
          division: emp.division?.name,
          status: emp.status
        };
      });
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};