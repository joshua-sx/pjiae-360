
import { useAuth } from "@/hooks/useAuth";
import { useAuthProfile } from "@/hooks/useAuthProfile";
import { usePermissions } from "@/hooks/usePermissions";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RouteLoader } from "./ui/navigation-loader";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();
  const { roles, loading: permissionsLoading } = usePermissions();
  const { onboardingCompleted, loading: onboardingLoading } = useOnboardingStatus();
  const navigate = useNavigate();
  
  // Handle automatic profile claiming for invited employees
  useAuthProfile();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/log-in");
    }
  }, [isAuthenticated, loading, navigate]);

  // Remove automatic redirection to onboarding based on roles
  // Let OnboardingProtectedRoute handle onboarding access control

  if (loading || permissionsLoading || onboardingLoading) {
    return <RouteLoader />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
