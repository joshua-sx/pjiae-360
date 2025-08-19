import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useReportFilters() {
  const cycles = useQuery({
    queryKey: ['cycles'],
    queryFn: async () => {
      const { data } = await supabase
        .from('appraisal_cycles')
        .select('id, name, status')
        .order('created_at', { ascending: false });
      return data || [];
    }
  });

  const divisions = useQuery({
    queryKey: ['divisions'],
    queryFn: async () => {
      const { data } = await supabase
        .from('divisions')
        .select('id, name')
        .order('name');
      return data || [];
    }
  });

  return {
    cycles: cycles.data || [],
    divisions: divisions.data || [],
    isLoading: cycles.isLoading || divisions.isLoading
  };
}