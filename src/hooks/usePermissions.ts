import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export type AppRole = 'admin' | 'director' | 'manager' | 'supervisor' | 'employee';

interface UserPermissions {
  roles: AppRole[];
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
  isAdmin: boolean;
  isDirector: boolean;
  isManager: boolean;
  isSupervisor: boolean;
  isEmployee: boolean;
  canManageEmployees: boolean;
  canViewReports: boolean;
  canCreateAppraisals: boolean;
  canManageGoals: boolean;
}

export function usePermissions(): UserPermissions & { loading: boolean } {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      // For now, just assign basic employee role
      // This would be replaced with actual role fetching from Supabase
      setRoles(user ? ['employee'] : []);
      setLoading(false);
    }
  }, [user, authLoading]);

  const hasRole = (role: AppRole): boolean => {
    return roles.includes(role);
  };

  const hasAnyRole = (rolesToCheck: AppRole[]): boolean => {
    return rolesToCheck.some(role => roles.includes(role));
  };

  const isAdmin = hasRole('admin');
  const isDirector = hasRole('director');
  const isManager = hasRole('manager');
  const isSupervisor = hasRole('supervisor');
  const isEmployee = hasRole('employee');

  // Derived permissions
  const canManageEmployees = isAdmin || isDirector;
  const canViewReports = isAdmin || isDirector || isManager || isSupervisor;
  const canCreateAppraisals = isAdmin || isDirector || isManager || isSupervisor;
  const canManageGoals = isAdmin || isDirector || isManager;

  return {
    roles,
    hasRole,
    hasAnyRole,
    isAdmin,
    isDirector,
    isManager,
    isSupervisor,
    isEmployee,
    canManageEmployees,
    canViewReports,
    canCreateAppraisals,
    canManageGoals,
    loading: loading || authLoading,
  };
}