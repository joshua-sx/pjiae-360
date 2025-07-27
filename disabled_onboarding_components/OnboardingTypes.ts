
export interface OnboardingData {
  orgName: string;
  logo: File | null;
  entryMethod: 'csv' | 'manual' | null;
  adminInfo: {
    name: string;
    email: string;
    role: string;
  };
  csvData: {
    rawData: string;
    headers: string[];
    rows: any[][];
    columnMapping: Record<string, string>;
  };
  people: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    jobTitle: string;
    department: string;
    division: string;
    employeeId?: number;
    role?: string;
    errors?: string[];
  }>;
  orgStructure: Array<{
    id: string;
    name: string;
    type: 'division' | 'department' | 'custom';
    parent?: string;
    children?: string[];
    rank?: number;
    description?: string;
  }>;
  roles: {
    directors: string[];
    managers: string[];
    supervisors: string[];
    employees: string[];
  };
  reviewCycle: {
    frequency: 'quarterly' | 'biannual' | 'annual';
    startDate: string;
    visibility: boolean;
  };
  appraisalCycle?: {
    frequency: "annual" | "bi-annual";
    cycleName: string;
    startDate: string;
    goalSettingWindows: Array<{
      id: string;
      name: string;
      startDate: Date;
      endDate: Date;
    }>;
    reviewPeriods: Array<{
      id: string;
      name: string;
      startDate: Date;
      endDate: Date;
      goalWindowId: string;
    }>;
    competencyCriteria: {
      enabled: boolean;
      model: string;
      customCriteria: string[];
      scoringSystem: string;
      competencies?: Array<{
        name: string;
        description: string;
        optional?: boolean;
        applicable?: boolean;
      }>;
    };
    notifications: {
      enabled: boolean;
      email: boolean;
      emailAddress: string;
      reminders: boolean;
      deadlines: boolean;
    };
  };
  importStats: {
    total: number;
    successful: number;
    errors: number;
  };
}

export interface OnboardingStepProps {
  data: OnboardingData;
  onDataChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkipTo?: (stepIndex: number) => void;
  isLoading?: boolean;
}
