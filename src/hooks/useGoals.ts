import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from './usePermissions';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { generateDemoGoals } from '@/lib/demoData';

export interface Goal {
  id: string;
  title: string;
  employeeName: string;
  employeeId: string;
  status: string;
  cycle: string;
  dueDate: string;
  description?: string;
  type: string;
  weight?: number;
  year?: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

interface UseGoalsOptions {
  status?: string;
  employeeId?: string;
  cycleId?: string;
  year?: string;
}

interface UseGoalsResult {
  goals: Goal[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useGoals(filters: UseGoalsOptions = {}): UseGoalsResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { roles, loading: permissionsLoading } = usePermissions();
  const { isDemoMode, demoRole } = useDemoMode();
  
  // Return demo data if in demo mode
  if (isDemoMode) {
    return {
      goals: generateDemoGoals(demoRole),
      loading: false,
      error: null,
      refetch: async () => {},
    };
  }

  const fetchGoals = useCallback(async () => {
    if (permissionsLoading) return;

    try {
      setError(null);
      setLoading(true);

      // For now, return empty goals to prevent build errors
      // This needs to be implemented with proper goal assignments table
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  }, [filters, permissionsLoading, roles]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return {
    goals: [],
    loading,
    error,
    refetch: fetchGoals,
  };
}