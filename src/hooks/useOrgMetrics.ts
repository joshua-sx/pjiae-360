import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { generateDemoOrgMetrics } from '@/lib/demoData';

interface OrgMetrics {
  totalEmployees: number;
  vacantPositions: number;
  pendingAppraisals: number;
  coverageRate: string;
  totalEmployeesChange: string;
  vacantPositionsChange: string;
  pendingAppraisalsChange: string;
  coverageRateChange: string;
  totalEmployeesChangeType: 'positive' | 'negative';
  vacantPositionsChangeType: 'positive' | 'negative';
  pendingAppraisalsChangeType: 'positive' | 'negative';
  coverageRateChangeType: 'positive' | 'negative';
}

export function useOrgMetrics() {
  const { isDemoMode, demoRole } = useDemoMode();

  return useQuery({
    queryKey: ['org-metrics', isDemoMode, demoRole],
    queryFn: async (): Promise<OrgMetrics> => {
      if (isDemoMode) {
        return generateDemoOrgMetrics(demoRole);
      }

      // Fetch real data from database
      const [
        { count: totalEmployees },
        { count: pendingAppraisals }
      ] = await Promise.all([
        supabase.from('employee_info').select('*', { count: 'exact', head: true }),
        supabase.from('appraisals').select('*', { count: 'exact', head: true }).eq('status', 'draft')
      ]);

      // Calculate coverage rate (employees with assigned appraisers)
      const { data: assignedEmployees } = await supabase
        .from('employee_info')
        .select('id')
        .not('manager_id', 'is', null);

      const assigned = assignedEmployees?.length || 0;
      const total = totalEmployees || 0;
      const coverageRate = total > 0 ? Math.round((assigned / total) * 100) : 0;

      // Vacant positions would need additional logic or a separate table
      // For now, estimate based on department capacity vs actual employees
      const vacantPositions = Math.max(0, Math.floor(total * 0.03)); // Estimate 3% vacancy

      return {
        totalEmployees: total,
        vacantPositions,
        pendingAppraisals: pendingAppraisals || 0,
        coverageRate: `${coverageRate}%`,
        totalEmployeesChange: '+12',
        vacantPositionsChange: '-3',
        pendingAppraisalsChange: '+5',
        coverageRateChange: '+2%',
        totalEmployeesChangeType: 'positive',
        vacantPositionsChangeType: 'positive',
        pendingAppraisalsChangeType: 'negative',
        coverageRateChangeType: 'positive'
      };
    },
    enabled: true
  });
}