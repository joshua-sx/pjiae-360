import { usePermissions, type AppRole } from './usePermissions';
import { ROLE_LEVELS, type Permission } from '../permissions';

/**
 * Enhanced hooks for role-based access control
 */

export function useHasPermission() {
  const { hasPermission } = usePermissions();
  
  return (permission: Permission | string): boolean => {
    return hasPermission(permission);
  };
}

export function useHasRole() {
  const { hasRole } = usePermissions();
  
  return (role: AppRole): boolean => {
    return hasRole(role);
  };
}

export function useHasAnyRole() {
  const { hasAnyRole } = usePermissions();
  
  return (roles: AppRole[]): boolean => {
    return hasAnyRole(roles);
  };
}

export function useAtLeastRole() {
  const { roles } = usePermissions();
  
  return (minRole: AppRole): boolean => {
    const userMaxLevel = Math.max(...roles.map(role => ROLE_LEVELS[role] || 0));
    const requiredLevel = ROLE_LEVELS[minRole];
    return userMaxLevel >= requiredLevel;
  };
}

export function useAbility() {
  const hasPermission = useHasPermission();
  const hasRole = useHasRole();
  const hasAnyRole = useHasAnyRole();
  const atLeastRole = useAtLeastRole();
  
  return {
    can: hasPermission,
    hasRole,
    hasAnyRole,
    atLeastRole,
    
    // Convenience methods for common checks
    canManage: (resource: string) => hasPermission(`manage_${resource}` as Permission),
    canView: (resource: string) => hasPermission(`view_${resource}` as Permission),
    canCreate: (resource: string) => hasPermission(`create_${resource}` as Permission),
    canEdit: (resource: string) => hasPermission(`edit_${resource}` as Permission),
    canDelete: (resource: string) => hasPermission(`delete_${resource}` as Permission)
  };
}