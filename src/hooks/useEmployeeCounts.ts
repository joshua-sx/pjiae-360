
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

        // Get total count
        const { count: totalCount } = await supabase
          .from('employee_info')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', (await supabase.rpc('get_current_user_org_id')).data);

        // Get counts by status
        const { data: statusCounts } = await supabase
          .from('employee_info')
          .select('status')
          .eq('organization_id', (await supabase.rpc('get_current_user_org_id')).data);

        const counts: EmployeeCounts = {
          total: totalCount || 0,
          active: statusCounts?.filter(e => e.status === 'active').length || 0,
          pending: statusCounts?.filter(e => e.status === 'pending').length || 0,
          inactive: statusCounts?.filter(e => e.status === 'inactive').length || 0
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
