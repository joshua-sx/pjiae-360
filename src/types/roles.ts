
export type UserRole = 'admin' | 'manager' | 'supervisor' | 'employee' | 'hr' | 'reviewer';

export interface RolePermissions {
  canViewAll: boolean;
  canEditAll: boolean;
  canViewReports: boolean;
  canManageUsers: boolean;
  canSetGoals: boolean;
  canConductAppraisals: boolean;
  canViewAnalytics: boolean;
  canManageSettings: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canViewAll: true,
    canEditAll: true,
    canViewReports: true,
    canManageUsers: true,
    canSetGoals: true,
    canConductAppraisals: true,
    canViewAnalytics: true,
    canManageSettings: true,
  },
  manager: {
    canViewAll: true,
    canEditAll: false,
    canViewReports: true,
    canManageUsers: true,
    canSetGoals: true,
    canConductAppraisals: true,
    canViewAnalytics: true,
    canManageSettings: false,
  },
  supervisor: {
    canViewAll: false,
    canEditAll: false,
    canViewReports: true,
    canManageUsers: false,
    canSetGoals: true,
    canConductAppraisals: true,
    canViewAnalytics: false,
    canManageSettings: false,
  },
  employee: {
    canViewAll: false,
    canEditAll: false,
    canViewReports: false,
    canManageUsers: false,
    canSetGoals: false,
    canConductAppraisals: false,
    canViewAnalytics: false,
    canManageSettings: false,
  },
  hr: {
    canViewAll: true,
    canEditAll: false,
    canViewReports: true,
    canManageUsers: true,
    canSetGoals: false,
    canConductAppraisals: false,
    canViewAnalytics: true,
    canManageSettings: false,
  },
  reviewer: {
    canViewAll: false,
    canEditAll: false,
    canViewReports: false,
    canManageUsers: false,
    canSetGoals: false,
    canConductAppraisals: true,
    canViewAnalytics: false,
    canManageSettings: false,
  },
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  manager: 'Manager',
  supervisor: 'Supervisor',
  employee: 'Employee',
  hr: 'HR Representative',
  reviewer: 'Reviewer',
};
