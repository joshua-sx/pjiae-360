// Public API for goal management feature
export { default as GoalsPage } from './pages/GoalsPage';
export { default as CreateGoalPage } from './pages/CreateGoalPage';
export { default as EmployeeGoalsPage } from './pages/EmployeeGoalsPage';
export { default as PersonalGoalsPage } from './pages/PersonalGoalsPage';
export { default as TeamGoalsPage } from './pages/TeamGoalsPage';
export { MagicPathGoalCreator } from './components/MagicPathGoalCreator';

// Hooks
export { useGoals } from './hooks/useGoals';
export { useGoalMetrics } from './hooks/useGoalMetrics';
export { useGoalSettingWindows } from './hooks/useGoalSettingWindows';

// Types
export type { Goal } from './types';

// Manager and Director dashboards - these need to be properly exported
// For now, create placeholder exports to avoid build errors
export const ManagerGoalsDashboard = () => null;
export const DirectorGoalsDashboard = () => null;