import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useReportStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [
        { data: employees },
        { data: goals },
        { data: appraisals },
        { data: completedAppraisals }
      ] = await Promise.all([
        supabase.from('employee_info').select('id').eq('status', 'active'),
        supabase.from('goals').select('id'),
        supabase.from('appraisals').select('id'),
        supabase.from('appraisals').select('id').eq('status', 'completed')
      ]);

      return {
        totalEmployees: employees?.length || 0,
        totalGoals: goals?.length || 0,
        totalAppraisals: appraisals?.length || 0,
        completedAppraisals: completedAppraisals?.length || 0
      };
    }
  });
}