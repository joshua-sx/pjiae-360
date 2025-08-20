import React from 'react';
import { usePermissions, type AppRole } from '@/features/access-control/hooks/usePermissions';
import { checkPermission } from '@/hooks/useRequirePermission';
import { AlertTriangle, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ROLE_LEVELS, type Permission } from '@/features/access-control/permissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  roles?: AppRole[];
  permissions?: (Permission | string)[];
  minRole?: AppRole;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

/**
 * Component that conditionally renders children based on user permissions
 * More granular than useRequirePermission - doesn't redirect, just shows/hides content
 */
export function PermissionGuard({
  children,
  roles = [],
  permissions = [],
  minRole,
  fallback,
  showFallback = true
}: PermissionGuardProps) {
  const userPermissions = usePermissions();
  const { loading } = userPermissions;

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user has required permissions
  let hasAccess = checkPermission(userPermissions, { roles, permissions });
  
  // Additional check for minimum role requirement
  if (hasAccess && minRole) {
    const userMaxLevel = Math.max(...userPermissions.roles.map(role => ROLE_LEVELS[role] || 0));
    const requiredLevel = ROLE_LEVELS[minRole];
    hasAccess = userMaxLevel >= requiredLevel;
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showFallback) {
      return (
        <Alert variant="destructive" className="border-amber-200 bg-amber-50">
          <Lock className="h-4 w-4" />
          <AlertDescription className="text-amber-800">
            You don't have permission to access this feature.
            {roles.length > 0 && ` Required role(s): ${roles.join(', ')}`}
            {minRole && ` Minimum role: ${minRole}`}
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  }

  return <>{children}</>;
}

/**
 * Quick permission check for inline conditional rendering
 */
interface PermissionCheckProps {
  roles?: AppRole[];
  permissions?: (Permission | string)[];
  minRole?: AppRole;
  children: (hasAccess: boolean, loading: boolean) => React.ReactNode;
}

export function PermissionCheck({ roles = [], permissions = [], minRole, children }: PermissionCheckProps) {
  const userPermissions = usePermissions();
  const { loading } = userPermissions;
  
  let hasAccess = loading ? false : checkPermission(userPermissions, { roles, permissions });
  
  // Additional check for minimum role requirement
  if (hasAccess && minRole && !loading) {
    const userMaxLevel = Math.max(...userPermissions.roles.map(role => ROLE_LEVELS[role] || 0));
    const requiredLevel = ROLE_LEVELS[minRole];
    hasAccess = userMaxLevel >= requiredLevel;
  }
  
  return <>{children(hasAccess, loading)}</>;
}

/**
 * Higher-order component wrapper for permission checking
 */
export function withPermissions<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requirements: Pick<PermissionGuardProps, 'roles' | 'permissions' | 'minRole' | 'fallback'>
) {
  return function PermissionCheckedComponent(props: P) {
    return (
      <PermissionGuard {...requirements}>
        <WrappedComponent {...props} />
      </PermissionGuard>
    );
  };
}