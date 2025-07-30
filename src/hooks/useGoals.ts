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
  refetch: () => void;
}

export function useGoals(filters: UseGoalsOptions = {}): UseGoalsResult {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { roles, loading: permissionsLoading, isAdmin, isDirector, isManager, isEmployee } = usePermissions();
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

      // Simplified query for now - organization scoping is handled by RLS
      let query = supabase
        .from('goals')
        .select('*');

      // Apply additional filters
      if (filters.status && filters.status !== 'All') {
        query = query.eq('status', filters.status);
      }

      // Note: employeeId filtering will be added when we implement goal assignments properly

      if (filters.year && filters.year !== 'All') {
        query = query.gte('start_date', `${filters.year}-01-01`)
                   .lt('start_date', `${parseInt(filters.year) + 1}-01-01`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our Goal interface
      const transformedGoals: Goal[] = (data || []).map(goal => {
        return {
          id: goal.id,
          title: goal.title,
          employeeId: '',
          employeeName: 'Unassigned',
          status: goal.status,
          cycle: 'Current',
          dueDate: goal.due_date,
          description: goal.description,
          type: goal.type,
          weight: 100,
          year: new Date(goal.start_date || goal.created_at).getFullYear().toString(),
          progress: goal.progress,
          createdAt: goal.created_at,
          updatedAt: goal.updated_at,
        };
      });

      setGoals(transformedGoals);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  }, [filters, permissionsLoading, roles.join(','), isAdmin, isDirector, isManager, isEmployee]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return {
    goals,
    loading,
    error,
    refetch: fetchGoals,
  };
}