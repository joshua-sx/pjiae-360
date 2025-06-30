
export interface OnboardingMilestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  estimatedTime: string;
  isOptional: boolean;
}

export interface OrganizationData {
  name: string;
  logo: File | null;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhone: string;
  industry: string;
  size: string;
  country: string;
  timezone: string;
}

export interface Division {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  managerId?: string;
}

export interface StructureData {
  divisions: Division[];
  hierarchy: 'flat' | 'hierarchical';
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  role?: string;
  managerId?: string;
  startDate?: string;
}

export interface PeopleData {
  employees: Employee[];
  importMethod: 'manual' | 'csv' | 'paste';
  csvData: any[] | null;
}

export interface RoleAssignment {
  userId: string;
  role: 'admin' | 'manager' | 'supervisor' | 'employee' | 'hr' | 'reviewer';
}

export interface RolesData {
  assignments: Record<string, RoleAssignment>;
}

export interface ReviewCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  type: 'annual' | 'quarterly' | 'monthly';
  participants: string[];
}

export interface CycleSettings {
  defaultCycleLength: number;
  reviewTypes: string[];
  selfReviewEnabled: boolean;
  peerReviewEnabled: boolean;
  managerReviewEnabled: boolean;
}

export interface CyclesData {
  reviewCycles: ReviewCycle[];
  settings: CycleSettings;
}

export interface OnboardingData {
  organization: OrganizationData;
  structure: StructureData;
  people: PeopleData;
  roles: RolesData;
  cycles: CyclesData;
}
