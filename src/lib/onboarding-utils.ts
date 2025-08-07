import { User } from '@supabase/supabase-js';

export type OnboardingState = 
  | 'pre-onboarding'    // Authenticated but no employee_info
  | 'in-onboarding'     // Has employee_info but status !== 'active'
  | 'completed'         // Has employee_info with status === 'active'
  | 'unknown';          // Loading or error state

export interface OnboardingStateInfo {
  state: OnboardingState;
  canAccessOnboarding: boolean;
  shouldRedirectToDashboard: boolean;
  isLoading: boolean;
}

/**
 * Determines the onboarding state based on user auth status and employee info
 */
export function determineOnboardingState(
  user: User | null,
  authLoading: boolean,
  onboardingCompleted: boolean | null,
  onboardingLoading: boolean
): OnboardingStateInfo {
  // If we're still loading auth or onboarding data
  if (authLoading || onboardingLoading) {
    return {
      state: 'unknown',
      canAccessOnboarding: false,
      shouldRedirectToDashboard: false,
      isLoading: true,
    };
  }

  // If not authenticated
  if (!user) {
    return {
      state: 'unknown',
      canAccessOnboarding: false,
      shouldRedirectToDashboard: false,
      isLoading: false,
    };
  }

  // If onboarding is completed
  if (onboardingCompleted === true) {
    return {
      state: 'completed',
      canAccessOnboarding: false,
      shouldRedirectToDashboard: true,
      isLoading: false,
    };
  }

  // If onboarding is false, this means user needs onboarding access
  // This covers both pre-onboarding (no employee_info) and pending status
  if (onboardingCompleted === false) {
    return {
      state: 'in-onboarding',
      canAccessOnboarding: true,
      shouldRedirectToDashboard: false,
      isLoading: false,
    };
  }

  // If onboarding is null (unknown state)
  return {
    state: 'unknown',
    canAccessOnboarding: false,
    shouldRedirectToDashboard: false,
    isLoading: false,
  };
}

/**
 * Check if a user is in a state where they should be allowed to access onboarding
 */
export function canUserAccessOnboarding(
  user: User | null,
  authLoading: boolean,
  onboardingCompleted: boolean | null,
  onboardingLoading: boolean
): boolean {
  const stateInfo = determineOnboardingState(user, authLoading, onboardingCompleted, onboardingLoading);
  return stateInfo.canAccessOnboarding;
}