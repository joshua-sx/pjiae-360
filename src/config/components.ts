// Centralized lazy component imports for better organization
import { lazy } from 'react';

// Dashboard
export const Dashboard = lazy(() => import('@/components/Dashboard'));

// Admin components
export const LazyEmployeesPage = lazy(() => import('@/components/admin/employees/EmployeesPage'));
export const LazyEmployeeImportPage = lazy(() => import('@/components/admin/employees/EmployeeImportPage'));
export const LazyAppraisalCyclesPage = lazy(() => import('@/components/admin/cycles/AppraisalCyclesPage'));
export const LazyReportsPage = lazy(() => import('@/components/admin/reports/ReportsPage'));
export const LazyRolesPage = lazy(() => import('@/components/admin/roles/RolesPage'));
export const LazyRoleManagementPage = lazy(() => import('@/components/admin/roles/RoleManagementPage'));
export const LazyOrganizationPage = lazy(() => import('@/components/admin/organization/OrganizationPage'));
export const LazyAuditLogPage = lazy(() => import('@/components/admin/audit/AuditLogPage'));
export const LazyNotificationsPage = lazy(() => import('@/components/admin/notifications/NotificationsPage'));
export const LazySettingsPage = lazy(() => import('@/components/admin/settings/SettingsPage'));
export const LazyAdminGoalsPage = lazy(() => import('@/components/admin/goals/AdminGoalsPage'));
export const LazyAdminAppraisalsPage = lazy(() => import('@/components/admin/appraisals/AdminAppraisalsPage'));

// Operational components
export const LazyGoalsPage = lazy(() => import('@/components/GoalsPage'));
export const LazyAppraisalsPage = lazy(() => import('@/components/AppraisalsPage'));
export const LazyCalendarPage = lazy(() => import('@/components/CalendarPage'));
export const LazyNewAppraisalPage = lazy(() => import('@/components/NewAppraisalPage'));
export const LazyCreateGoalPage = lazy(() => import('@/components/CreateGoalPage'));

// Role-based components
export const LazyPersonalGoalsPage = lazy(() => import('@/components/personal/PersonalGoalsPage'));
export const LazyPersonalAppraisalsPage = lazy(() => import('@/components/personal/PersonalAppraisalsPage'));
export const LazyTeamGoalsPage = lazy(() => import('@/components/team/TeamGoalsPage'));
export const LazyTeamAppraisalsPage = lazy(() => import('@/components/team/TeamAppraisalsPage'));
export const LazyTeamAnalyticsPage = lazy(() => import('@/components/analytics/TeamAnalyticsPage'));
export const LazyDivisionAnalyticsPage = lazy(() => import('@/components/analytics/DivisionAnalyticsPage'));

// Employee components
export const LazyEmployeeGoalsPage = lazy(() => import('@/components/employee/EmployeeGoalsPage'));
export const LazyEmployeeAppraisalsPage = lazy(() => import('@/components/employee/EmployeeAppraisalsPage'));
export const LazyEmployeeCalendarPage = lazy(() => import('@/components/employee/EmployeeCalendarPage'));

// Manager components
export const LazyManagerPersonalSection = lazy(() => import('@/components/manager/ManagerPersonalSection'));
export const LazyManagerTeamSection = lazy(() => import('@/components/manager/ManagerTeamSection'));

// Component registry for easy lookup
export const componentRegistry = {
  Dashboard,
  LazyEmployeesPage,
  LazyEmployeeImportPage,
  LazyAppraisalCyclesPage,
  LazyReportsPage,
  LazyRolesPage,
  LazyRoleManagementPage,
  LazyOrganizationPage,
  LazyAuditLogPage,
  LazyNotificationsPage,
  LazySettingsPage,
  LazyAdminGoalsPage,
  LazyAdminAppraisalsPage,
  LazyGoalsPage,
  LazyAppraisalsPage,
  LazyCalendarPage,
  LazyNewAppraisalPage,
  LazyCreateGoalPage,
  LazyPersonalGoalsPage,
  LazyPersonalAppraisalsPage,
  LazyTeamGoalsPage,
  LazyTeamAppraisalsPage,
  LazyTeamAnalyticsPage,
  LazyDivisionAnalyticsPage,
  LazyEmployeeGoalsPage,
  LazyEmployeeAppraisalsPage,
  LazyEmployeeCalendarPage,
  LazyManagerPersonalSection,
  LazyManagerTeamSection,
} as const;

export type ComponentName = keyof typeof componentRegistry;