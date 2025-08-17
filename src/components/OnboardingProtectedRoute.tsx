import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { RouteLoader } from "./ui/navigation-loader";

interface OnboardingProtectedRouteProps {
  children: React.ReactNode;
}

const OnboardingProtectedRoute = ({ children }: OnboardingProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { onboardingState, loading: onboardingLoading } = useOnboardingStatus();
  const { isAdmin, loading: permissionsLoading } = usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for loading to complete
    if (authLoading || onboardingLoading || permissionsLoading) return;

    // If not authenticated, redirect to login
    if (!user) {
      navigate("/log-in");
      return;
    }

    // If onboarding is completed, redirect to dashboard
    if (onboardingState === 'completed') {
      navigate("/dashboard");
      return;
    }

    // If in-onboarding but not admin, redirect to dashboard
    if (onboardingState === 'in-onboarding' && !isAdmin) {
      navigate("/dashboard");
      return;
    }
  }, [user, authLoading, onboardingLoading, permissionsLoading, onboardingState, isAdmin, navigate]);

  // Show loading while determining status
  if (authLoading || onboardingLoading || permissionsLoading) {
    return <RouteLoader />;
  }

  // Don't render children if user should be redirected
  if (!user || onboardingState === 'completed' || (onboardingState === 'in-onboarding' && !isAdmin)) {
    return null;
  }

  // Allow access for pre-onboarding users or admin users in-onboarding
  if (onboardingState === 'pre-onboarding' || (onboardingState === 'in-onboarding' && isAdmin)) {
    return <>{children}</>;
  }

  // Block access for any other state
  return null;
};

export default OnboardingProtectedRoute;