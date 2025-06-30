
import { OnboardingMilestone } from './OnboardingTypes';

export const milestones: OnboardingMilestone[] = [
  {
    id: 'welcome',
    title: 'Welcome & Identity',
    description: 'Set up your organization profile and administrator details',
    icon: '👋',
    estimatedTime: '5 min',
    isOptional: false
  },
  {
    id: 'structure',
    title: 'Structure Organization',
    description: 'Define your organizational structure and divisions',
    icon: '🏢',
    estimatedTime: '10 min',
    isOptional: false
  },
  {
    id: 'people',
    title: 'Add Your People',
    description: 'Import or manually add your team members',
    icon: '👥',
    estimatedTime: '15 min',
    isOptional: false
  },
  {
    id: 'roles',
    title: 'Assign Roles',
    description: 'Define roles and permissions for your team',
    icon: '🎭',
    estimatedTime: '10 min',
    isOptional: false
  },
  {
    id: 'cycles',
    title: 'Review Cycles',
    description: 'Set up your performance review cycles and schedules',
    icon: '🔄',
    estimatedTime: '8 min',
    isOptional: true
  },
  {
    id: 'preview',
    title: 'Preview & Confirm',
    description: 'Review your setup before going live',
    icon: '👀',
    estimatedTime: '5 min',
    isOptional: false
  },
  {
    id: 'success',
    title: 'Success!',
    description: 'Your organization is ready to start using the platform',
    icon: '🎉',
    estimatedTime: '2 min',
    isOptional: false
  }
];
