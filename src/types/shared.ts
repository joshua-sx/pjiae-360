// Shared type definitions used across the application

export type AppRole = 'admin' | 'director' | 'manager' | 'supervisor' | 'employee';

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface Division {
  id: string;
  name: string;
  department_id: string;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  user_id: string;
  organization_id: string;
  department_id?: string;
  division_id?: string;
  manager_id?: string;
  role: AppRole;
  employee_number?: string;
  hire_date?: string;
  job_title?: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
  
  // Joined data from related tables
  user?: User;
  department?: Department;
  division?: Division;
  manager?: Employee;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  type: 'individual' | 'team' | 'organizational';
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  progress: number;
  start_date: string;
  due_date: string;
  created_by: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  creator?: Employee;
  assignees?: GoalAssignment[];
}

export interface GoalAssignment {
  id: string;
  goal_id: string;
  employee_id: string;
  assigned_by: string;
  assigned_at: string;
  
  // Joined data
  employee?: Employee;
  goal?: Goal;
}

export interface Appraisal {
  id: string;
  employee_id: string;
  appraiser_id: string;
  cycle_id: string;
  status: 'draft' | 'in_progress' | 'completed' | 'approved';
  self_assessment_completed: boolean;
  manager_review_completed: boolean;
  final_rating?: number;
  overall_feedback?: string;
  development_goals?: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  employee?: Employee;
  appraiser?: Employee;
  cycle?: AppraisalCycle;
}

export interface AppraisalCycle {
  id: string;
  name: string;
  organization_id: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'completed';
  description?: string;
  created_at: string;
  updated_at: string;
}

// Form and UI related types
export interface FormData {
  [key: string]: any;
}

export interface TableColumn<T = any> {
  id: string;
  label: string;
  accessor: keyof T;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

// API response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Permission and security types
export interface Permission {
  id: string;
  name: string;
  description?: string;
}

export interface RolePermission {
  role: AppRole;
  permissions: string[];
}

// Onboarding types
export interface OnboardingData {
  organizationDetails?: {
    name: string;
    logo?: File;
  };
  structure?: {
    departments: Department[];
    divisions: Division[];
  };
  people?: {
    employees: Partial<Employee>[];
    administrators: string[];
  };
  appraisalSettings?: {
    frequency: string;
    startDate: string;
    competencies: string[];
    notifications: boolean;
  };
}

export interface OnboardingMilestone {
  id: string;
  title: string;
  description: string;
  component: string;
  isRequired: boolean;
  isCompleted: boolean;
  order: number;
}