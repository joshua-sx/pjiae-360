import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SignedIn, useAuth } from "@clerk/clerk-react";
import { useAuthProfile } from "@/hooks/useAuthProfile";
import { usePermissions } from "@/hooks/usePermissions";
import { RouteLoader } from "./ui/navigation-loader";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoaded, isSignedIn } = useAuth();
  const { loading: permissionsLoading } = usePermissions();
  const navigate = useNavigate();

  // Handle automatic profile claiming for invited employees
  useAuthProfile();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate("/log-in");
    }
  }, [isLoaded, isSignedIn, navigate]);

  if (!isLoaded || permissionsLoading) {
    return <RouteLoader />;
  }

  if (!isSignedIn) {
    return null;
  }

  return <SignedIn>{children}</SignedIn>;
};

export default ProtectedRoute;
