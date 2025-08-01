import { useQuery } from '@tanstack/react-query';
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

export function useGoals(filters: UseGoalsOptions = {}) {
  const { roles, loading: permissionsLoading } = usePermissions();
  const { isDemoMode, demoRole } = useDemoMode();
  const query = useQuery({
    queryKey: ['goals', filters, roles],
    enabled: !permissionsLoading || isDemoMode,
    queryFn: async (): Promise<Goal[]> => {
      if (isDemoMode) {
        return generateDemoGoals(demoRole);
      }

      // Simplified query for now - organization scoping is handled by RLS
      let query = supabase.from('goals').select('*');

      if (filters.status && filters.status !== 'All') {
        query = query.eq('status', filters.status);
      }

      if (filters.year && filters.year !== 'All') {
        query = query.eq('year', parseInt(filters.year));
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      return (data || []).map(goal => ({
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
        year: goal.year ? goal.year.toString() : new Date(goal.start_date || goal.created_at).getFullYear().toString(),
        progress: goal.progress,
        createdAt: goal.created_at,
        updatedAt: goal.updated_at,
      }));
    },
  });

  return {
    goals: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: () => {
      void query.refetch();
    },
  };
}