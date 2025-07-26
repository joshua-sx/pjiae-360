import { useState, useEffect } from "react";
import { useAuth, useOrganization } from "@clerk/clerk-react";
import type { AppRole } from "@/types/shared";
export type { AppRole } from "@/types/shared";
import { clerkRoleToAppRole } from "@/constants/roles";

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
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { membership, isLoaded: orgLoaded } = useOrganization();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRoles = () => {
      if (!isSignedIn || !membership) {
        setRoles([]);
        setLoading(false);
        return;
      }

      const role = clerkRoleToAppRole(membership.role);
      setRoles(role ? [role] : []);
      setLoading(false);
    };

    if (authLoaded && orgLoaded) {
      fetchUserRoles();
    }
  }, [isSignedIn, membership, authLoaded, orgLoaded]);

  const hasRole = (role: AppRole): boolean => {
    return roles.includes(role);
  };

  const hasAnyRole = (rolesToCheck: AppRole[]): boolean => {
    return rolesToCheck.some((role) => roles.includes(role));
  };

  const isAdmin = hasRole("admin");
  const isDirector = hasRole("director");
  const isManager = hasRole("manager");
  const isSupervisor = hasRole("supervisor");
  const isEmployee = hasRole("employee");

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
    loading: loading || !authLoaded || !orgLoaded,
  };
}
