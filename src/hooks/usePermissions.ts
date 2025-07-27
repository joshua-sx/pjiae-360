// Simplified permissions for Clerk
export function usePermissions() {
  return {
    roles: [],
    hasRole: () => false,
    hasAnyRole: () => false,
    isAdmin: false,
    isDirector: false,
    isManager: false,
    isSupervisor: false,
    isEmployee: true,
    canManageEmployees: false,
    canViewReports: false,
    canCreateAppraisals: false,
    canManageGoals: false,
    loading: false,
  };
}