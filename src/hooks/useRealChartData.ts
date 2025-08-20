import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { DateRange } from 'react-day-picker';
import {
  generateGoalsTimeSeriesData,
  generateGoalStatusData,
  generateDepartmentGoalsData,
  generateGoalProgressData,
  generateAppraisalTimeSeriesData,
  generatePerformanceRatingsData,
  generateAppraisalDepartmentData,
  generateAppraisalProgressData,
  generateRatingTrendsData,
  type TimeSeriesData,
  type CategoryData,
  type ProgressData,
} from '@/lib/mockChartData';

export interface ChartDataFilters {
  dateRange?: DateRange;
  cycleId?: string;
  divisionId?: string;
}

export function useGoalsTimeSeriesData(filters: ChartDataFilters = {}): TimeSeriesData[] {
  const { isDemoMode } = useDemoMode();

  const { data } = useQuery<TimeSeriesData[]>({
    queryKey: ['goals-time-series', isDemoMode, JSON.stringify(filters)],
    queryFn: async () => {
      if (isDemoMode) {
        return generateGoalsTimeSeriesData();
      }

      const { data, error } = await supabase
        .from('goals')
        .select('created_at')
        .order('created_at');

      if (error) throw error;

      // Group by month and count
      const monthCounts: Record<string, number> = {};
      data.forEach(goal => {
        const month = new Date(goal.created_at).toLocaleDateString('en', { month: 'short' });
        monthCounts[month] = (monthCounts[month] || 0) + 1;
      });

      return Object.entries(monthCounts).map(([date, value]) => ({
        date,
        value,
      }));
    },
  });

  return data || [];
}

export function useGoalStatusData(filters: ChartDataFilters = {}): CategoryData[] {
  const { isDemoMode } = useDemoMode();

  const { data } = useQuery<CategoryData[]>({
    queryKey: ['goal-status', isDemoMode, JSON.stringify(filters)],
    queryFn: async () => {
      if (isDemoMode) {
        return generateGoalStatusData();
      }

      const { data, error } = await supabase
        .from('goals')
        .select('status, created_at')
        .order('status');

      if (error) throw error;

      const statusCounts: Record<string, number> = {};
      data.forEach(goal => {
        statusCounts[goal.status] = (statusCounts[goal.status] || 0) + 1;
      });

      return Object.entries(statusCounts).map(([name, value]) => ({
        name: name === 'draft' ? 'On Track' : name === 'in_progress' ? 'At Risk' : 'Overdue',
        value,
        color: name === 'draft' ? 'hsl(var(--chart-2))' : name === 'in_progress' ? 'hsl(var(--chart-3))' : 'hsl(var(--chart-4))',
      }));
    },
  });

  return data || [];
}

export function useDepartmentGoalsData(filters: ChartDataFilters = {}): CategoryData[] {
  const { isDemoMode } = useDemoMode();

  const { data } = useQuery<CategoryData[]>({
    queryKey: ['department-goals', isDemoMode, JSON.stringify(filters)],
    queryFn: async () => {
      if (isDemoMode) {
        return generateDepartmentGoalsData();
      }

      let query = supabase
        .from('employee_info')
        .select(`
          id,
          departments(name),
          goal_assignments(id)
        `);

      // Add division filter if provided
      if (filters.divisionId) {
        query = query.eq('division_id', filters.divisionId);
      }

      const { data: employees, error } = await query;

      if (error) throw error;

      const departmentCounts: Record<string, number> = {};
      employees.forEach(employee => {
        const deptName = (employee.departments as any)?.name || 'Unassigned';
        const goalCount = ((employee as any).goal_assignments || []).length;
        departmentCounts[deptName] = (departmentCounts[deptName] || 0) + goalCount;
      });

      return Object.entries(departmentCounts).map(([name, value], index) => ({
        name,
        value,
        color: `hsl(var(--chart-${(index % 6) + 1}))`,
      }));
    },
  });

  return data || [];
}

export function useAppraisalTimeSeriesData(filters: ChartDataFilters = {}): TimeSeriesData[] {
  const { isDemoMode } = useDemoMode();

  const { data } = useQuery<TimeSeriesData[]>({
    queryKey: ['appraisal-time-series', isDemoMode, JSON.stringify(filters)],
    queryFn: async () => {
      if (isDemoMode) {
        return generateAppraisalTimeSeriesData();
      }

      let query = supabase
        .from('appraisals')
        .select('created_at, employee_info!inner(division_id)')
        .order('created_at');

      // Add division filter if provided
      if (filters.divisionId) {
        query = query.eq('employee_info.division_id', filters.divisionId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const monthCounts: Record<string, number> = {};
      data.forEach(appraisal => {
        const month = new Date(appraisal.created_at).toLocaleDateString('en', { month: 'short' });
        monthCounts[month] = (monthCounts[month] || 0) + 1;
      });

      return Object.entries(monthCounts).map(([date, value]) => ({
        date,
        value,
      }));
    },
  });

  return data || [];
}

export function usePerformanceRatingsData(filters: ChartDataFilters = {}): CategoryData[] {
  const { isDemoMode } = useDemoMode();

  const { data } = useQuery<CategoryData[]>({
    queryKey: ['performance-ratings', isDemoMode, JSON.stringify(filters)],
    queryFn: async () => {
      if (isDemoMode) {
        return generatePerformanceRatingsData();
      }

      let query = supabase
        .from('appraisals')
        .select('final_rating, created_at, employee_info!inner(division_id)')
        .not('final_rating', 'is', null);

      // Add division filter if provided
      if (filters.divisionId) {
        query = query.eq('employee_info.division_id', filters.divisionId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const ratingCounts: Record<string, number> = {};
      data.forEach(appraisal => {
        const rating = appraisal.final_rating;
        if (rating >= 4) ratingCounts['Exceeds Expectations'] = (ratingCounts['Exceeds Expectations'] || 0) + 1;
        else if (rating >= 3) ratingCounts['Meets Expectations'] = (ratingCounts['Meets Expectations'] || 0) + 1;
        else if (rating >= 2) ratingCounts['Below Expectations'] = (ratingCounts['Below Expectations'] || 0) + 1;
        else ratingCounts['Needs Improvement'] = (ratingCounts['Needs Improvement'] || 0) + 1;
      });

      return Object.entries(ratingCounts).map(([name, value], index) => ({
        name,
        value,
        color: `hsl(var(--chart-${index + 1}))`,
      }));
    },
  });

  return data || [];
}

export function useAppraisalDepartmentData(filters: ChartDataFilters = {}): CategoryData[] {
  const { isDemoMode } = useDemoMode();

  const { data } = useQuery<CategoryData[]>({
    queryKey: ['appraisal-department', isDemoMode, JSON.stringify(filters)],
    queryFn: async () => {
      if (isDemoMode) {
        return generateAppraisalDepartmentData();
      }

      let query = supabase
        .from('appraisals')
        .select(`
          id,
          employee_info!inner(
            department_id,
            departments(name),
            division_id
          )
        `);

      // Add division filter if provided
      if (filters.divisionId) {
        query = query.eq('employee_info.division_id', filters.divisionId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const departmentCounts: Record<string, number> = {};
      data.forEach(appraisal => {
        const deptName = appraisal.employee_info.departments?.name || 'Unassigned';
        departmentCounts[deptName] = (departmentCounts[deptName] || 0) + 1;
      });

      return Object.entries(departmentCounts).map(([name, value], index) => ({
        name,
        value,
        color: `hsl(var(--chart-${(index % 6) + 1}))`,
      }));
    },
  });

  return data || [];
}

export function useRatingTrendsData(filters: ChartDataFilters = {}): TimeSeriesData[] {
  const { isDemoMode } = useDemoMode();

  const { data } = useQuery<TimeSeriesData[]>({
    queryKey: ['rating-trends', isDemoMode, JSON.stringify(filters)],
    queryFn: async () => {
      if (isDemoMode) {
        return generateRatingTrendsData();
      }

      let query = supabase
        .from('appraisals')
        .select('final_rating, created_at, employee_info!inner(division_id)')
        .not('final_rating', 'is', null)
        .order('created_at');

      // Add division filter if provided
      if (filters.divisionId) {
        query = query.eq('employee_info.division_id', filters.divisionId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const monthlyRatings: Record<string, number[]> = {};
      data.forEach(appraisal => {
        const month = new Date(appraisal.created_at).toLocaleDateString('en', { month: 'short' });
        if (!monthlyRatings[month]) monthlyRatings[month] = [];
        monthlyRatings[month].push(appraisal.final_rating);
      });

      return Object.entries(monthlyRatings).map(([date, ratings]) => ({
        date,
        value: ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length,
      }));
    },
  });

  return data || [];
}