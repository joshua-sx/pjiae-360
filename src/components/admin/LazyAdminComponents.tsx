import { lazy } from 'react';

// Lazy load admin components for better performance
export const LazyEmployeesPage = lazy(() => import('./employees/EmployeesPage'));
export const LazyEmployeeImportPage = lazy(() => import('./employees/EmployeeImportPage'));
export const LazyAdminDashboard = lazy(() => import('./AdminDashboard'));
export const LazyAppraisalsPage = lazy(() => import('./appraisals/AdminAppraisalsPage'));
export const LazyGoalsPage = lazy(() => import('./goals/AdminGoalsPage'));
export const LazyReportsPage = lazy(() => import('./reports/ReportsPage'));
export const LazySettingsPage = lazy(() => import('./settings/SettingsPage'));
export const LazyAuditLogPage = lazy(() => import('./audit/AuditLogPage'));
export const LazyNotificationsPage = lazy(() => import('./notifications/NotificationsPage'));
export const LazyRolesPage = lazy(() => import('./roles/RolesPage'));
export const LazyOrganizationPage = lazy(() => import('./organization/OrganizationPage'));
export const LazyAppraisalCyclesPage = lazy(() => import('./cycles/AppraisalCyclesPage'));