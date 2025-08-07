// Public API for analytics feature
export { default as CalendarPage } from './pages/CalendarPage';
export { AppraisalEventCalendar } from './components/AppraisalEventCalendar';
export { AppraisalDateRangePicker } from './components/AppraisalDateRangePicker';

// Chart hooks
export { 
  useGoalsTimeSeriesData,
  useGoalStatusData,
  useDepartmentGoalsData,
  useAppraisalTimeSeriesData,
  usePerformanceRatingsData,
  useAppraisalDepartmentData,
  useRatingTrendsData
} from './hooks/useRealChartData';

// Types
export type { TimeSeriesData, CategoryData } from './types';