import { lazy } from 'react';

// Lazy load employee-specific components
export const LazyEmployeeGoalsPage = lazy(() => import('@/features/goal-management/pages/EmployeeGoalsPage'));
export const LazyEmployeeAppraisalsPage = lazy(() => import('./employee/EmployeeAppraisalsPage'));
export const LazyEmployeeCalendarPage = lazy(() => import('./employee/EmployeeCalendarPage'));