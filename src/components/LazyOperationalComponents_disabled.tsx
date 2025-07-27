import { lazy } from 'react';

// Lazy load operational components used by managers, supervisors, and employees
export const LazyGoalsPage = lazy(() => import('./GoalsPage'));
export const LazyAppraisalsPage = lazy(() => import('./AppraisalsPage'));
export const LazyCalendarPage = lazy(() => import('./CalendarPage'));
export const LazyNewAppraisalPage = lazy(() => import('./NewAppraisalPage'));
export const LazyCreateGoalPage = lazy(() => import('./CreateGoalPage'));