
export interface EmployeeImportData {
  uploadMethod: 'upload' | 'paste' | 'manual' | null;
  csvData: {
    rawData: string;
    headers: string[];
    rows: string[][];
    columnMapping: Record<string, string>;
  };
  uploadedFile: { name: string; size: number } | null;
  manualEmployees: EmployeeData[];
}

export interface EmployeeData {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  jobTitle: string;
  department: string;
  division: string;
  ranking?: string;
  status?: string;
  role?: 'Director' | 'Manager' | 'Supervisor' | 'Employee';
  // Added fields to match database schema
  employeeNumber?: string;
  hireDate?: string;
  startDate?: string;
  probationEndDate?: string;
  employmentType?: string;
  location?: string;
  costCenter?: string;
  managerId?: string;
}

export type ImportStep = 'upload' | 'mapping' | 'preview' | 'role-assignment' | 'importing';

// New interfaces for better type safety with the foreign key relationships
export interface EmployeeProfile {
  id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
}

export interface EmployeeInfo {
  id: string;
  user_id: string | null;
  organization_id: string;
  department_id: string | null;
  division_id: string | null;
  manager_id: string | null;
  job_title: string | null;
  employee_number: string | null;
  phone_number: string | null;
  hire_date: string | null;
  start_date: string | null;
  probation_end_date: string | null;
  employment_type: string | null;
  location: string | null;
  cost_center: string | null;
  status: 'pending' | 'invited' | 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface ImportValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  duplicateEmails: string[];
  invalidManagerReferences: string[];
  missingRequiredFields: string[];
}
