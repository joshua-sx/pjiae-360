// Type definitions for configuration system
import type { Database } from '@/integrations/supabase/types';
import type { ComponentName } from './components';
import type { LucideIcon } from 'lucide-react';

export type AppRole = Database['public']['Enums']['app_role'];

export interface RouteConfig {
  path: string;
  component: ComponentName;
  roles: AppRole[];
  title?: string;
  description?: string;
  isProtected?: boolean;
}

export interface NavigationItem {
  title: string;
  url: string;
  icon: LucideIcon;
  roles: AppRole[];
  group: string;
  order?: number;
  isNested?: boolean;
  children?: NavigationItem[];
}

export interface NavigationGroup {
  title: string;
  items: Omit<NavigationItem, 'group' | 'roles'>[];
}

export interface RolePermissions {
  canAccessAdmin: boolean;
  canAccessReports: boolean;
  canManageEmployees: boolean;
  canManageRoles: boolean;
  canViewAnalytics: boolean;
  canCreateGoals: boolean;
  canCreateAppraisals: boolean;
}

// Configuration validation interfaces
export interface ConfigValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface RouteValidation extends ConfigValidation {
  duplicatePaths: string[];
  invalidComponents: string[];
  invalidRoles: string[];
}

export interface NavigationValidation extends ConfigValidation {
  duplicateUrls: string[];
  invalidIcons: string[];
  missingGroups: string[];
}