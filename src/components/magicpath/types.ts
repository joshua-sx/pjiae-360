
export interface MagicPathEmployee {
  id: string;
  name: string;
  role: string;
  department?: string;
  avatar?: string;
}

export interface MagicPathGoalData {
  selectedEmployees: MagicPathEmployee[];
  goalName: string;
  description: string;
  startDate: string;
  endDate: string;
  priority: 'Low' | 'Medium' | 'High';
  metrics: string[];
  weight: number;
  alignmentScore: number;
}

export interface MagicPathGoalCreatorProps {
  onComplete?: () => void;
}
