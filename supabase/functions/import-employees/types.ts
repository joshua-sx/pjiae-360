
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
  }>;
  adminInfo: {
    name: string;
    email: string;
    role: string;
  };
}

export interface ImportResult {
  success: boolean;
  message?: string;
  stats?: {
    total: number;
    successful: number;
    failed: number;
  };
  errors?: Array<{
    email: string;
    error: string;
  }>;
}

export interface DatabaseContext {
  organizationId: string;
  divisionMap: Record<string, string>;
  departmentMap: Record<string, string>;
}
