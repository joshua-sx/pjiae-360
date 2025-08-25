import { useAuth } from './useAuth';
import { useOnboardingStatus } from './useOnboardingStatus';
import { usePermissions } from '@/features/access-control/hooks/usePermissions';

export interface LoadingCoordinatorResult {
  isInitializing: boolean;
  canProceed: boolean;
  loadingStates: {
    auth: boolean;
    onboarding: boolean;
    permissions: boolean;
  };
}

/**
 * Coordinated loading state manager for authentication flows
 * Prevents race conditions by providing a unified loading state
 */
export function useLoadingCoordinator(): LoadingCoordinatorResult {
  const { loading: authLoading } = useAuth();
  const { loading: onboardingLoading } = useOnboardingStatus();
  const { loading: permissionsLoading } = usePermissions();

  const isInitializing = authLoading || onboardingLoading || permissionsLoading;
  const canProceed = !isInitializing;

  return {
    isInitializing,
    canProceed,
    loadingStates: {
      auth: authLoading,
      onboarding: onboardingLoading,
      permissions: permissionsLoading,
    },
  };
}