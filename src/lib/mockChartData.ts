// Mock data generators for analytics charts
import { AppRole } from '@/hooks/usePermissions';

export interface TimeSeriesData {
  date: string;
  value: number;
  category?: string;
}

export interface CategoryData {
  name: string;
  value: number;
  color?: string;
}

export interface ProgressData {
  month: string;
  completed: number;
  inProgress: number;
  overdue: number;
}

// Generate mock time series data for goals
export function generateGoalsTimeSeriesData(): TimeSeriesData[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month, index) => ({
    date: month,
    value: Math.floor(Math.random() * 20) + 30 + (index * 2),
  }));
}

// Generate mock goal status distribution
export function generateGoalStatusData(): CategoryData[] {
  return [
    { name: 'On Track', value: 68, color: 'hsl(var(--chart-2))' },
    { name: 'At Risk', value: 22, color: 'hsl(var(--chart-3))' },
    { name: 'Overdue', value: 10, color: 'hsl(var(--chart-4))' },
  ];
}

// Generate mock department goals data
export function generateDepartmentGoalsData(): CategoryData[] {
  return [
    { name: 'Operations', value: 24, color: 'hsl(var(--chart-1))' },
    { name: 'Finance', value: 18, color: 'hsl(var(--chart-2))' },
    { name: 'Security', value: 15, color: 'hsl(var(--chart-3))' },
    { name: 'HR', value: 12, color: 'hsl(var(--chart-5))' },
    { name: 'IT', value: 10, color: 'hsl(var(--chart-6))' },
  ];
}

// Generate mock goal progress over time
export function generateGoalProgressData(): ProgressData[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month) => ({
    month,
    completed: Math.floor(Math.random() * 15) + 10,
    inProgress: Math.floor(Math.random() * 10) + 5,
    overdue: Math.floor(Math.random() * 5) + 2,
  }));
}

// Generate mock appraisal completion trends
export function generateAppraisalTimeSeriesData(): TimeSeriesData[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month, index) => ({
    date: month,
    value: Math.floor(Math.random() * 15) + 25 + (index * 3),
  }));
}

// Generate mock performance ratings distribution
export function generatePerformanceRatingsData(): CategoryData[] {
  return [
    { name: 'Exceeds Expectations', value: 15, color: 'hsl(var(--chart-1))' },
    { name: 'Meets Expectations', value: 45, color: 'hsl(var(--chart-2))' },
    { name: 'Below Expectations', value: 8, color: 'hsl(var(--chart-3))' },
    { name: 'Needs Improvement', value: 2, color: 'hsl(var(--chart-4))' },
  ];
}

// Generate mock appraisals by department
export function generateAppraisalDepartmentData(): CategoryData[] {
  return [
    { name: 'Operations', value: 32, color: 'hsl(var(--chart-1))' },
    { name: 'Finance', value: 28, color: 'hsl(var(--chart-2))' },
    { name: 'Security', value: 24, color: 'hsl(var(--chart-3))' },
    { name: 'HR', value: 20, color: 'hsl(var(--chart-5))' },
    { name: 'IT', value: 16, color: 'hsl(var(--chart-6))' },
  ];
}

// Generate mock appraisal progress over time
export function generateAppraisalProgressData(): ProgressData[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month) => ({
    month,
    completed: Math.floor(Math.random() * 20) + 15,
    inProgress: Math.floor(Math.random() * 8) + 3,
    overdue: Math.floor(Math.random() * 3) + 1,
  }));
}

// Generate mock rating trends over time
export function generateRatingTrendsData(): TimeSeriesData[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month) => ({
    date: month,
    value: Math.random() * 0.5 + 3.8, // Random rating between 3.8 and 4.3
  }));
}