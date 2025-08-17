
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

  useEffect(() => {
    // Only check roles if we have loaded both permissions and onboarding status
    if (!permissionsLoading && !onboardingLoading && isAuthenticated) {
      // If user has no roles but onboarding is not completed, redirect to onboarding
      if (roles.length === 0 && onboardingCompleted === false) {
        console.log("User authenticated but no roles and onboarding not completed. Redirecting to onboarding.");
        navigate("/onboarding");
        return;
      }
      
      // If user has no roles and onboarding is completed, redirect to unauthorized
      if (roles.length === 0 && onboardingCompleted === true) {
        console.warn("User authenticated but no roles found after onboarding completion. Redirecting to unauthorized page.");
        navigate("/unauthorized");
        return;
      }
    }
  }, [permissionsLoading, onboardingLoading, isAuthenticated, roles, onboardingCompleted, navigate]);

  if (loading || permissionsLoading || onboardingLoading) {
    return <RouteLoader />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
