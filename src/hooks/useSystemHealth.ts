import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { generateDemoSystemHealth } from '@/lib/demoData';

interface SystemHealthMetrics {
  completionRate: string;
  userActivity: string;
  dataQuality: string;
}

export function useSystemHealth() {
  const { isDemoMode, demoRole } = useDemoMode();

  return useQuery({
    queryKey: ['system-health', isDemoMode, demoRole],
    queryFn: async (): Promise<SystemHealthMetrics> => {
      if (isDemoMode) {
        return generateDemoSystemHealth(demoRole);
      }

      // Calculate real system health metrics
      const [
        { count: totalAppraisals },
        { count: completedAppraisals },
        { count: totalEmployees },
        { count: activeEmployees }
      ] = await Promise.all([
        supabase.rpc('get_current_user_org_id').then(async (orgRes) => {
          if (orgRes.error) throw orgRes.error;
          return supabase.from('appraisals').select('*', { count: 'exact', head: true }).eq('organization_id', orgRes.data);
        }).then(res => res),
        supabase.rpc('get_current_user_org_id').then(async (orgRes) => {
          if (orgRes.error) throw orgRes.error;
          return supabase.from('appraisals').select('*', { count: 'exact', head: true }).eq('status', 'completed').eq('organization_id', orgRes.data);
        }).then(res => res),
        supabase.rpc('get_current_user_org_id').then(async (orgRes) => {
          if (orgRes.error) throw orgRes.error;
          return supabase.from('employee_info').select('*', { count: 'exact', head: true }).eq('organization_id', orgRes.data);
        }).then(res => res),
        supabase.rpc('get_current_user_org_id').then(async (orgRes) => {
          if (orgRes.error) throw orgRes.error;
          return supabase.from('employee_info').select('*', { count: 'exact', head: true }).eq('status', 'active').eq('organization_id', orgRes.data);
        }).then(res => res)
      ]);

      const completionRate = totalAppraisals > 0 
        ? Math.round((completedAppraisals / totalAppraisals) * 100) 
        : 0;

      const activityRate = totalEmployees > 0 
        ? Math.round((activeEmployees / totalEmployees) * 100) 
        : 0;

      // Data quality assessment based on profile completeness
      const { data: profiles } = await supabase
        .from('profiles')
        .select('first_name, last_name, email');

      const completeProfiles = profiles?.filter(p => 
        p.first_name && p.last_name && p.email
      ).length || 0;

      const dataQualityRate = profiles?.length > 0 
        ? Math.round((completeProfiles / profiles.length) * 100) 
        : 0;

      let dataQuality = 'Poor';
      if (dataQualityRate >= 90) dataQuality = 'Excellent';
      else if (dataQualityRate >= 75) dataQuality = 'Good';
      else if (dataQualityRate >= 50) dataQuality = 'Fair';

      return {
        completionRate: `${completionRate}%`,
        userActivity: `${activityRate}% active`,
        dataQuality
      };
    },
    enabled: true
  });
}