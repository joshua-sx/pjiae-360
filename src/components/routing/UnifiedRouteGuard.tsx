import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingStatus, type OnboardingState } from '@/hooks/useOnboardingStatus';
import { usePermissions, type AppRole } from '@/features/access-control/hooks/usePermissions';
import { useLoadingCoordinator } from '@/hooks/useLoadingCoordinator';
import { ROLE_LEVELS, type Permission } from '@/features/access-control/permissions';
import { RouteLoader } from '@/components/ui/navigation-loader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface UnifiedRouteGuardProps {
  children: React.ReactNode;
  
  // Authentication requirements
  requireAuth?: boolean;
  
  // Role requirements (from RoleProtectedRoute)
  requiredRoles?: AppRole[];
  requiredPermissions?: (Permission | string)[];
  minRole?: AppRole;
  
  // Onboarding requirements (from OnboardingProtectedRoute)
  onboardingState?: OnboardingState;
  allowDuringOnboarding?: boolean;
  
  // Fallback behavior
  fallbackPath?: string;
  loadingComponent?: React.ComponentType;
}

/**
 * Unified route protection that combines authentication, role, and onboarding checks
 * Replaces the need for multiple nested protection components
 */
export function UnifiedRouteGuard({
  children,
  requireAuth = true,
  requiredRoles = [],
  requiredPermissions = [],
  minRole,
  onboardingState,
  allowDuringOnboarding = false,
  fallbackPath = "/unauthorized",
  loadingComponent: LoadingComponent = RouteLoader
}: UnifiedRouteGuardProps) {
  const { isAuthenticated } = useAuth();
  const { onboardingCompleted, onboardingState: currentOnboardingState } = useOnboardingStatus();
  const { hasAnyRole, hasPermission, roles } = usePermissions();
  const { isInitializing, canProceed } = useLoadingCoordinator();
  const navigate = useNavigate();

  useEffect(() => {
    if (!canProceed) return;

    // Authentication check
    if (requireAuth && !isAuthenticated) {
      navigate("/log-in");
      return;
    }

    // Onboarding state check
    if (onboardingState) {
      if (currentOnboardingState !== onboardingState) {
        if (currentOnboardingState === 'completed') {
          navigate("/dashboard");
        } else if (currentOnboardingState === 'pre-onboarding') {
          navigate("/onboarding");
        }
        return;
      }
    }

    // If user has no roles and requires auth, redirect to onboarding
    if (requireAuth && roles.length === 0) {
      navigate("/onboarding");
      return;
    }

    // Role and permission checks
    if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
      navigate(fallbackPath);
      return;
    }

    if (requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(permission => 
        hasPermission(permission)
      );
      if (!hasAllPermissions) {
        navigate(fallbackPath);
        return;
      }
    }

    // Minimum role check
    if (minRole && roles.length > 0) {
      const userMaxLevel = Math.max(...roles.map(role => ROLE_LEVELS[role] || 0));
      const requiredLevel = ROLE_LEVELS[minRole];
      if (userMaxLevel < requiredLevel) {
        navigate(fallbackPath);
        return;
      }
    }
  }, [
    canProceed, 
    isAuthenticated, 
    currentOnboardingState, 
    onboardingState,
    roles,
    hasAnyRole, 
    hasPermission, 
    requiredRoles,
    requiredPermissions,
    minRole,
    requireAuth,
    navigate,
    fallbackPath
  ]);

  // Show loading while initializing
  if (isInitializing) {
    return <LoadingComponent />;
  }

  // Don't render if redirecting
  if (!canProceed) {
    return null;
  }

  // Authentication check (render-time)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // No roles check (render-time)
  if (requireAuth && roles.length === 0) {
    return null;
  }

  // Role and permission checks (render-time)
  const hasRequiredRole = requiredRoles.length === 0 || hasAnyRole(requiredRoles);
  const hasRequiredPermissions = requiredPermissions.length === 0 || 
    requiredPermissions.every(permission => hasPermission(permission));

  let hasMinRole = true;
  if (minRole && roles.length > 0) {
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

  // Onboarding state check (render-time)
  if (onboardingState && currentOnboardingState !== onboardingState) {
    return null;
  }

  return <>{children}</>;
}