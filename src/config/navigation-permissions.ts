/**
 * Navigation permission mappings
 * Maps navigation routes to required permissions and roles
 */

import { PERMISSIONS } from '@/features/access-control/permissions';
import type { AppRole } from '@/features/access-control/hooks/usePermissions';

export interface NavigationPermission {
  path: string;
  permissions?: string[];
  roles?: AppRole[];
  minRole?: AppRole;
}

export const NAVIGATION_PERMISSIONS: NavigationPermission[] = [
  // Admin routes
  {
    path: '/admin',
    minRole: 'admin'
  },
  {
    path: '/admin/employees',
    permissions: [PERMISSIONS.MANAGE_EMPLOYEES]
  },
  {
    path: '/admin/roles',
    permissions: [PERMISSIONS.MANAGE_ROLES]
  },
  {
    path: '/admin/security',
    permissions: [PERMISSIONS.MANAGE_SECURITY]
  },
  {
    path: '/admin/analytics',
    permissions: [PERMISSIONS.VIEW_ANALYTICS]
  },
  {
    path: '/admin/settings',
    permissions: [PERMISSIONS.MANAGE_SETTINGS]
  },
  
  // Director routes
  {
    path: '/director',
    minRole: 'director'
  },
  {
    path: '/director/reports',
    permissions: [PERMISSIONS.VIEW_REPORTS]
  },
  {
    path: '/director/appraisals',
    permissions: [PERMISSIONS.MANAGE_APPRAISALS]
  },
  
  // Manager routes  
  {
    path: '/manager',
    minRole: 'manager'
  },
  {
    path: '/manager/team',
    minRole: 'manager'
  },
  {
    path: '/manager/goals',
    permissions: [PERMISSIONS.MANAGE_GOALS]
  },
  
  // Supervisor routes
  {
    path: '/supervisor',
    minRole: 'supervisor'
  },
  {
    path: '/supervisor/team',
    minRole: 'supervisor'
  },
  
  // Employee routes (accessible to all)
  {
    path: '/employee/dashboard',
    minRole: 'employee'
  },
  {
    path: '/employee/goals',
    minRole: 'employee'
  },
  {
    path: '/employee/appraisals',
    minRole: 'employee'
  }
];

/**
 * Check if user has access to a specific navigation path
 */
export function hasNavigationAccess(
  path: string,
  userRoles: AppRole[],
  userPermissions: string[]
): boolean {
  const navPermission = NAVIGATION_PERMISSIONS.find(nav => 
    path.startsWith(nav.path)
  );
  
  if (!navPermission) {
    return true; // Allow access if no restrictions defined
  }
  
  // Check minimum role requirement
  if (navPermission.minRole) {
    const roleHierarchy = { employee: 1, supervisor: 2, manager: 3, director: 4, admin: 5 };
    const requiredLevel = roleHierarchy[navPermission.minRole];
    const userMaxLevel = Math.max(...userRoles.map(role => roleHierarchy[role] || 0));
    
    if (userMaxLevel < requiredLevel) {
      return false;
    }
  }
  
  // Check specific role requirements
  if (navPermission.roles && navPermission.roles.length > 0) {
    const hasRequiredRole = navPermission.roles.some(role => userRoles.includes(role));
    if (!hasRequiredRole) {
      return false;
    }
  }
  
  // Check permission requirements
  if (navPermission.permissions && navPermission.permissions.length > 0) {
    const hasAllPermissions = navPermission.permissions.every(permission => 
      userPermissions.includes(permission)
    );
    if (!hasAllPermissions) {
      return false;
    }
  }
  
  return true;
}