import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDemoMode } from '@/contexts/DemoModeContext';
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

export function useGoalsTimeSeriesData(): TimeSeriesData[] {
  const { isDemoMode } = useDemoMode();

  const { data } = useQuery({
    queryKey: ['goals-time-series', isDemoMode],
    queryFn: async (): Promise<TimeSeriesData[]> => {
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
    enabled: true,
  });

  return data || [];
}

export function useGoalStatusData(): CategoryData[] {
  const { isDemoMode } = useDemoMode();

  const { data } = useQuery({
    queryKey: ['goal-status', isDemoMode],
    queryFn: async (): Promise<CategoryData[]> => {
      if (isDemoMode) {
        return generateGoalStatusData();
      }

      const { data, error } = await supabase
        .from('goals')
        .select('status')
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
    enabled: true,
  });

  return data || [];
}

export function useDepartmentGoalsData(): CategoryData[] {
  const { isDemoMode } = useDemoMode();

  const { data } = useQuery({
    queryKey: ['department-goals', isDemoMode],
    queryFn: async (): Promise<CategoryData[]> => {
      if (isDemoMode) {
        return generateDepartmentGoalsData();
      }

      const { data, error } = await supabase
        .from('goals')
        .select(`
          id,
          goal_assignments(
            employee_id,
            employee_info(
              department_id,
              departments(name)
            )
          )
        `);

      if (error) throw error;

      const departmentCounts: Record<string, number> = {};
      data.forEach(goal => {
        goal.goal_assignments.forEach(assignment => {
          const deptName = assignment.employee_info.departments?.name || 'Unassigned';
          departmentCounts[deptName] = (departmentCounts[deptName] || 0) + 1;
        });
      });

      return Object.entries(departmentCounts).map(([name, value], index) => ({
        name,
        value,
        color: `hsl(var(--chart-${(index % 6) + 1}))`,
      }));
    },
    enabled: true,
  });

  return data || [];
}

export function useAppraisalTimeSeriesData(): TimeSeriesData[] {
  const { isDemoMode } = useDemoMode();

  const { data } = useQuery({
    queryKey: ['appraisal-time-series', isDemoMode],
    queryFn: async (): Promise<TimeSeriesData[]> => {
      if (isDemoMode) {
        return generateAppraisalTimeSeriesData();
      }

      const { data, error } = await supabase
        .from('appraisals')
        .select('created_at')
        .order('created_at');

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
    enabled: true,
  });

  return data || [];
}

export function usePerformanceRatingsData(): CategoryData[] {
  const { isDemoMode } = useDemoMode();

  const { data } = useQuery({
    queryKey: ['performance-ratings', isDemoMode],
    queryFn: async (): Promise<CategoryData[]> => {
      if (isDemoMode) {
        return generatePerformanceRatingsData();
      }

      const { data, error } = await supabase
        .from('appraisals')
        .select('final_rating')
        .not('final_rating', 'is', null);

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
    enabled: true,
  });

  return data || [];
}

export function useAppraisalDepartmentData(): CategoryData[] {
  const { isDemoMode } = useDemoMode();

  const { data } = useQuery({
    queryKey: ['appraisal-department', isDemoMode],
    queryFn: async (): Promise<CategoryData[]> => {
      if (isDemoMode) {
        return generateAppraisalDepartmentData();
      }

      const { data, error } = await supabase
        .from('appraisals')
        .select(`
          id,
          employee_info!inner(
            department_id,
            departments(name)
          )
        `);

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
    enabled: true,
  });

  return data || [];
}

export function useRatingTrendsData(): TimeSeriesData[] {
  const { isDemoMode } = useDemoMode();

  const { data } = useQuery({
    queryKey: ['rating-trends', isDemoMode],
    queryFn: async (): Promise<TimeSeriesData[]> => {
      if (isDemoMode) {
        return generateRatingTrendsData();
      }

      const { data, error } = await supabase
        .from('appraisals')
        .select('final_rating, created_at')
        .not('final_rating', 'is', null)
        .order('created_at');

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
    enabled: true,
  });

  return data || [];
}