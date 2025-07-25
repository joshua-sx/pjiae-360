import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useAuth } from "@/hooks/useAuth";
import { RouteLoader } from "./ui/navigation-loader";

interface OnboardingProtectedRouteProps {
  children: React.ReactNode;
}

const OnboardingProtectedRoute = ({ children }: OnboardingProtectedRouteProps) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { onboardingCompleted, loading: onboardingLoading } = useOnboardingStatus();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for both auth and onboarding status to load
    if (authLoading || onboardingLoading) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      navigate("/log-in");
      return;
    }

    // If onboarding is already completed, redirect to dashboard
    if (onboardingCompleted === true) {
      navigate("/dashboard");
      return;
    }
  }, [isAuthenticated, onboardingCompleted, authLoading, onboardingLoading, navigate]);

  // Show loading while determining status
  if (authLoading || onboardingLoading) {
    return <RouteLoader />;
  }

  // Don't render children if redirecting
  if (!isAuthenticated || onboardingCompleted === true) {
    return null;
  }

  return <>{children}</>;
};

export default OnboardingProtectedRoute;