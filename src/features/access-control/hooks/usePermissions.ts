import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { useDemoMode } from '@/contexts/DemoModeContext';
import type { Database } from '@/integrations/supabase/types';

export type AppRole = Database['public']['Enums']['app_role'];

interface UserPermissions {
  roles: AppRole[];
  permissions: string[];
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
  isAdmin: boolean;
  isDirector: boolean;
  isManager: boolean;
  isSupervisor: boolean;
  isEmployee: boolean;
  canManageEmployees: boolean; // derived from DB permissions
  canViewReports: boolean; // derived from DB permissions
  canCreateAppraisals: boolean; // derived from DB permissions
  canManageGoals: boolean; // derived from DB permissions
  canManageRoles: boolean; // derived from DB permissions
  canViewAudit: boolean; // derived from DB permissions
  canManageSettings: boolean; // derived from DB permissions
  canManageOrganization: boolean; // derived from DB permissions
  canManageAppraisalCycles: boolean; // derived from DB permissions
  isInOnboarding: boolean;
}

// Default permission sets per role (used for demo mode and as a resilient fallback)
const roleDefaultPermissions: Record<AppRole, string[]> = {
  admin: [
    'manage_employees',
    'view_reports',
    'create_appraisals',
    'manage_goals',
    'manage_roles',
    'view_audit',
    'manage_settings',
    'manage_organization',
    'manage_appraisal_cycles'
  ],
  director: ['view_reports', 'create_appraisals', 'manage_goals'],
  manager: ['view_reports', 'create_appraisals', 'manage_goals'],
  supervisor: ['view_reports', 'create_appraisals'],
  employee: []
};

// Backwards-compat map for legacy camelCase permission names used in UI
const legacyPermissionMap: Record<string, string> = {
  canManageEmployees: 'manage_employees',
  canViewReports: 'view_reports',
  canCreateAppraisals: 'create_appraisals',
  canManageGoals: 'manage_goals',
  canManageRoles: 'manage_roles',
  canViewAudit: 'view_audit',
  canManageSettings: 'manage_settings',
  canManageOrganization: 'manage_organization',
  canManageAppraisalCycles: 'manage_appraisal_cycles'
};

export function usePermissions(): UserPermissions & { loading: boolean } {
  const { user, loading: authLoading } = useAuth();
  const { onboardingCompleted } = useOnboardingStatus();
  const { isDemoMode, demoRole } = useDemoMode();

  // Don't fetch roles if user is in onboarding state
  const shouldFetchRoles = !!user && (isDemoMode || onboardingCompleted === true);

  const query = useQuery({
    queryKey: ['permissions', user?.id, isDemoMode, demoRole],
    enabled: !authLoading && shouldFetchRoles,
    queryFn: async (): Promise<AppRole[]> => {
      if (isDemoMode && demoRole) {
        return [demoRole];
      }

      if (!user) {
        return [];
      }

      // If user is in onboarding, they don't have roles yet
      if (onboardingCompleted === false || onboardingCompleted === null) {
        return [];
      }

      const { data, error } = await supabase.rpc('get_current_user_roles');
      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
      return data?.map(item => item.role) || [];
    },
  });

  const roles = query.data ?? [];

  // Fetch effective permissions from DB (or derive in demo/fallback)
  const permissionsQuery = useQuery({
    queryKey: ['effective-permissions', user?.id, isDemoMode, demoRole],
    enabled: !authLoading && shouldFetchRoles,
    queryFn: async (): Promise<string[]> => {
      // Demo mode: derive from selected demo role
      if (isDemoMode && demoRole) {
        return roleDefaultPermissions[demoRole] ?? [];
      }

      if (!user) return [];

      // If user is in onboarding, they don't have permissions yet
      if (onboardingCompleted === false || onboardingCompleted === null) {
        return [];
      }

      const { data, error } = await supabase.rpc('get_effective_permissions_for_user');
      if (error) {
        console.error('Error fetching effective permissions:', error);
        return [];
      }
      return (data as string[]) ?? [];
    },
  });

  const rawPermissions = permissionsQuery.data ?? [];
  const fallbackFromRoles = Array.from(new Set(roles.flatMap(r => roleDefaultPermissions[r] ?? [])));
  const effectivePermissions = rawPermissions.length > 0
    ? rawPermissions
    : (isDemoMode && demoRole ? (roleDefaultPermissions[demoRole] ?? []) : fallbackFromRoles);

  const permissionsSet = new Set(effectivePermissions);
  const normalizePermission = (p: string) => legacyPermissionMap[p] ?? p;
  const hasPermission = (p: string): boolean => permissionsSet.has(normalizePermission(p));

  const hasRole = (role: AppRole): boolean => {
    return roles.includes(role);
  };

  const hasAnyRole = (rolesToCheck: AppRole[]): boolean => {
    return rolesToCheck.some(role => roles.includes(role));
  };

  // Determine if user is in onboarding state
  const isInOnboarding = !!user && (onboardingCompleted === false || onboardingCompleted === null);

  const isAdmin = hasRole('admin');
  const isDirector = hasRole('director');
  const isManager = hasRole('manager');
  const isSupervisor = hasRole('supervisor');
  const isEmployee = hasRole('employee');

  // Derived UI permission flags from DB-backed permissions
  const canManageEmployees = hasPermission('manage_employees');
  const canViewReports = hasPermission('view_reports');
  const canCreateAppraisals = hasPermission('create_appraisals');
  const canManageGoals = hasPermission('manage_goals');
  const canManageRoles = hasPermission('manage_roles');
  const canViewAudit = hasPermission('view_audit');
  const canManageSettings = hasPermission('manage_settings');
  const canManageOrganization = hasPermission('manage_organization');
  const canManageAppraisalCycles = hasPermission('manage_appraisal_cycles');

  return {
    roles,
    permissions: effectivePermissions,
    hasRole,
    hasAnyRole,
    hasPermission,
    isAdmin,
    isDirector,
    isManager,
    isSupervisor,
    isEmployee,
    canManageEmployees,
    canViewReports,
    canCreateAppraisals,
    canManageGoals,
    canManageRoles,
    canViewAudit,
    canManageSettings,
    canManageOrganization,
    canManageAppraisalCycles,
    isInOnboarding,
    loading: query.isLoading || permissionsQuery.isLoading || authLoading,
  };
}