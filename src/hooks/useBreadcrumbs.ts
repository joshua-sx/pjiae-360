import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { usePermissions } from '@/features/access-control/hooks/usePermissions';

export interface Breadcrumb {
  label: string;
  url?: string;
  isActive: boolean;
}

// Route-to-label mapping
const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  goals: 'Goals',
  appraisals: 'Appraisals',
  calendar: 'Calendar',
  employees: 'Employees',
  organization: 'Organization',
  cycles: 'Appraisal Cycles',
  reports: 'Analytics',
  roles: 'Roles & Permissions',
  audit: 'Audit Log',
  settings: 'Settings',
  analytics: 'Analytics',
  personal: 'Personal',
  team: 'Team',
  create: 'Create',
  import: 'Import',
  manage: 'Manage',
  new: 'New',
  // Special cases
  'role-management': 'Role Management',
  'employee-import': 'Employee Import',
};

// Role prefixes
const rolePrefixes = ['admin', 'director', 'manager', 'supervisor', 'employee'];

export function useBreadcrumbs(): Breadcrumb[] {
  const location = useLocation();
  const permissions = usePermissions();

  return useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    if (pathSegments.length === 0) {
      return [{ label: 'Dashboard', isActive: true }];
    }

    const breadcrumbs: Breadcrumb[] = [];
    let currentPath = '';

    // Skip role prefix in breadcrumbs display, but keep it for URLs
    const isRolePrefix = rolePrefixes.includes(pathSegments[0]);
    const rolePrefix = isRolePrefix ? pathSegments[0] : '';
    const contentSegments = isRolePrefix ? pathSegments.slice(1) : pathSegments;

    // Always start with Dashboard for role-based routes
    if (isRolePrefix) {
      currentPath = `/${rolePrefix}/dashboard`;
      breadcrumbs.push({
        label: 'Dashboard',
        url: currentPath,
        isActive: contentSegments.length === 0 || (contentSegments.length === 1 && contentSegments[0] === 'dashboard')
      });
    }

    // Process remaining segments
    contentSegments.forEach((segment, index) => {
      // Skip 'dashboard' if it's the first segment after role prefix
      if (segment === 'dashboard' && index === 0 && isRolePrefix) {
        return;
      }

      currentPath += isRolePrefix ? `/${segment}` : `/${segment}`;
      const isLast = index === contentSegments.length - 1;
      
      // Get label for segment
      const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      
      breadcrumbs.push({
        label,
        url: isLast ? undefined : currentPath,
        isActive: isLast
      });
    });

    // Fallback for non-role-based routes
    if (!isRolePrefix && breadcrumbs.length === 0) {
      pathSegments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        const isLast = index === pathSegments.length - 1;
        const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
        
        breadcrumbs.push({
          label,
          url: isLast ? undefined : currentPath,
          isActive: isLast
        });
      });
    }

    return breadcrumbs.length > 0 ? breadcrumbs : [{ label: 'Dashboard', isActive: true }];
  }, [location.pathname, permissions]);
}
