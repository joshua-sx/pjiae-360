import type { Database } from '@/integrations/supabase/types';

export type AppRole = Database['public']['Enums']['app_role'];

export interface RolePermissions {
  canAccessAdmin: boolean;
  canAccessReports: boolean;
  canManageEmployees: boolean;
  canManageRoles: boolean;
  canViewAnalytics: boolean;
  canCreateGoals: boolean;
  canCreateAppraisals: boolean;
}