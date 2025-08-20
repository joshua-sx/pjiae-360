import { usePermissions, type AppRole } from "@/features/access-control/hooks/usePermissions";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield } from "lucide-react";
import { ROLE_LEVELS, type Permission } from "@/features/access-control/permissions";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: AppRole[];
  requiredPermissions?: (Permission | string)[];
  minRole?: AppRole;
  fallbackPath?: string;
}

const RoleProtectedRoute = ({ 
  children, 
  requiredRoles = [], 
  requiredPermissions = [],
  minRole,
  fallbackPath = "/unauthorized" 
}: RoleProtectedRouteProps) => {
  const { hasAnyRole, hasPermission, loading, roles } = usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      // If user has no roles at all, redirect to onboarding
      if (roles.length === 0) {
        navigate("/onboarding");
        return;
      }

      const hasRequiredRole = requiredRoles.length === 0 || hasAnyRole(requiredRoles);
      const hasRequiredPermissions = requiredPermissions.length === 0 ||
        requiredPermissions.every((permission) => hasPermission(permission));
      
      let hasMinRole = true;
      if (minRole) {
        const userMaxLevel = Math.max(...roles.map(role => ROLE_LEVELS[role] || 0));
        const requiredLevel = ROLE_LEVELS[minRole];
        hasMinRole = userMaxLevel >= requiredLevel;
      }

      if (!hasRequiredRole || !hasRequiredPermissions || !hasMinRole) {
        navigate(fallbackPath);
      }
    }
  }, [loading, hasAnyRole, hasPermission, requiredRoles, requiredPermissions, minRole, navigate, fallbackPath, roles]);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user has no roles at all, don't render anything (will redirect via useEffect)
  if (roles.length === 0) {
    return null;
  }

  const hasRequiredRole = requiredRoles.length === 0 || hasAnyRole(requiredRoles);
  const hasRequiredPermissions = requiredPermissions.length === 0 || 
    requiredPermissions.every((permission) => hasPermission(permission));

  let hasMinRole = true;
  if (minRole) {
    const userMaxLevel = Math.max(...roles.map(role => ROLE_LEVELS[role] || 0));
    const requiredLevel = ROLE_LEVELS[minRole];
    hasMinRole = userMaxLevel >= requiredLevel;
  }

  if (!hasRequiredRole || !hasRequiredPermissions || !hasMinRole) {
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

  return <>{children}</>;
};

export default RoleProtectedRoute;