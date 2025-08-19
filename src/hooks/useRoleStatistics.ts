
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDataAccessGuard } from '@/hooks/useDataAccessGuard';
import { withPerformanceMonitoring } from '@/lib/performance-monitor';

export interface RoleStatistics {
  totalRoles: number;
  admins: number;
  directors: number;
  managers: number;
  employees: number;
  unassigned: number;
}

export function useRoleStatistics() {
  const { readyForDb } = useDataAccessGuard();

  const { data: stats, isLoading } = useQuery<RoleStatistics>({
    queryKey: ['role-statistics'],
    queryFn: withPerformanceMonitoring(
      'role_statistics_query',
      async (): Promise<RoleStatistics> => {
        // Get role counts from user_roles table
        const { data: roleCounts } = await supabase
          .from('user_roles')
          .select('role')
          .eq('is_active', true);

        const counts = {
          totalRoles: roleCounts?.length || 0,
          admins: roleCounts?.filter(r => r.role === 'admin').length || 0,
          directors: roleCounts?.filter(r => r.role === 'director').length || 0,
          managers: roleCounts?.filter(r => r.role === 'manager').length || 0,
          employees: roleCounts?.filter(r => r.role === 'employee').length || 0,
          unassigned: 0 // Calculate based on users without active roles
        };

        return counts;
      }
    ),
    initialData: {
      totalRoles: 0,
      admins: 0,
      directors: 0,
      managers: 0,
      employees: 0,
      unassigned: 0
    },
    enabled: readyForDb,
    refetchInterval: 30000,
    staleTime: 20000
  });

  return {
    stats: stats || {
      totalRoles: 0,
      admins: 0,
      directors: 0,
      managers: 0,
      employees: 0,
      unassigned: 0
    },
    loading: isLoading
  };
}
