
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
      // Use rpc to call the get_goal_versions function
      // Cast to any to handle type mismatch until types are regenerated
      const { data, error } = await (supabase as any).rpc('get_goal_versions', {
        _goal_id: goalId
      });

      if (error) {
        console.error('Error fetching goal versions:', error);
        // Fallback to empty array if function doesn't exist yet
        return [];
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
