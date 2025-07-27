
export interface Goal {
  id: string;
  title: string;
  employeeName: string;
  employeeId: string;
  dueDate: string | null;
  status: "draft" | "active" | "completed" | "cancelled";
  description?: string;
  type: string;
  weight: number;
  year: string;
}

export interface DivisionGoal {
  title: string;
  description: string;
  director: string;
  directorTitle: string;
  progress: number;
  status: "Not Started" | "In Progress" | "Completed" | "At Risk";
  helperText: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar?: string;
}

export interface Team {
  id: string;
  name: string;
  department: string;
  memberCount: number;
}

export interface NewGoalData {
  scope: "individual" | "team";
  assignedTo: string;
  assignedToName: string;
  title: string;
  description: string;
  successCriteria: string;
  dueDate: Date | undefined;
  priority: string;
  tags: string[];
}
