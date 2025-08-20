/**
 * Re-export all access control hooks from a single entry point
 */

export { usePermissions } from './usePermissions';
export type { AppRole } from './usePermissions';

export { 
  useHasPermission, 
  useHasRole, 
  useHasAnyRole, 
  useAtLeastRole,
  useAbility 
} from './useRoleBasedAccess';

// Re-export permission constants
export { PERMISSIONS, ROLE_LEVELS, PERMISSION_GROUPS } from '../permissions';
export type { Permission } from '../permissions';