
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useRoleMimicking } from '@/contexts/RoleMimickingContext';
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
  // New properties for role mimicking
  actualRoles: AppRole[];
  effectiveRole: AppRole | null;
  isActualAdmin: boolean;
}

export function usePermissions(): UserPermissions & { loading: boolean } {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get role mimicking context
  const { mimickedRole, setOriginalRole, isMimicking } = useRoleMimicking();

  useEffect(() => {
    const fetchUserRoles = async () => {
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
          setRoles(userRoles);
          
          // Set the original role in the mimicking context
          if (userRoles.length > 0) {
            // Find the highest role (admin > director > manager > supervisor > employee)
            const roleHierarchy: AppRole[] = ['admin', 'director', 'manager', 'supervisor', 'employee'];
            const highestRole = roleHierarchy.find(role => userRoles.includes(role)) || 'employee';
            setOriginalRole(highestRole);
          }
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
  }, [user, authLoading, setOriginalRole]);

  // Determine effective roles based on mimicking
  const actualRoles = roles;
  const isActualAdmin = actualRoles.includes('admin');
  
  // If mimicking and user is actually an admin, use mimicked role for permissions
  const effectiveRoles = (isMimicking && isActualAdmin && mimickedRole) 
    ? [mimickedRole] 
    : actualRoles;
  
  const effectiveRole = effectiveRoles.length > 0 ? effectiveRoles[0] : null;

  const hasRole = (role: AppRole): boolean => {
    return effectiveRoles.includes(role);
  };

  const hasAnyRole = (rolesToCheck: AppRole[]): boolean => {
    return rolesToCheck.some(role => effectiveRoles.includes(role));
  };

  const isAdmin = hasRole('admin');
  const isDirector = hasRole('director');
  const isManager = hasRole('manager');
  const isSupervisor = hasRole('supervisor');
  const isEmployee = hasRole('employee');

  // Derived permissions based on effective roles
  const canManageEmployees = isAdmin || isDirector;
  const canViewReports = isAdmin || isDirector || isManager || isSupervisor;
  const canCreateAppraisals = isAdmin || isDirector || isManager || isSupervisor;
  const canManageGoals = isAdmin || isDirector || isManager;

  return {
    roles: effectiveRoles,
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
    // New properties
    actualRoles,
    effectiveRole,
    isActualAdmin,
  };
}
