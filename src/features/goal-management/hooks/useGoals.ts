
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/features/access-control';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useDemoData } from '@/contexts/DemoDataContext';
import { guardAgainstDemoMode } from '@/lib/demo-mode-guard';

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
  departmentName?: string;
  divisionName?: string;
  alignmentScore?: number;
}

interface UseGoalsOptions {
  status?: string;
  employeeId?: string;
  cycleId?: string;
  year?: string;
  page?: number;
  pageSize?: number;
}

export function useGoals(filters: UseGoalsOptions = {}) {
  const { roles, loading: permissionsLoading } = usePermissions();
  const { isDemoMode } = useDemoMode();
  const { getGoals } = useDemoData();
  
  const query = useQuery({
    queryKey: ['goals', filters, roles, isDemoMode],
    enabled: !permissionsLoading || isDemoMode,
    queryFn: async (): Promise<Goal[]> => {
      if (isDemoMode) {
        return getGoals();
      }

      guardAgainstDemoMode('goals.select');

      const {
        status,
        employeeId,
        cycleId,
        year,
        page = 1,
        pageSize = 20,
      } = filters;

      // Join goal assignments with employees to get assignment details
      let query = supabase
        .from('goal_assignments')
        .select(
          `
            weight,
            progress,
            employee_id,
            goal:goals (
              id,
              title,
              status,
              cycle_id,
              due_date,
              description,
              type,
              year,
              progress,
              weight,
              alignment_score,
              created_at,
              updated_at
            ),
            employee:employee_info!goal_assignments_employee_id_fkey (
              id,
              profiles!employee_info_user_id_fkey ( first_name, last_name ),
              departments ( name ),
              divisions ( name )
            )
          `
        )
        .order('assigned_at', { ascending: false });

      if (status && status !== 'All') {
        query = query.eq('goals.status', status);
      }

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      if (cycleId && cycleId !== 'All') {
        query = query.eq('goals.cycle_id', cycleId);
      }

      if (year && year !== 'All') {
        query = query.eq('goals.year', parseInt(year));
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error } = await query.range(from, to);
      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.goal?.id,
        title: row.goal?.title,
        employeeId: row.employee?.id || '',
        employeeName: row.employee?.profiles
          ? `${row.employee.profiles.first_name} ${row.employee.profiles.last_name}`
          : 'Unassigned',
        status: row.goal?.status,
        cycle: row.goal?.cycle_id ?? 'Current',
        dueDate: row.goal?.due_date,
        description: row.goal?.description,
        type: row.goal?.type,
        // Use assignment weight first, fallback to goal weight
        weight: row.weight ?? row.goal?.weight ?? 0,
        year: row.goal?.year
          ? row.goal.year.toString()
          : new Date(row.goal?.created_at).getFullYear().toString(),
        // Use assignment progress first, fallback to goal progress
        progress: row.progress ?? row.goal?.progress ?? 0,
        createdAt: row.goal?.created_at,
        updatedAt: row.goal?.updated_at,
        departmentName: row.employee?.departments?.name,
        divisionName: row.employee?.divisions?.name,
        alignmentScore: row.goal?.alignment_score ?? 0,
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
