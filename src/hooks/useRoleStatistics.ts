
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { withPerformanceMonitoring } from '@/lib/performance-monitor';

interface RoleStatistics {
  totalRoles: number;
  admins: number;
  directors: number;
  managers: number;
  supervisors: number;
  employees: number;
  unassigned: number;
}

export const useRoleStatistics = () => {
  const { isDemoMode } = useDemoMode();

  return useQuery({
    queryKey: ['role-statistics'],
    queryFn: withPerformanceMonitoring(
      'role_statistics_query',
      async (): Promise<RoleStatistics> => {
        if (isDemoMode) {
          return {
            totalRoles: 5,
            admins: 3,
            directors: 2,
            managers: 12,
            supervisors: 8,
            employees: 141,
            unassigned: 5
          };
        }

        // Get all employees count in current organization
        const { count: totalEmployees } = await supabase
          .from('employee_info')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', (await supabase.rpc('get_current_user_org_id')).data);

        // Get all role assignments for current organization
        const { data: roleCounts } = await supabase
          .from('user_roles')
          .select('role, user_id')
          .eq('organization_id', (await supabase.rpc('get_current_user_org_id')).data)
          .eq('is_active', true);

        const roleStats = {
          admin: 0,
          director: 0,
          manager: 0,
          supervisor: 0,
          employee: 0
        };

        // Count all roles in organization
        roleCounts?.forEach(roleRecord => {
          const role = roleRecord.role as keyof typeof roleStats;
          if (role in roleStats) {
            roleStats[role]++;
          }
        });

        const totalAssigned = Object.values(roleStats).reduce((sum, count) => sum + count, 0);
        const unassigned = (totalEmployees || 0) - totalAssigned;

        return {
          totalRoles: 5, // System has 5 role types
          admins: roleStats.admin,
          directors: roleStats.director,
          managers: roleStats.manager,
          supervisors: roleStats.supervisor,
          employees: roleStats.employee,
          unassigned: Math.max(0, unassigned)
        };
      },
      { 
        isDemoMode, 
        component: 'role_statistics',
        timestamp: new Date().toISOString()
      }
    ),
    enabled: !isDemoMode || isDemoMode,
    refetchInterval: 30000, // Refresh every 30 seconds for live updates
  });
};
