import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { generateDemoDivisions } from '@/lib/demoData';

export interface Division {
  id: string;
  name: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export function useDivisions() {
  const { isDemoMode, demoRole } = useDemoMode();

  const query = useQuery({
    queryKey: ['divisions', isDemoMode, demoRole],
    queryFn: async (): Promise<Division[]> => {
      if (isDemoMode) {
        return generateDemoDivisions(demoRole);
      }

      // Get current user's organization
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error('Not authenticated');

      const { data: employeeInfo } = await supabase
        .from('employee_info')
        .select('organization_id')
        .eq('user_id', currentUser.user.id)
        .single();

      if (!employeeInfo) throw new Error('User not found in any organization');

      const { data, error } = await supabase
        .from('divisions')
        .select('*')
        .eq('organization_id', employeeInfo.organization_id)
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  return {
    divisions: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
  };
}