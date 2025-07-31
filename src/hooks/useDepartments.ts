import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { generateDemoDepartments } from '@/lib/demoData';

export interface Department {
  id: string;
  name: string;
  division_id?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export function useDepartments() {
  const { isDemoMode, demoRole } = useDemoMode();

  const query = useQuery({
    queryKey: ['departments', isDemoMode, demoRole],
    queryFn: async (): Promise<Department[]> => {
      if (isDemoMode) {
        return generateDemoDepartments(demoRole);
      }

      const { data, error } = await supabase.from('departments').select('*').order('name');
      if (error) throw error;
      return data || [];
    },
  });

  return {
    departments: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
  };
}