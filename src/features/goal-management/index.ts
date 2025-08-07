// Public API for goal management feature
export { default as GoalsPage } from './pages/GoalsPage';
export { default as CreateGoalPage } from './pages/CreateGoalPage';
export { default as ManagerGoalsDashboard } from './components/ManagerGoalsDashboard';
export { default as DirectorGoalsDashboard } from './components/DirectorGoalsDashboard';
export { default as EmployeeGoalsPage } from './pages/EmployeeGoalsPage';
export { default as PersonalGoalsPage } from './pages/PersonalGoalsPage';
export { default as TeamGoalsPage } from './pages/TeamGoalsPage';
export { MagicPathGoalCreator } from './components/MagicPathGoalCreator';

// Goal creation components
export { GoalProgressIndicator } from './components/creation/GoalProgressIndicator';
export { GoalBasicsStep } from './components/creation/GoalBasicsStep';
export { GoalAssignmentStep } from './components/creation/GoalAssignmentStep';
export { GoalSchedulingStep } from './components/creation/GoalSchedulingStep';
export { GoalNavigationButtons } from './components/creation/GoalNavigationButtons';

// Hooks
export { useGoals } from './hooks/useGoals';
export { useGoalMetrics } from './hooks/useGoalMetrics';
export { useGoalSettingWindows } from './hooks/useGoalSettingWindows';

// Types
export type { Goal } from './types';
export type { GoalData, GoalCreationStep } from './components/creation/types';