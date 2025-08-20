
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
      const { data, error } = await supabase
        .from('goal_versions')
        .select(`
          id,
          goal_id,
          version_number,
          changed_by,
          changed_at,
          change_type,
          change_summary,
          data
        `)
        .eq('goal_id', goalId)
        .order('version_number', { ascending: false });

      if (error) throw error;

      return (data || []).map(row => ({
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
