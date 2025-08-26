
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDataAccessGuard } from '@/hooks/useDataAccessGuard';
import { useDemoData } from '@/contexts/DemoDataContext';
import { withPerformanceMonitoring } from '@/lib/performance-monitor';

export interface EmployeeCounts {
  total: number;
  active: number;
  pending: number;
  inactive: number;
}

export function useEmployeeCounts() {
  const { isDemoMode, readyForDb } = useDataAccessGuard();
  const { getEmployees } = useDemoData();

  const { data: counts, isLoading } = useQuery<EmployeeCounts>({
    queryKey: ['employee-counts', isDemoMode],
    queryFn: withPerformanceMonitoring(
      'employee_counts_query',
      async (): Promise<EmployeeCounts> => {
        if (isDemoMode) {
          const employees = getEmployees();
          const totalCount = employees.length;
          return {
            total: totalCount,
            active: employees.filter(e => e.status === 'active').length,
            pending: employees.filter(e => e.status === 'pending').length,
            inactive: employees.filter(e => e.status === 'inactive').length
          };
        }

        // Use same secure RPC as employee table for consistency
        const { data: totalCount, error: countError } = await supabase.rpc('get_secure_employee_directory_count_filtered', {
          _search: null,
          _division_ids: null,
          _department_ids: null,
          _status: null
        });

        if (countError) throw countError;

        // Get counts by status using secure RPC calls
        const statusQueries = await Promise.all([
          supabase.rpc('get_secure_employee_directory_count_filtered', {
            _search: null, _division_ids: null, _department_ids: null, _status: 'active'
          }),
          supabase.rpc('get_secure_employee_directory_count_filtered', {
            _search: null, _division_ids: null, _department_ids: null, _status: 'pending'  
          }),
          supabase.rpc('get_secure_employee_directory_count_filtered', {
            _search: null, _division_ids: null, _department_ids: null, _status: 'inactive'
          })
        ]);

        const [activeResult, pendingResult, inactiveResult] = statusQueries;

        const counts: EmployeeCounts = {
          total: totalCount || 0,
          active: activeResult.data || 0,
          pending: pendingResult.data || 0,
          inactive: inactiveResult.data || 0
        };

        return counts;
      },
      { 
        isDemoMode,
        timestamp: new Date().toISOString()
      }
    ),
    initialData: { total: 0, active: 0, pending: 0, inactive: 0 },
    enabled: isDemoMode || readyForDb,
    refetchInterval: 30000,
    staleTime: 20000
  });

  return {
    counts: counts || { total: 0, active: 0, pending: 0, inactive: 0 },
    loading: isLoading
  };
}
