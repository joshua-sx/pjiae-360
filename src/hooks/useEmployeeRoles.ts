import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useDemoEmployees } from './useDemoEmployees';
import type { AppRole } from '@/features/access-control/hooks/usePermissions';

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

export const useEmployeeRoles = () => {
  const { isDemoMode } = useDemoMode();
  const { data: demoEmployees } = useDemoEmployees('employee', { limit: 100 });

  return useQuery({
    queryKey: ['employee-roles'],
    queryFn: async (): Promise<EmployeeWithRole[]> => {
      if (isDemoMode) {
        // Convert demo employees to EmployeeWithRole format
        return demoEmployees?.map(emp => ({
          id: emp.id,
          name: `${emp.profile?.first_name || ''} ${emp.profile?.last_name || ''}`.trim(),
          email: emp.profile?.email || '',
          job_title: emp.job_title,
          current_roles: ['employee'] as AppRole[], // Demo employees are all employees
          user_id: emp.user_id,
          department: emp.department?.name,
          division: emp.division?.name,
          status: emp.status
        })) || [];
      }

      // Fetch employees with their profiles and roles
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

      // Fetch profiles for all employees
      const userIds = employees?.map(emp => emp.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email')
        .in('user_id', userIds);

      // Get current user's roles (organization-scoped)
      const { data: currentUserRoles } = await supabase.rpc('get_current_user_roles');
      
      // For security, only show employee role by default
      // Specific role assignments should be managed through role management interface
      const hasManagementRights = currentUserRoles?.some(r => 
        ['admin', 'director', 'manager'].includes(r.role)
      );

      // Combine the data
      return employees?.map(emp => {
        const profile = profiles?.find(p => p.user_id === emp.user_id);
        const defaultRoles: AppRole[] = hasManagementRights ? ['employee'] : undefined;
        
        return {
          id: emp.id,
          name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Unknown',
          email: profile?.email || '',
          job_title: emp.job_title,
          current_roles: defaultRoles,
          user_id: emp.user_id,
          department: emp.department?.name,
          division: emp.division?.name,
          status: emp.status
        };
      }) || [];
    },
    enabled: !isDemoMode || isDemoMode,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};