import { useState, useEffect } from 'react';
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
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isDemoMode, demoRole } = useDemoMode();

  useEffect(() => {
    const fetchDivisions = async () => {
      if (isDemoMode) {
        setDivisions(generateDemoDivisions(demoRole));
        setLoading(false);
        return;
      }

      try {
        setError(null);
        setLoading(true);

        const { data, error } = await supabase
          .from('divisions')
          .select('*')
          .order('name');

        if (error) throw error;
        setDivisions(data || []);
      } catch (err) {
        console.error('Error fetching divisions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch divisions');
      } finally {
        setLoading(false);
      }
    };

    fetchDivisions();
  }, [isDemoMode, demoRole]);

  return { divisions, loading, error };
}