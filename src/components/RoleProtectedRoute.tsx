import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SignedIn, useAuth } from "@clerk/clerk-react";
import { usePermissions, type AppRole } from "@/hooks/usePermissions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield } from "lucide-react";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: AppRole[];
  requiredPermissions?: string[];
  fallbackPath?: string;
}

const RoleProtectedRoute = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallbackPath = "/unauthorized",
}: RoleProtectedRouteProps) => {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { hasAnyRole, loading, ...permissions } = usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoaded && !isSignedIn) {
      navigate("/log-in");
      return;
    }

    if (authLoaded && !loading) {
      const hasRequiredRole = requiredRoles.length === 0 || hasAnyRole(requiredRoles);
      const hasRequiredPermissions =
        requiredPermissions.length === 0 ||
        requiredPermissions.every(
          (permission) => permissions[permission as keyof typeof permissions]
        );

      if (!hasRequiredRole || !hasRequiredPermissions) {
        navigate(fallbackPath);
      }
    }
  }, [
    authLoaded,
    isSignedIn,
    loading,
    hasAnyRole,
    requiredRoles,
    requiredPermissions,
    permissions,
    navigate,
    fallbackPath,
  ]);

  if (!authLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  const hasRequiredRole = requiredRoles.length === 0 || hasAnyRole(requiredRoles);
  const hasRequiredPermissions =
    requiredPermissions.length === 0 ||
    requiredPermissions.every((permission) => permissions[permission as keyof typeof permissions]);

  if (!hasRequiredRole || !hasRequiredPermissions) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this page. You will be redirected shortly.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <SignedIn>{children}</SignedIn>;
};

export default RoleProtectedRoute;
