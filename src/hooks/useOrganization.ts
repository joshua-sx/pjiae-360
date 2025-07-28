import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { generateDemoOrganization } from '@/lib/demoData';

export interface Organization {
  id: string;
  name: string;
  logo_url?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useOrganization() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isDemoMode } = useDemoMode();

  useEffect(() => {
    const fetchOrganization = async () => {
      if (isDemoMode) {
        setOrganization(generateDemoOrganization());
        setLoading(false);
        return;
      }

      try {
        setError(null);
        setLoading(true);

        const { data, error } = await supabase
          .from('organizations')
          .select('*')
          .single();

        if (error) throw error;
        setOrganization(data);
      } catch (err) {
        console.error('Error fetching organization:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch organization');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [isDemoMode]);

  return { organization, loading, error };
}