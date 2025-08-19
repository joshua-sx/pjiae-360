import React from 'react';
import { usePermissions, type AppRole } from '@/features/access-control/hooks/usePermissions';
import { checkPermission } from '@/hooks/useRequirePermission';
import { AlertTriangle, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PermissionGuardProps {
  children: React.ReactNode;
  roles?: AppRole[];
  permissions?: string[];
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
  const hasAccess = checkPermission(userPermissions, { roles, permissions });

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
  permissions?: string[];
  children: (hasAccess: boolean, loading: boolean) => React.ReactNode;
}

export function PermissionCheck({ roles = [], permissions = [], children }: PermissionCheckProps) {
  const userPermissions = usePermissions();
  const { loading } = userPermissions;
  
  const hasAccess = loading ? false : checkPermission(userPermissions, { roles, permissions });
  
  return <>{children(hasAccess, loading)}</>;
}

/**
 * Higher-order component wrapper for permission checking
 */
export function withPermissions<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requirements: Pick<PermissionGuardProps, 'roles' | 'permissions' | 'fallback'>
) {
  return function PermissionCheckedComponent(props: P) {
    return (
      <PermissionGuard {...requirements}>
        <WrappedComponent {...props} />
      </PermissionGuard>
    );
  };
}