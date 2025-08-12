import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { EnhancedRoleProtectedRoute } from './EnhancedRoleProtectedRoute';
import { AuthenticatedLayout } from '../layouts/AuthenticatedLayout';

// Lazy load components
const LazyAdminGoalsPage = React.lazy(() => import('../LazyManagerGoalsDashboard'));
const LazyAdminAppraisalsPage = React.lazy(() => import('../admin/appraisals/AdminAppraisalsPage'));
const LazyEmployeesPage = React.lazy(() => import('../../pages/admin/employees/EmployeesPage'));
const LazyEmployeeImportPage = React.lazy(() => import('../admin/employees/EmployeeImportPage'));
const LazyOrganizationPage = React.lazy(() => import('../admin/organization/OrganizationPage'));
const LazyAppraisalCyclesPage = React.lazy(() => import('../admin/cycles/AppraisalCyclesPage'));
const LazyReportsPage = React.lazy(() => import('../admin/reports/ReportsPage'));
const LazyRolesPage = React.lazy(() => import('../admin/roles/RolesPage'));
const LazyRoleManagementPage = React.lazy(() => import('../admin/roles/RoleManagementPage'));
const LazyAuditLogPage = React.lazy(() => import('../admin/audit/AuditLogPage'));
const LazyNotificationsPage = React.lazy(() => import('../admin/notifications/NotificationsPage'));
const LazySettingsPage = React.lazy(() => import('../admin/settings/SettingsPage'));
const LazyJobTitleMappingsPage = React.lazy(() => import('../admin/settings/JobTitleMappingsPage'));
const LazyCalendarPage = React.lazy(() => import('../CalendarPage'));
const LazyCreateGoalPage = React.lazy(() => import('../CreateGoalPage'));
const LazyNewAppraisalPage = React.lazy(() => import('../NewAppraisalPage'));
const LazyTeamGoalsPage = React.lazy(() => import('../team/TeamGoalsPage'));
const LazyTeamAppraisalsPage = React.lazy(() => import('../team/TeamAppraisalsPage'));
const LazyEmployeeGoalsPage = React.lazy(() => import('../employee/EmployeeGoalsPage'));
const LazyEmployeeAppraisalsPage = React.lazy(() => import('../employee/EmployeeAppraisalsPage'));
const LazyEmployeeCalendarPage = React.lazy(() => import('../employee/EmployeeCalendarPage'));
const LazyManagerPersonalSection = React.lazy(() => import('../manager/ManagerPersonalSection'));
const LazyManagerTeamSection = React.lazy(() => import('../manager/ManagerTeamSection'));
const LazyPersonalGoalsPage = React.lazy(() => import('../personal/PersonalGoalsPage'));
const LazyPersonalAppraisalsPage = React.lazy(() => import('../personal/PersonalAppraisalsPage'));
const LazyDivisionAnalyticsPage = React.lazy(() => import('../analytics/DivisionAnalyticsPage'));
const LazyTeamAnalyticsPage = React.lazy(() => import('../analytics/TeamAnalyticsPage'));
const Dashboard = React.lazy(() => import('../Dashboard'));

// Layout wrapper that includes authenticated layout
function RoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthenticatedLayout>
      {children}
    </AuthenticatedLayout>
  );
}

export function NestedRoutes() {
  return (
    <Routes>
      {/* Admin Routes */}
      <Route path="/admin" element={<RoleLayout><Outlet /></RoleLayout>}>
        <Route path="dashboard" element={
          <EnhancedRoleProtectedRoute requiredRoles={['admin']}>
            <Dashboard />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="goals" element={
          <EnhancedRoleProtectedRoute requiredRoles={['admin']}>
            <LazyAdminGoalsPage />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="appraisals" element={
          <EnhancedRoleProtectedRoute requiredRoles={['admin']}>
            <LazyAdminAppraisalsPage />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="calendar" element={
          <EnhancedRoleProtectedRoute requiredRoles={['admin']}>
            <LazyCalendarPage />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="employees" element={
          <EnhancedRoleProtectedRoute requiredRoles={['admin']}>
            <LazyEmployeesPage />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="employees/import" element={
          <EnhancedRoleProtectedRoute requiredRoles={['admin']}>
            <LazyEmployeeImportPage />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="cycles" element={
          <EnhancedRoleProtectedRoute requiredRoles={['admin']}>
            <LazyAppraisalCyclesPage />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="reports" element={
          <EnhancedRoleProtectedRoute requiredRoles={['admin']}>
            <LazyReportsPage />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="roles" element={
          <EnhancedRoleProtectedRoute requiredRoles={['admin']}>
            <LazyRolesPage />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="roles/manage" element={
          <EnhancedRoleProtectedRoute requiredRoles={['admin']}>
            <LazyRoleManagementPage />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="organization" element={
          <EnhancedRoleProtectedRoute requiredRoles={['admin']}>
            <LazyOrganizationPage />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="audit" element={
          <EnhancedRoleProtectedRoute requiredRoles={['admin']}>
            <LazyAuditLogPage />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="notifications" element={
          <EnhancedRoleProtectedRoute requiredRoles={['admin']}>
            <LazyNotificationsPage />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="settings" element={
          <EnhancedRoleProtectedRoute requiredRoles={['admin']}>
            <LazySettingsPage />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="settings/job-title-mappings" element={
          <EnhancedRoleProtectedRoute requiredRoles={['admin']}>
            <LazyJobTitleMappingsPage />
          </EnhancedRoleProtectedRoute>
        } />
      </Route>

      {/* Director Routes */}
      <Route path="/director" element={<RoleLayout><Outlet /></RoleLayout>}>
        <Route path="dashboard" element={
          <EnhancedRoleProtectedRoute requiredRoles={['director']}>
            <Dashboard />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="employees" element={
          <EnhancedRoleProtectedRoute requiredRoles={['director']}>
            <LazyEmployeesPage />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="employees/import" element={
          <EnhancedRoleProtectedRoute requiredRoles={['director']}>
            <LazyEmployeeImportPage />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="goals" element={
          <EnhancedRoleProtectedRoute requiredRoles={['director']}>
            <LazyAdminGoalsPage />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="appraisals" element={
          <EnhancedRoleProtectedRoute requiredRoles={['director']}>
            <LazyAdminAppraisalsPage />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="analytics" element={
          <EnhancedRoleProtectedRoute requiredRoles={['director']}>
            <LazyDivisionAnalyticsPage />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="calendar" element={
          <EnhancedRoleProtectedRoute requiredRoles={['director']}>
            <LazyCalendarPage />
          </EnhancedRoleProtectedRoute>
        } />
      </Route>

      {/* Manager Routes */}
      <Route path="/manager" element={<RoleLayout><Outlet /></RoleLayout>}>
        <Route path="dashboard" element={
          <EnhancedRoleProtectedRoute requiredRoles={['manager']}>
            <Dashboard />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="personal" element={
          <EnhancedRoleProtectedRoute requiredRoles={['manager']}>
            <LazyManagerPersonalSection />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="personal/goals" element={
          <EnhancedRoleProtectedRoute requiredRoles={['manager']}>
            <LazyPersonalGoalsPage />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="personal/appraisals" element={
          <EnhancedRoleProtectedRoute requiredRoles={['manager']}>
            <LazyPersonalAppraisalsPage />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="team" element={
          <EnhancedRoleProtectedRoute requiredRoles={['manager']}>
            <LazyManagerTeamSection />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="team/goals" element={
          <EnhancedRoleProtectedRoute requiredRoles={['manager']}>
            <LazyTeamGoalsPage />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="team/goals/new" element={
          <EnhancedRoleProtectedRoute requiredRoles={['manager']}>
            <LazyCreateGoalPage />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="team/appraisals" element={
          <EnhancedRoleProtectedRoute requiredRoles={['manager']}>
            <LazyTeamAppraisalsPage />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="analytics" element={
          <EnhancedRoleProtectedRoute requiredRoles={['manager']}>
            <LazyTeamAnalyticsPage />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="calendar" element={
          <EnhancedRoleProtectedRoute requiredRoles={['manager']}>
            <LazyCalendarPage />
          </EnhancedRoleProtectedRoute>
        } />
      </Route>

      {/* Supervisor Routes */}
      <Route path="/supervisor" element={<RoleLayout><Outlet /></RoleLayout>}>
        <Route path="dashboard" element={
          <EnhancedRoleProtectedRoute requiredRoles={['supervisor']}>
            <Dashboard />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="personal" element={
          <EnhancedRoleProtectedRoute requiredRoles={['supervisor']}>
            <LazyManagerPersonalSection />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="personal/goals" element={
          <EnhancedRoleProtectedRoute requiredRoles={['supervisor']}>
            <LazyPersonalGoalsPage />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="personal/appraisals" element={
          <EnhancedRoleProtectedRoute requiredRoles={['supervisor']}>
            <LazyPersonalAppraisalsPage />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="team" element={
          <EnhancedRoleProtectedRoute requiredRoles={['supervisor']}>
            <LazyManagerTeamSection />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="team/goals" element={
          <EnhancedRoleProtectedRoute requiredRoles={['supervisor']}>
            <LazyTeamGoalsPage />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="team/goals/new" element={
          <EnhancedRoleProtectedRoute requiredRoles={['supervisor']}>
            <LazyCreateGoalPage />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="team/appraisals" element={
          <EnhancedRoleProtectedRoute requiredRoles={['supervisor']}>
            <LazyTeamAppraisalsPage />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="analytics" element={
          <EnhancedRoleProtectedRoute requiredRoles={['supervisor']}>
            <LazyTeamAnalyticsPage />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="calendar" element={
          <EnhancedRoleProtectedRoute requiredRoles={['supervisor']}>
            <LazyCalendarPage />
          </EnhancedRoleProtectedRoute>
        } />
      </Route>

      {/* Employee Routes */}
      <Route path="/employee" element={<RoleLayout><Outlet /></RoleLayout>}>
        <Route path="dashboard" element={
          <EnhancedRoleProtectedRoute requiredRoles={['employee']}>
            <Dashboard />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="goals" element={
          <EnhancedRoleProtectedRoute requiredRoles={['employee']}>
            <LazyEmployeeGoalsPage />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="appraisals" element={
          <EnhancedRoleProtectedRoute requiredRoles={['employee']}>
            <LazyEmployeeAppraisalsPage />
          </EnhancedRoleProtectedRoute>
        } />
        <Route path="calendar" element={
          <EnhancedRoleProtectedRoute requiredRoles={['employee']}>
            <LazyEmployeeCalendarPage />
          </EnhancedRoleProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}