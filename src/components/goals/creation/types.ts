export interface GoalData {
  title: string;
  description: string;
  assignee: string;
  dueDate: Date | undefined;
  priority: string;
  type: 'individual' | 'team';
}

export interface GoalCreationStep {
  title: string;
  subtitle: string;
  fields: (keyof GoalData)[];
}