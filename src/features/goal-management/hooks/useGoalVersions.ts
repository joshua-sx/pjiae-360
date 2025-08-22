
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GoalVersion {
  id: string;
  goalId: string;
  versionNumber: number;
  changedBy: string | null;
  changedAt: string;
  changeType: 'create' | 'update' | 'delete';
  changeSummary: string | null;
  data: any;
}

export function useGoalVersions(goalId: string) {
  const query = useQuery({
    queryKey: ['goal-versions', goalId],
    enabled: !!goalId,
    queryFn: async (): Promise<GoalVersion[]> => {
      try {
        // Query goal assignments directly since get_goal_versions function doesn't exist
        const { data, error } = await supabase
          .from('goal_assignments')
          .select(`
            *,
            goal:goals!goal_assignments_goal_id_fkey(
              id,
              title,
              created_at,
              updated_at
            ),
            employee:employee_info!goal_assignments_employee_id_fkey(
              profiles!employee_info_user_id_fkey(
                first_name,
                last_name
              )
            )
          `)
          .eq('goal_id', goalId)
          .order('assigned_at', { ascending: false });

        if (error) {
          console.error('Error fetching goal versions:', error);
          return [];
        }

        // Transform data to match expected format
        return (data || []).map((assignment: any, index: number) => ({
          id: assignment.id,
          goalId: assignment.goal_id,
          versionNumber: index + 1,
          changedBy: assignment.employee?.profiles 
            ? `${assignment.employee.profiles.first_name} ${assignment.employee.profiles.last_name}`
            : 'Unknown',
          changedAt: assignment.assigned_at,
          changeType: 'update' as const,
          changeSummary: 'Goal assignment recorded',
          data: assignment,
        }));
      } catch (error) {
        console.error('Unexpected error in useGoalVersions:', error);
        return [];
      }
    },
  });

  return {
    versions: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: () => {
      void query.refetch();
    },
  };
}
