import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/features/access-control/hooks/usePermissions';
import { useEffect } from 'react';
import { getRolePrefix } from '@/lib/utils';

export function useRoleBasedNavigation() {
  const permissions = usePermissions();
  const navigate = useNavigate();

  // Get the user's primary role prefix for routing
  const determineRolePrefix = () => {
    if (permissions.isAdmin) return getRolePrefix('admin');
    if (permissions.isDirector) return getRolePrefix('director');
    if (permissions.isManager) return getRolePrefix('manager');
    if (permissions.isSupervisor) return getRolePrefix('supervisor');
    return getRolePrefix('employee');
  };

  // Navigate to a role-specific route
  const navigateToRolePage = (page: string) => {
    const rolePrefix = determineRolePrefix();
    navigate(`/${rolePrefix}/${page}`);
  };

  // Get the role-specific URL for a page
  const getRolePageUrl = (page: string) => {
    const rolePrefix = determineRolePrefix();
    return `/${rolePrefix}/${page}`;
  };


  return {
    getRolePrefix: determineRolePrefix,
    navigateToRolePage,
    getRolePageUrl,
    isLoading: permissions.loading,
  };
}