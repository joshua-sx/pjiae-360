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

      const { data, error } = await supabase.from('divisions').select('*').order('name');
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