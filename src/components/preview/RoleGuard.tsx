
import { ReactNode } from 'react';
import { useRole } from '@/hooks/useRole';
import { UserRole } from '@/types/roles';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requiredPermissions?: (keyof import('@/types/roles').RolePermissions)[];
  fallback?: ReactNode;
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  requiredPermissions, 
  fallback = null 
}: RoleGuardProps) {
  const { effectiveRole, permissions } = useRole();

  // Check if role is allowed
  if (allowedRoles && !allowedRoles.includes(effectiveRole)) {
    return <>{fallback}</>;
  }

  // Check if permissions are met
  if (requiredPermissions) {
    const hasAllPermissions = requiredPermissions.every(
      permission => permissions[permission]
    );
    if (!hasAllPermissions) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
