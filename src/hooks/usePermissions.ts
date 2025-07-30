import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useDemoMode } from '@/contexts/DemoModeContext';
import type { Database } from '@/integrations/supabase/types';

export type AppRole = Database['public']['Enums']['app_role'];

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
  const { isDemoMode, demoRole } = useDemoMode();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRoles = async () => {
      // In demo mode, use the selected demo role
      if (isDemoMode && demoRole) {
        console.log('Demo mode active, using demo role:', demoRole);
        setRoles([demoRole]);
        setLoading(false);
        return;
      }

      if (!user) {
        setRoles([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('get_current_user_roles');
        
        if (error) {
          console.error('Error fetching user roles:', error);
          setRoles([]);
        } else {
          const userRoles = data?.map(item => item.role) || [];
          console.log('Fetched user roles:', userRoles);
          setRoles(userRoles);
        }
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchUserRoles();
    }
  }, [user, authLoading, isDemoMode, demoRole]);

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