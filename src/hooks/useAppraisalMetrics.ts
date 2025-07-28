import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { generateDemoAppraisalMetrics } from '@/lib/demoData';

interface AppraisalMetrics {
  totalAppraisals: number;
  completed: number;
  inProgress: number;
  overdue: number;
  completionRate: string;
}

export function useAppraisalMetrics() {
  const { isDemoMode, demoRole } = useDemoMode();

  return useQuery({
    queryKey: ['appraisal-metrics', isDemoMode, demoRole],
    queryFn: async (): Promise<AppraisalMetrics> => {
      if (isDemoMode) {
        return generateDemoAppraisalMetrics(demoRole);
      }

      // Fetch real data from database
      const [
        { count: totalAppraisals },
        { count: completed },
        { count: inProgress },
        { count: draft }
      ] = await Promise.all([
        supabase.from('appraisals').select('*', { count: 'exact', head: true }),
        supabase.from('appraisals').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('appraisals').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
        supabase.from('appraisals').select('*', { count: 'exact', head: true }).eq('status', 'draft')
      ]);

      const total = totalAppraisals || 0;
      const completedCount = completed || 0;
      const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;

      return {
        totalAppraisals: total,
        completed: completedCount,
        inProgress: inProgress || 0,
        overdue: draft || 0, // Using draft as overdue for now
        completionRate: `${completionRate}% completion rate`
      };
    },
    enabled: true
  });
}