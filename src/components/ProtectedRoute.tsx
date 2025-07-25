
import { useAuth } from "@/hooks/useAuth";
import { useAuthProfile } from "@/hooks/useAuthProfile";
import { usePermissions } from "@/hooks/usePermissions";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RouteLoader } from "./ui/navigation-loader";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();
  const { loading: permissionsLoading } = usePermissions();
  const navigate = useNavigate();
  
  // Handle automatic profile claiming for invited employees
  useAuthProfile();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/log-in");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading || permissionsLoading) {
    return <RouteLoader />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
