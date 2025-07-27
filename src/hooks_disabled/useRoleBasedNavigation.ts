import { useNavigate } from 'react-router-dom';
import { usePermissions } from './usePermissions';
import { useEffect } from 'react';

export function useRoleBasedNavigation() {
  const permissions = usePermissions();
  const navigate = useNavigate();

  // Get the user's primary role prefix for routing
  const getRolePrefix = () => {
    if (permissions.isAdmin) return 'admin';
    if (permissions.isDirector) return 'director';
    if (permissions.isManager) return 'manager';
    if (permissions.isSupervisor) return 'supervisor';
    return 'employee';
  };

  // Navigate to a role-specific route
  const navigateToRolePage = (page: string) => {
    const rolePrefix = getRolePrefix();
    navigate(`/${rolePrefix}/${page}`);
  };

  // Get the role-specific URL for a page
  const getRolePageUrl = (page: string) => {
    const rolePrefix = getRolePrefix();
    return `/${rolePrefix}/${page}`;
  };

  // Redirect legacy routes to role-based routes
  const redirectLegacyRoute = (currentPath: string) => {
    if (!permissions.loading) {
      const rolePrefix = getRolePrefix();
      
      // Handle legacy routes
      if (currentPath === '/dashboard' || currentPath === '/admin') {
        navigate(`/${rolePrefix}/dashboard`, { replace: true });
      } else if (currentPath === '/goals') {
        navigate(`/${rolePrefix}/goals`, { replace: true });
      } else if (currentPath === '/appraisals') {
        navigate(`/${rolePrefix}/appraisals`, { replace: true });
      } else if (currentPath === '/calendar') {
        navigate(`/${rolePrefix}/calendar`, { replace: true });
      }
    }
  };

  return {
    getRolePrefix,
    navigateToRolePage,
    getRolePageUrl,
    redirectLegacyRoute,
    isLoading: permissions.loading,
  };
}