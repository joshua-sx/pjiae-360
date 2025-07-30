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
}

export type ImportStep = 'upload' | 'mapping' | 'preview' | 'role-assignment' | 'importing';