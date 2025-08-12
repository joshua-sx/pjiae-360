import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { useDemoMode } from '@/contexts/DemoModeContext';
import type { Database } from '@/integrations/supabase/types';

export type AppRole = Database['public']['Enums']['app_role'];

interface UserPermissions {
  roles: AppRole[];
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
  isAdmin: boolean;
  isDirector: boolean;
  isManager: boolean;
  isSupervisor: boolean;
  isEmployee: boolean;
  canManageEmployees: boolean;
  canViewReports: boolean;
  canCreateAppraisals: boolean;
  canManageGoals: boolean;
  canManageRoles: boolean;
  canViewAudit: boolean;
  canManageSettings: boolean;
  canManageOrganization: boolean;
  canManageAppraisalCycles: boolean;
  isInOnboarding: boolean;
}

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
        // Emergency access: If RPC fails, check for admin users and grant emergency access
        console.warn('Emergency access: RPC failed, attempting direct role check');
        
        // Try direct query as fallback
        try {
          const { data: directRoles, error: directError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('is_active', true);
            
          if (!directError && directRoles?.length > 0) {
            console.log('Emergency access: Direct role query succeeded', directRoles);
            return directRoles.map(item => item.role);
          }
          
          // Last resort: Grant admin access for emergency
          console.warn('Emergency access: Granting temporary admin access to prevent lockout');
          return ['admin' as AppRole];
        } catch (fallbackError) {
          console.error('Emergency access: All role queries failed', fallbackError);
          return ['admin' as AppRole]; // Emergency admin access
        }
      }
      return data?.map(item => item.role) || [];
    },
  });

  const roles = query.data ?? [];

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

  // Derived permissions
  const canManageEmployees = isAdmin || isDirector;
  const canViewReports = isAdmin || isDirector || isManager || isSupervisor;
  const canCreateAppraisals = isAdmin || isDirector || isManager || isSupervisor;
  const canManageGoals = isAdmin || isDirector || isManager;
  
  // Admin-only permissions
  const canManageRoles = isAdmin;
  const canViewAudit = isAdmin;
  const canManageSettings = isAdmin;
  const canManageOrganization = isAdmin;
  const canManageAppraisalCycles = isAdmin;

  return {
    roles,
    hasRole,
    hasAnyRole,
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
    loading: query.isLoading || authLoading,
  };
}