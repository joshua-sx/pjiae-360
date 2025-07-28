import { useState, useEffect } from 'react';
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
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isDemoMode, demoRole } = useDemoMode();

  useEffect(() => {
    const fetchDepartments = async () => {
      if (isDemoMode) {
        setDepartments(generateDemoDepartments(demoRole));
        setLoading(false);
        return;
      }

      try {
        setError(null);
        setLoading(true);

        const { data, error } = await supabase
          .from('departments')
          .select('*')
          .order('name');

        if (error) throw error;
        setDepartments(data || []);
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch departments');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [isDemoMode, demoRole]);

  return { departments, loading, error };
}