export interface Goal {
  id: string;
  title: string;
  employeeName: string;
  status: string;
  dueDate: string;
  progress: number;
  description?: string;
  priority?: string;
  department?: string;
}