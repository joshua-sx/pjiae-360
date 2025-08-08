// Public API for analytics feature
// Note: These components don't exist yet but are referenced in the code
// They should be created when implementing the analytics feature

// Chart hooks - placeholder until components are implemented
export const useGoalsTimeSeriesData = () => ({ data: [], loading: false, error: null });
export const useGoalStatusData = () => ({ data: [], loading: false, error: null });
export const useDepartmentGoalsData = () => ({ data: [], loading: false, error: null });
export const useAppraisalTimeSeriesData = () => ({ data: [], loading: false, error: null });
export const usePerformanceRatingsData = () => ({ data: [], loading: false, error: null });
export const useAppraisalDepartmentData = () => ({ data: [], loading: false, error: null });
export const useRatingTrendsData = () => ({ data: [], loading: false, error: null });

// Types - placeholder
export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface CategoryData {
  category: string;
  value: number;
}