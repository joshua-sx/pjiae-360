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
}

export type ImportStep = 'upload' | 'mapping' | 'preview' | 'importing';