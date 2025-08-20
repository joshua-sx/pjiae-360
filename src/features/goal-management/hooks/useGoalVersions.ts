
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
      // Use rpc or raw query since goal_versions isn't in types yet
      const { data, error } = await supabase.rpc('get_goal_versions', {
        goal_id: goalId
      });

      if (error) {
        console.error('Error fetching goal versions:', error);
        // Fallback to empty array if function doesn't exist yet
        return [];
      }

      return (data || []).map((row: any) => ({
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
