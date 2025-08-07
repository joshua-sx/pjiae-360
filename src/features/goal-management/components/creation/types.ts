import { Employee } from '../types';

export interface GoalData {
  title: string;
  description: string;
  selectedEmployees: Employee[];
  dueDate: Date | undefined;
  priority: string;
}

export interface GoalCreationStep {
  title: string;
  subtitle: string;
  fields: (keyof GoalData)[];
}