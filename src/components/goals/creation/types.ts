import { Employee } from '../types';

export interface GoalData {
  title: string;
  description: string;
  assignee: string;
  selectedEmployee: Employee | null;
  dueDate: Date | undefined;
  priority: string;
  type: 'individual' | 'team';
}

export interface GoalCreationStep {
  title: string;
  subtitle: string;
  fields: (keyof GoalData)[];
}