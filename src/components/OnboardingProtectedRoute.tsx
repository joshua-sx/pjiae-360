import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useAuth } from "@/hooks/useAuth";
import { RouteLoader } from "./ui/navigation-loader";
import { determineOnboardingState } from "@/lib/onboarding-utils";

interface OnboardingProtectedRouteProps {
  children: React.ReactNode;
}

const OnboardingProtectedRoute = ({ children }: OnboardingProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { onboardingCompleted, loading: onboardingLoading } = useOnboardingStatus();
  const navigate = useNavigate();

  const stateInfo = determineOnboardingState(user, authLoading, onboardingCompleted, onboardingLoading);

  useEffect(() => {
    // Wait for loading to complete
    if (stateInfo.isLoading) return;

    // If not authenticated, redirect to login
    if (!user) {
      navigate("/log-in");
      return;
    }

    // If onboarding is completed, redirect to dashboard
    if (stateInfo.shouldRedirectToDashboard) {
      navigate("/dashboard");
      return;
    }
  }, [user, stateInfo.isLoading, stateInfo.shouldRedirectToDashboard, navigate]);

  // Show loading while determining status
  if (stateInfo.isLoading) {
    return <RouteLoader />;
  }

  // Don't render children if user should be redirected
  if (!user || stateInfo.shouldRedirectToDashboard) {
    return null;
  }

  // Allow access if user can access onboarding (pre-onboarding state)
  if (stateInfo.canAccessOnboarding) {
    return <>{children}</>;
  }

  // Block access for any other state
  return null;
};

export default OnboardingProtectedRoute;