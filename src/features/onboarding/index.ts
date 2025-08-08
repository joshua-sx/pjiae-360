// Public API for onboarding feature
// Re-export from goal-management since MagicPath is part of goal creation
export { MagicPathGoalCreator } from '@/features/goal-management';
export { CreateGoalPage } from '@/features/goal-management';

// Types - placeholder
export interface MagicPathGoalData {
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}