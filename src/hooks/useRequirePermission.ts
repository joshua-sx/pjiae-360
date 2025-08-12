import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions, type AppRole } from './usePermissions';
import { toast } from 'sonner';

interface UseRequirePermissionOptions {
  roles?: AppRole[];
  permissions?: string[];
  redirectTo?: string;
  showToast?: boolean;
  fallback?: () => void;
}

export function useRequirePermission({
  roles = [],
  permissions = [],
  redirectTo = '/unauthorized',
  showToast = true,
  fallback
}: UseRequirePermissionOptions = {}) {
  const navigate = useNavigate();
  const userPermissions = usePermissions();
  const { hasAnyRole, loading } = userPermissions;

  useEffect(() => {
    if (loading) return;

    let hasAccess = true;
    let denialReason = '';

    if (roles.length > 0 && !hasAnyRole(roles)) {
      hasAccess = false;
      denialReason = `Requires one of these roles: ${roles.join(', ')}`;
    }

    if (permissions.length > 0) {
      const hasAllPermissions = permissions.every((permission) => userPermissions.hasPermission(permission));

      if (!hasAllPermissions) {
        hasAccess = false;
        denialReason = `Insufficient permissions for this action`;
      }
    }

    if (!hasAccess) {
      if (showToast) {
        toast.error(`Access Denied: ${denialReason}`);
      }

      if (fallback) {
        fallback();
      } else {
        navigate(redirectTo, { replace: true });
      }
    }
  }, [loading, hasAnyRole, roles, permissions, navigate, redirectTo, showToast, fallback, userPermissions]);

  return {
    loading,
    hasAccess: !loading && (
      (roles.length === 0 || hasAnyRole(roles)) &&
      (permissions.length === 0 || permissions.every((permission) => userPermissions.hasPermission(permission)))
    ),
    userPermissions
  };
}

export function withPermissionCheck<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: UseRequirePermissionOptions = {}
) {
  return function PermissionCheckedComponent(props: P) {
    const { loading, hasAccess } = useRequirePermission(options);

    if (loading) {
      return React.createElement(
        'div',
        { className: 'flex items-center justify-center min-h-[200px]' },
        React.createElement('div', { className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-primary' })
      );
    }

    if (!hasAccess) {
      return React.createElement(
        'div',
        { className: 'flex flex-col items-center justify-center min-h-[200px] space-y-4' },
        React.createElement(
          'div',
          { className: 'text-center' },
          React.createElement('h3', { className: 'text-lg font-medium text-muted-foreground' }, 'Access Denied'),
          React.createElement('p', { className: 'text-sm text-muted-foreground mt-2' }, 'You do not have permission to view this content.')
        )
      );
    }

    return React.createElement(WrappedComponent, props);
  };
}

export function checkPermission(
  userPermissions: ReturnType<typeof usePermissions>,
  requirements: Pick<UseRequirePermissionOptions, 'roles' | 'permissions'>
): boolean {
  const { roles = [], permissions = [] } = requirements;
  const { hasAnyRole } = userPermissions;

  if (roles.length > 0 && !hasAnyRole(roles)) {
    return false;
  }

  if (permissions.length > 0) {
    const hasAll = permissions.every((permission) => userPermissions.hasPermission(permission));
    if (!hasAll) {
      return false;
    }
  }

  return true;
}