// Simplified onboarding status for Clerk
export function useOnboardingStatus() {
  return {
    onboardingCompleted: true, // Always completed for Clerk users
    loading: false,
    markOnboardingComplete: async () => {},
    refetch: async () => {},
  };
}