
import { useUser } from '@clerk/clerk-react';
import { usePreview } from '@/features/rolePreview/contexts/PreviewContext';
import { UserRole, ROLE_PERMISSIONS, RolePermissions } from '@/shared/types/roles';

export function useRole() {
  const { user } = useUser();
  const { getEffectiveRole, getEffectivePermissions, isInPreview, previewRole } = usePreview();
  
  // Get actual role from Clerk user metadata or default to employee
  const actualRole: UserRole = (user?.publicMetadata?.role as UserRole) || 'employee';
  
  // Get effective role (preview role if in preview mode, otherwise actual role)
  const effectiveRole = getEffectiveRole(actualRole);
  const permissions = getEffectivePermissions(actualRole);
  
  return {
    actualRole,
    effectiveRole,
    permissions,
    isInPreview,
    previewRole,
    isAdmin: actualRole === 'admin',
    canPreview: actualRole === 'admin', // Only admins can preview other roles
  };
}
