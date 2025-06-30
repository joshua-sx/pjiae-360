
import { Goal, DivisionGoal, Employee, Team } from './types';

export const defaultDivisionGoal: DivisionGoal = {
  title: "2025 Division Goal",
  description: "Increase customer satisfaction scores by 25% through improved service delivery and enhanced product quality initiatives across all departments.",
  director: "Sarah Johnson",
  directorTitle: "Division Director",
  progress: 68,
  status: "In Progress",
  helperText: "Q1 milestone achieved. On track for Q2 deliverables."
};

export const defaultGoals: Goal[] = [
  {
    id: "1",
    title: "Implement Customer Feedback System",
    employee: "Alex Chen",
    dueDate: "2025-03-15",
    progress: 85,
    status: "In Progress",
    description: "Deploy comprehensive feedback collection and analysis system"
  },
  {
    id: "2",
    title: "Team Leadership Training Program",
    employee: "Maria Rodriguez",
    dueDate: "2025-02-28",
    progress: 100,
    status: "Completed",
    description: "Complete advanced leadership certification program"
  },
  {
    id: "3",
    title: "Product Quality Metrics Dashboard",
    employee: "David Kim",
    dueDate: "2025-04-10",
    progress: 45,
    status: "In Progress",
    description: "Build real-time quality monitoring dashboard"
  },
  {
    id: "4",
    title: "Customer Service Response Time",
    employee: "Jennifer Walsh",
    dueDate: "2025-01-30",
    progress: 20,
    status: "At Risk",
    description: "Reduce average response time to under 2 hours"
  },
  {
    id: "5",
    title: "Process Automation Initiative",
    employee: "Michael Brown",
    dueDate: "2025-05-15",
    progress: 0,
    status: "Not Started",
    description: "Automate repetitive manual processes in operations"
  },
  {
    id: "6",
    title: "Employee Satisfaction Survey",
    employee: "Lisa Thompson",
    dueDate: "2025-03-01",
    progress: 75,
    status: "In Progress",
    description: "Conduct quarterly employee satisfaction assessment"
  }
];

export const mockEmployees: Employee[] = [
  {
    id: "1",
    name: "Alex Chen",
    role: "Senior Developer",
    department: "Engineering",
    avatar: undefined
  },
  {
    id: "2",
    name: "Maria Rodriguez",
    role: "Team Lead",
    department: "Operations",
    avatar: undefined
  },
  {
    id: "3",
    name: "David Kim",
    role: "Product Manager",
    department: "Product",
    avatar: undefined
  },
  {
    id: "4",
    name: "Jennifer Walsh",
    role: "Customer Success",
    department: "Support",
    avatar: undefined
  },
  {
    id: "5",
    name: "Michael Brown",
    role: "Operations Analyst",
    department: "Operations",
    avatar: undefined
  },
  {
    id: "6",
    name: "Lisa Thompson",
    role: "HR Specialist",
    department: "Human Resources",
    avatar: undefined
  }
];

export const mockTeams: Team[] = [
  {
    id: "1",
    name: "Engineering Team",
    department: "Engineering",
    memberCount: 8
  },
  {
    id: "2",
    name: "Product Team",
    department: "Product",
    memberCount: 5
  },
  {
    id: "3",
    name: "Operations Team",
    department: "Operations",
    memberCount: 6
  },
  {
    id: "4",
    name: "Support Team",
    department: "Support",
    memberCount: 4
  }
];
