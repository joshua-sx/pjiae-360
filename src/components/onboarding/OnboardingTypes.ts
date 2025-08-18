
export interface OnboardingData {
  orgName: string;
  logo: File | null;
  entryMethod: 'csv' | 'manual' | null;
  
  // UI state for sub-steps
  uiState?: {
    peopleStage?: 'entry' | 'mapping';
    mappingReviewed?: boolean;
  };
  
  // Enhanced org profile
  orgProfile: {
    industry?: string;
    companySize?: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+';
    locale?: string;
    timezone?: string;
    currency?: string;
    workWeek?: {
      monday: boolean;
      tuesday: boolean;
      wednesday: boolean;
      thursday: boolean;
      friday: boolean;
      saturday: boolean;
      sunday: boolean;
    };
    fiscalYearStart?: string;
    publicHolidays?: string[];
  };

  // Enhanced admin info
  adminInfo: {
    name: string;
    email: string;
    role: string;
    jobTitle?: string;
    phoneNumber?: string;
    preferredCommunication?: 'email' | 'phone' | 'sms';
  };
  
  csvData: {
    rawData: string;
    headers: string[];
    rows: any[][];
    columnMapping: Record<string, string>;
  };
  
  // Enhanced people data
  people: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    jobTitle: string;
    department: string;
    division: string;
    employeeNumber?: string;
    phoneNumber?: string;
    section?: string;
    rankLevel?: string;
    employmentType?: 'full_time' | 'part_time' | 'contract' | 'intern';
    location?: string;
    costCenter?: string;
    startDate?: string;
    hireDate?: string;
    managerEmail?: string;
    status?: 'active' | 'pending' | 'inactive';
    employeeId?: number;
    employeeInfoId?: string;
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
  
  // Enhanced appraisal cycle
  appraisalCycle?: {
    frequency: "annual" | "bi-annual";
    cycleName: string;
    startDate: string;
    ratingScale?: {
      name: string;
      type: 'numeric' | 'descriptive';
      minValue?: number;
      maxValue?: number;
      scalePoints: Array<{
        value: number | string;
        label: string;
        description?: string;
      }>;
    };
    goalWeightPercentage?: number;
    competencyWeightPercentage?: number;
    calibrationWindowDays?: number;
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

  // Enhanced notifications
  notificationSettings?: {
    fromEmail?: string;
    fromName?: string;
    defaultReminderDays?: number;
    escalationDays?: number;
    channels?: {
      email: boolean;
      inApp: boolean;
    };
  };

  // Consent tracking
  consents?: {
    dataProcessing: boolean;
    communications: boolean;
    analytics: boolean;
    acceptedAt?: string;
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
