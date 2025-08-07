import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDemoMode } from '@/contexts/DemoModeContext';

interface EmployeeCounts {
  divisions: Record<string, number>;
  departments: Record<string, number>;
  unassigned: number;
}

export function useEmployeeCounts() {
  const { isDemoMode } = useDemoMode();

  const query = useQuery({
    queryKey: ['employee-counts', isDemoMode],
    queryFn: async (): Promise<EmployeeCounts> => {
      if (isDemoMode) {
        return { divisions: {}, departments: {}, unassigned: 0 };
      }

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
        .select('division_id, department_id')
        .eq('organization_id', employeeInfo.organization_id)
        .eq('status', 'active');

      if (error) throw error;

      const counts: EmployeeCounts = {
        divisions: {},
        departments: {},
        unassigned: 0
      };

      employees?.forEach(emp => {
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
  });

  return {
    counts: query.data ?? { divisions: {}, departments: {}, unassigned: 0 },
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
  };
}