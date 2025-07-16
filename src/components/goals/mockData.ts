
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
    employeeName: "Alex Chen",
    employeeId: "1",
    dueDate: "2025-03-15",
    status: "active",
    type: "performance",
    weight: 100,
    year: "2025",
    description: "Deploy comprehensive feedback collection and analysis system"
  },
  {
    id: "2",
    title: "Team Leadership Training Program",
    employeeName: "Maria Rodriguez",
    employeeId: "2",
    dueDate: "2025-02-28",
    status: "completed",
    type: "development",
    weight: 100,
    year: "2025",
    description: "Complete advanced leadership certification program"
  },
  {
    id: "3",
    title: "Product Quality Metrics Dashboard",
    employeeName: "David Kim",
    employeeId: "3",
    dueDate: "2025-04-10",
    status: "active",
    type: "performance",
    weight: 100,
    year: "2025",
    description: "Build real-time quality monitoring dashboard"
  },
  {
    id: "4",
    title: "Customer Service Response Time",
    employeeName: "Jennifer Walsh",
    employeeId: "4",
    dueDate: "2025-01-30",
    status: "active",
    type: "performance",
    weight: 100,
    year: "2025",
    description: "Reduce average response time to under 2 hours"
  },
  {
    id: "5",
    title: "Process Automation Initiative",
    employeeName: "Michael Brown",
    employeeId: "5",
    dueDate: "2025-05-15",
    status: "draft",
    type: "strategic",
    weight: 100,
    year: "2025",
    description: "Automate repetitive manual processes in operations"
  },
  {
    id: "6",
    title: "Employee Satisfaction Survey",
    employeeName: "Lisa Thompson",
    employeeId: "6",
    dueDate: "2025-03-01",
    status: "active",
    type: "organizational",
    weight: 100,
    year: "2025",
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
