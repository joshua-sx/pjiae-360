
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
        // Use rpc to call the get_goal_versions function with proper error handling
        const { data, error } = await supabase.rpc('get_goal_versions', {
          _goal_id: goalId
        });

        if (error) {
          console.error('Error fetching goal versions:', error);
          
          // If the function doesn't exist yet, fall back to a direct query
          // This provides graceful degradation while the function is being deployed
          const { data: fallbackData, error: fallbackError } = await supabase
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

          if (fallbackError) {
            console.error('Fallback query also failed:', fallbackError);
            return [];
          }

          // Transform fallback data to match expected format
          return (fallbackData || []).map((assignment: any, index: number) => ({
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
        }

        // Ensure data is an array and map it properly
        if (!Array.isArray(data)) {
          console.warn('Expected array from get_goal_versions, got:', typeof data);
          return [];
        }

        return data.map((row: any) => ({
          id: row.id,
          goalId: row.goal_id,
          versionNumber: row.version_number,
          changedBy: row.changed_by,
          changedAt: row.changed_at,
          changeType: row.change_type as 'create' | 'update' | 'delete',
          changeSummary: row.change_summary,
          data: row.data,
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
