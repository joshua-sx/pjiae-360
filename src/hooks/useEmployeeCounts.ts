import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useDemoData } from '@/contexts/DemoDataContext';
import { ensureProductionMode } from '@/lib/production-mode-guard';

interface EmployeeCountsResult {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  invited: number;
  divisions: Record<string, number>;
  departments: Record<string, number>;
  unassigned: number;
}

export function useEmployeeCounts() {
  const { isDemoMode } = useDemoMode();
  const { getEmployees } = useDemoData();

  const query = useQuery({
    queryKey: ['employee-counts', isDemoMode],
    queryFn: async (): Promise<EmployeeCountsResult> => {
      if (isDemoMode) {
        // Get demo employees and calculate counts
        const demoEmployees = getEmployees();
        
        const counts: EmployeeCountsResult = {
          total: demoEmployees.length,
          active: demoEmployees.filter(emp => emp.status === 'active').length,
          inactive: demoEmployees.filter(emp => emp.status === 'inactive').length,
          pending: demoEmployees.filter(emp => emp.status === 'pending').length,
          invited: demoEmployees.filter(emp => emp.status === 'invited').length,
          divisions: {},
          departments: {},
          unassigned: 0
        };

        // Calculate division and department counts
        demoEmployees.forEach(emp => {
          if (emp.division_id) {
            counts.divisions[emp.division_id] = (counts.divisions[emp.division_id] || 0) + 1;
          }
          if (emp.department_id) {
            counts.departments[emp.department_id] = (counts.departments[emp.department_id] || 0) + 1;
          }
          if (!emp.division_id && !emp.department_id) {
            counts.unassigned++;
          }
        });

        return counts;
      }

      // Production mode - get actual counts from database
      ensureProductionMode('employee-counts');

      // Get current user's organization
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error('Not authenticated');

      const { data: employeeInfo } = await supabase
        .from('employee_info')
        .select('organization_id')
        .eq('user_id', currentUser.user.id)
        .single();

      if (!employeeInfo) throw new Error('User not found in any organization');

      // Get all employees with their division and department assignments
      const { data: employees, error } = await supabase
        .from('employee_info')
        .select('status, division_id, department_id')
        .eq('organization_id', employeeInfo.organization_id);

      if (error) throw error;

      const counts: EmployeeCountsResult = {
        total: employees?.length || 0,
        active: 0,
        inactive: 0,
        pending: 0,
        invited: 0,
        divisions: {},
        departments: {},
        unassigned: 0
      };

      employees?.forEach(emp => {
        // Count by status
        switch (emp.status) {
          case 'active':
            counts.active++;
            break;
          case 'inactive':
            counts.inactive++;
            break;
          case 'pending':
            counts.pending++;
            break;
          case 'invited':
            counts.invited++;
            break;
        }

        // Count by division and department
        if (emp.division_id) {
          counts.divisions[emp.division_id] = (counts.divisions[emp.division_id] || 0) + 1;
        }
        if (emp.department_id) {
          counts.departments[emp.department_id] = (counts.departments[emp.department_id] || 0) + 1;
        }
        if (!emp.division_id && !emp.department_id) {
          counts.unassigned++;
        }
      });

      return counts;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    counts: query.data ?? {
      total: 0,
      active: 0,
      inactive: 0,
      pending: 0,
      invited: 0,
      divisions: {},
      departments: {},
      unassigned: 0
    },
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  };
}