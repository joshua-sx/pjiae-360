import { lazy } from 'react';

// Lazy load role-based components
export const LazyPersonalGoalsPage = lazy(() => import('./personal/PersonalGoalsPage'));
export const LazyPersonalAppraisalsPage = lazy(() => import('./personal/PersonalAppraisalsPage'));
export const LazyTeamGoalsPage = lazy(() => import('@/features/goal-management/pages/TeamGoalsPage'));
export const LazyTeamAppraisalsPage = lazy(() => import('./team/TeamAppraisalsPage'));
export const LazyTeamAnalyticsPage = lazy(() => import('./analytics/TeamAnalyticsPage'));
export const LazyDivisionAnalyticsPage = lazy(() => import('./analytics/DivisionAnalyticsPage'));