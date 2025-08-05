import type { Database } from '@/integrations/supabase/types';
import type { ComponentName } from './components';

type AppRole = Database['public']['Enums']['app_role'];

export interface RouteConfig {
  path: string;
  component: ComponentName;
  roles: AppRole[];
  title?: string;
  description?: string;
}

// Centralized route configuration - single source of truth
export const routeConfig: RouteConfig[] = [
  // Dashboard routes (all roles)
  {
    path: '/:role/dashboard',
    component: 'DashboardRoute',
    roles: ['admin', 'director', 'manager', 'supervisor', 'employee'],
    title: 'Dashboard',
    description: 'Main dashboard view'
  },

  // Admin-specific routes
  {
    path: '/admin/goals',
    component: 'LazyAdminGoalsPage',
    roles: ['admin'],
    title: 'Goals Management',
    description: 'Manage organizational goals'
  },
  {
    path: '/admin/appraisals',
    component: 'LazyAdminAppraisalsPage',
    roles: ['admin'],
    title: 'Appraisals Management',
    description: 'Manage organizational appraisals'
  },
  {
    path: '/admin/calendar',
    component: 'LazyCalendarPage',
    roles: ['admin'],
    title: 'Calendar',
    description: 'View organizational calendar'
  },
  {
    path: '/admin/employees',
    component: 'LazyEmployeesPage',
    roles: ['admin'],
    title: 'Employee Management',
    description: 'Manage employees'
  },
  {
    path: '/admin/employees/import',
    component: 'LazyEmployeeImportPage',
    roles: ['admin'],
    title: 'Import Employees',
    description: 'Import employees from external sources'
  },
  {
    path: '/admin/cycles',
    component: 'LazyAppraisalCyclesPage',
    roles: ['admin'],
    title: 'Appraisal Cycles',
    description: 'Manage appraisal cycles'
  },
  {
    path: '/admin/reports',
    component: 'LazyReportsPage',
    roles: ['admin'],
    title: 'Reports',
    description: 'View organizational reports'
  },
  {
    path: '/admin/roles',
    component: 'LazyRolesPage',
    roles: ['admin'],
    title: 'Role Management',
    description: 'Manage user roles'
  },
  {
    path: '/admin/roles/manage',
    component: 'LazyRoleManagementPage',
    roles: ['admin'],
    title: 'Role Assignment',
    description: 'Assign roles to users'
  },
  {
    path: '/admin/organization',
    component: 'LazyOrganizationPage',
    roles: ['admin'],
    title: 'Organization',
    description: 'Manage organization structure'
  },
  {
    path: '/admin/audit',
    component: 'LazyAuditLogPage',
    roles: ['admin'],
    title: 'Audit Log',
    description: 'View system audit logs'
  },
  {
    path: '/admin/notifications',
    component: 'LazyNotificationsPage',
    roles: ['admin'],
    title: 'Notifications',
    description: 'Manage system notifications'
  },
  {
    path: '/admin/settings',
    component: 'LazySettingsPage',
    roles: ['admin'],
    title: 'Settings',
    description: 'System settings'
  },

  // Director routes
  {
    path: '/director/employees',
    component: 'LazyEmployeesPage',
    roles: ['director'],
    title: 'Employees',
    description: 'View and manage employees'
  },
  {
    path: '/director/employees/import',
    component: 'LazyEmployeeImportPage',
    roles: ['director'],
    title: 'Import Employees',
    description: 'Import employees'
  },
  {
    path: '/director/goals',
    component: 'LazyGoalsPage',
    roles: ['director'],
    title: 'Goals',
    description: 'View organizational goals'
  },
  {
    path: '/director/appraisals',
    component: 'LazyAdminAppraisalsPage',
    roles: ['director'],
    title: 'Appraisals',
    description: 'View organizational appraisals'
  },
  {
    path: '/director/analytics',
    component: 'LazyDivisionAnalyticsPage',
    roles: ['director'],
    title: 'Analytics',
    description: 'Division analytics'
  },
  {
    path: '/director/calendar',
    component: 'LazyCalendarPage',
    roles: ['director'],
    title: 'Calendar',
    description: 'View calendar'
  },

  // Manager routes
  {
    path: '/manager/personal',
    component: 'LazyManagerPersonalSection',
    roles: ['manager'],
    title: 'Personal',
    description: 'Personal management section'
  },
  {
    path: '/manager/team',
    component: 'LazyManagerTeamSection',
    roles: ['manager'],
    title: 'Team',
    description: 'Team management section'
  },
  {
    path: '/manager/team/goals',
    component: 'LazyTeamGoalsPage',
    roles: ['manager'],
    title: 'Team Goals',
    description: 'Manage team goals'
  },
  {
    path: '/manager/team/appraisals',
    component: 'LazyTeamAppraisalsPage',
    roles: ['manager'],
    title: 'Team Appraisals',
    description: 'Manage team appraisals'
  },
  {
    path: '/manager/analytics',
    component: 'LazyTeamAnalyticsPage',
    roles: ['manager'],
    title: 'Analytics',
    description: 'Team analytics'
  },
  {
    path: '/manager/calendar',
    component: 'LazyCalendarPage',
    roles: ['manager'],
    title: 'Calendar',
    description: 'View calendar'
  },

  // Supervisor routes
  {
    path: '/supervisor/personal',
    component: 'LazyManagerPersonalSection',
    roles: ['supervisor'],
    title: 'Personal',
    description: 'Personal management section'
  },
  {
    path: '/supervisor/team',
    component: 'LazyManagerTeamSection',
    roles: ['supervisor'],
    title: 'Team',
    description: 'Team management section'
  },
  {
    path: '/supervisor/team/goals',
    component: 'LazyTeamGoalsPage',
    roles: ['supervisor'],
    title: 'Team Goals',
    description: 'Manage team goals'
  },
  {
    path: '/supervisor/team/appraisals',
    component: 'LazyTeamAppraisalsPage',
    roles: ['supervisor'],
    title: 'Team Appraisals',
    description: 'Manage team appraisals'
  },
  {
    path: '/supervisor/analytics',
    component: 'LazyTeamAnalyticsPage',
    roles: ['supervisor'],
    title: 'Analytics',
    description: 'Team analytics'
  },
  {
    path: '/supervisor/calendar',
    component: 'LazyCalendarPage',
    roles: ['supervisor'],
    title: 'Calendar',
    description: 'View calendar'
  },

  // Employee routes
  {
    path: '/employee/goals',
    component: 'LazyEmployeeGoalsPage',
    roles: ['employee'],
    title: 'Goals',
    description: 'View and manage personal goals'
  },
  {
    path: '/employee/appraisals',
    component: 'LazyEmployeeAppraisalsPage',
    roles: ['employee'],
    title: 'Appraisals',
    description: 'View and manage personal appraisals'
  },
  {
    path: '/employee/calendar',
    component: 'LazyEmployeeCalendarPage',
    roles: ['employee'],
    title: 'Calendar',
    description: 'View personal calendar'
  },
];

// Utility functions for working with routes
export const getRoutesByRole = (role: AppRole): RouteConfig[] => {
  return routeConfig.filter(route => route.roles.includes(role));
};

export const getRouteByPath = (path: string): RouteConfig | undefined => {
  return routeConfig.find(route => route.path === path);
};

export const getAllRoles = (): AppRole[] => {
  const roleSet = new Set<AppRole>();
  routeConfig.forEach(route => {
    route.roles.forEach(role => roleSet.add(role));
  });
  return Array.from(roleSet);
};