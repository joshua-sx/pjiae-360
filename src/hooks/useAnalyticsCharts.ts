import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from 'react-day-picker';

export function useAnalyticsCharts(
  selectedCycle: string, 
  selectedDivision: string, 
  dateRange?: DateRange
) {
  return useQuery({
    queryKey: [
      'analytics-charts', 
      selectedCycle, 
      selectedDivision, 
      dateRange?.from?.toISOString(), 
      dateRange?.to?.toISOString()
    ],
    queryFn: async () => {
      const startISO = dateRange?.from ? new Date(dateRange.from).toISOString() : undefined;
      const endISO = dateRange?.to ? new Date(dateRange.to).toISOString() : undefined;

      // Fetch division performance data
      const { data: divisionData } = await supabase
        .from('divisions')
        .select(`
          id,
          name,
          employee_info(id, status)
        `);

      // Build base query for appraisals
      let appraisalsQuery = supabase
        .from('appraisals')
        .select('status, created_at, cycle_id, employee_info!inner(division_id)')
        .neq('status', 'draft');

      if (selectedDivision !== 'all') {
        appraisalsQuery = appraisalsQuery.eq('employee_info.division_id', selectedDivision);
      }
      if (selectedCycle && selectedCycle !== 'current') {
        appraisalsQuery = appraisalsQuery.eq('cycle_id', selectedCycle);
      }
      if (startISO) appraisalsQuery = appraisalsQuery.gte('created_at', startISO);
      if (endISO) appraisalsQuery = appraisalsQuery.lte('created_at', endISO);

      const { data: appraisalStatusData } = await appraisalsQuery;

      // Goals by status
      let goalsQuery = supabase
        .from('goals')
        .select('id, status, created_at')
        .neq('status', 'draft');

      if (startISO) goalsQuery = goalsQuery.gte('created_at', startISO);
      if (endISO) goalsQuery = goalsQuery.lte('created_at', endISO);

      if (selectedDivision !== 'all') {
        const { data: divisionAssignments } = await supabase
          .from('goal_assignments')
          .select('goal_id, employee_info!inner(division_id)')
          .eq('employee_info.division_id', selectedDivision);
        const goalIds = Array.from(new Set((divisionAssignments || []).map(g => g.goal_id)));
        if (goalIds.length > 0) {
          goalsQuery = goalsQuery.in('id', goalIds as any);
        } else {
          goalsQuery = goalsQuery.in('id', ['00000000-0000-0000-0000-000000000000']);
        }
      }

      const { data: goalsData } = await goalsQuery;

      const divisionStats = (divisionData || []).map(division => ({
        id: division.id,
        name: division.name,
        employees: division.employee_info?.filter((emp: any) => emp.status === 'active').length || 0
      }));

      const statusCounts = (appraisalStatusData || []).reduce((acc: Record<string, number>, appraisal: any) => {
        acc[appraisal.status] = (acc[appraisal.status] || 0) + 1;
        return acc;
      }, {});

      const goalProgress = (goalsData || []).reduce((acc: Record<string, number>, goal: any) => {
        acc[goal.status] = (acc[goal.status] || 0) + 1;
        return acc;
      }, {});

      return {
        divisionStats,
        appraisalStatus: Object.entries(statusCounts).map(([status, count]) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: count
        })),
        goalProgress: Object.entries(goalProgress).map(([status, count]) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: count
        }))
      };
    }
  });
}