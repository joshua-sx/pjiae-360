
export interface ImportRequest {
  organizationId: string; // Changed: now required UUID instead of orgName
  people: Array<{
    firstName: string;
    lastName: string;
    email: string;
    jobTitle?: string;
    department?: string;
    division?: string;
    role?: string;
    employeeId?: string; // Added: for employee ID/number
    phoneNumber?: string; // Added: for phone number
  }>;
  adminInfo: {
    name: string;
    email: string;
    role: string;
  };
}

export interface ImportResult {
  success: boolean;
  message: string;
  imported: number;
  failed: number;
  errors: Array<{
    email: string;
    error: string;
  }>;
  organizationId: string;
  successDetails: Array<{
    email: string;
    userId: string;
    employeeInfoId: string;
  }>;
}

export interface SecurityContext {
  userId: string;
  clientIP: string;
  startTime: number;
}

export interface DatabaseContext {
  organizationId: string;
  divisionMap: Record<string, string>;
  departmentMap: Record<string, string>;
}
