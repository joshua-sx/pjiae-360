import { lazy } from 'react';

// Lazy load manager/supervisor-specific components
export const LazyManagerPersonalSection = lazy(() => import('./manager/ManagerPersonalSection'));
export const LazyManagerTeamSection = lazy(() => import('./manager/ManagerTeamSection'));