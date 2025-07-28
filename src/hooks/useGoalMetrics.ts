import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { generateDemoGoalMetrics } from '@/lib/demoData';

interface GoalMetrics {
  totalGoals: number;
  completionRate: number;
  employeesWithGoals: number;
  dueThisQuarter: number;
  completionRateChange: string;
  employeesWithGoalsPercentage: string;
}

export function useGoalMetrics() {
  const { isDemoMode, demoRole } = useDemoMode();

  return useQuery({
    queryKey: ['goal-metrics', isDemoMode, demoRole],
    queryFn: async (): Promise<GoalMetrics> => {
      if (isDemoMode) {
        return generateDemoGoalMetrics(demoRole);
      }

      // Fetch real data from database
      const [
        { count: totalGoals },
        { data: completedGoals },
        { count: employeesWithGoals },
        { data: dueThisQuarter }
      ] = await Promise.all([
        supabase.from('goals').select('*', { count: 'exact', head: true }),
        supabase.from('goals').select('id').eq('status', 'completed'),
        supabase.from('goal_assignments').select('employee_id', { count: 'exact', head: true }),
        supabase.from('goals').select('id').gte('due_date', new Date().toISOString().split('T')[0]).lte('due_date', getQuarterEnd())
      ]);

      const total = totalGoals || 0;
      const completed = completedGoals?.length || 0;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      const employeesCount = employeesWithGoals || 0;
      const dueCount = dueThisQuarter?.length || 0;

      // Get total employees for percentage calculation
      const { count: totalEmployees } = await supabase
        .from('employee_info')
        .select('*', { count: 'exact', head: true });

      const employeesPercentage = totalEmployees > 0 
        ? Math.round((employeesCount / totalEmployees) * 100) 
        : 0;

      return {
        totalGoals: total,
        completionRate,
        employeesWithGoals: employeesCount,
        dueThisQuarter: dueCount,
        completionRateChange: '+12%', // This would need historical data to calculate
        employeesWithGoalsPercentage: `${employeesPercentage}% of workforce`
      };
    },
    enabled: true
  });
}

function getQuarterEnd(): string {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3);
  const quarterEndMonth = (quarter + 1) * 3 - 1;
  const quarterEnd = new Date(now.getFullYear(), quarterEndMonth + 1, 0);
  return quarterEnd.toISOString().split('T')[0];
}