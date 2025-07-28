
import { Toaster } from "@/components/ui/toaster";
import { ProfilePage } from "@/components/profile/ProfilePage";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import { AuthDebugPanel } from "./components/auth/AuthDebugPanel";
import { SecurityMonitoringProvider } from "./components/providers/SecurityMonitoringProvider";

import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

// Import routing components
import { AuthenticatedRoute } from "./components/routing/AuthenticatedRoute";
import { EnhancedRoleProtectedRoute } from "./components/routing/RoleProtectedRoute";
import { LegacyRouteRedirect } from "./components/routing/LegacyRouteRedirect";
import { NavigationProvider } from "./components/providers/NavigationProvider";
import { SidebarStateProvider } from "./components/providers/SidebarStateProvider";
import { AppLayout } from "./components/layouts/AppLayout";

// Import lazy admin components
import {
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
  LazyAdminAppraisalsPage
} from "./components/admin/LazyAdminComponents";

// Import lazy operational components
import {
  LazyGoalsPage,
  LazyAppraisalsPage,
  LazyCalendarPage,
  LazyNewAppraisalPage,
  LazyCreateGoalPage
} from "./components/LazyOperationalComponents";

// Dynamic role-based route component
interface RoleRouteProps {
  path: string;
  component: React.ComponentType;
  roles: string[];
}

const RoleRoute = ({ path, component: Component, roles }: RoleRouteProps) => (
  <Route 
    path={path}
    element={
      <EnhancedRoleProtectedRoute requiredRoles={roles as any}>
        <Component />
      </EnhancedRoleProtectedRoute>
    } 
  />
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthDebugPanel />
      <BrowserRouter>
        <NavigationProvider>
          <SidebarStateProvider>
            <SecurityMonitoringProvider>
            <AppLayout>
              <LegacyRouteRedirect />
              <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/log-in" element={<AuthPage />} />
            <Route path="/create-account" element={<AuthPage isSignUp={true} />} />
            {/* Onboarding temporarily disabled - needs components that don't exist */}
            {/* <Route path="/onboarding" element={<div>Onboarding coming soon</div>} /> */}
            
            {/* Dynamic Role-Based Routes - Consolidates all role duplication */}
            
            {/* Dashboard routes for all roles */}
            {['admin', 'director', 'manager', 'supervisor', 'employee'].map(role => (
              <Route 
                key={`${role}-dashboard`}
                path={`/${role}/dashboard`} 
                element={
                  <EnhancedRoleProtectedRoute requiredRoles={[role as any]}>
                    <Dashboard />
                  </EnhancedRoleProtectedRoute>
                } 
              />
            ))}

            {/* Admin-specific routes */}
            <RoleRoute path="/admin/goals" component={LazyAdminGoalsPage} roles={['admin']} />
            <RoleRoute path="/admin/goals/new" component={LazyCreateGoalPage} roles={['admin']} />
            <RoleRoute path="/admin/appraisals" component={LazyAdminAppraisalsPage} roles={['admin']} />
            <RoleRoute path="/admin/appraisals/new" component={LazyNewAppraisalPage} roles={['admin']} />
            <RoleRoute path="/admin/calendar" component={LazyCalendarPage} roles={['admin']} />
            <RoleRoute path="/admin/employees" component={LazyEmployeesPage} roles={['admin']} />
            <RoleRoute path="/admin/employees/import" component={LazyEmployeeImportPage} roles={['admin']} />
            <RoleRoute path="/admin/cycles" component={LazyAppraisalCyclesPage} roles={['admin']} />
            <RoleRoute path="/admin/reports" component={LazyReportsPage} roles={['admin']} />
            <RoleRoute path="/admin/roles" component={LazyRolesPage} roles={['admin']} />
            <RoleRoute path="/admin/roles/manage" component={LazyRoleManagementPage} roles={['admin']} />
            <RoleRoute path="/admin/organization" component={LazyOrganizationPage} roles={['admin']} />
            <RoleRoute path="/admin/audit" component={LazyAuditLogPage} roles={['admin']} />
            <RoleRoute path="/admin/notifications" component={LazyNotificationsPage} roles={['admin']} />
            <RoleRoute path="/admin/settings" component={LazySettingsPage} roles={['admin']} />

            {/* Director routes (admin-level access) */}
            <RoleRoute path="/director/goals" component={LazyAdminGoalsPage} roles={['director']} />
            <RoleRoute path="/director/goals/new" component={LazyCreateGoalPage} roles={['director']} />
            <RoleRoute path="/director/appraisals" component={LazyAdminAppraisalsPage} roles={['director']} />
            <RoleRoute path="/director/appraisals/new" component={LazyNewAppraisalPage} roles={['director']} />
            <RoleRoute path="/director/calendar" component={LazyCalendarPage} roles={['director']} />
            <RoleRoute path="/director/employees" component={LazyEmployeesPage} roles={['director']} />
            <RoleRoute path="/director/employees/import" component={LazyEmployeeImportPage} roles={['director']} />
            <RoleRoute path="/director/cycles" component={LazyAppraisalCyclesPage} roles={['director']} />
            <RoleRoute path="/director/reports" component={LazyReportsPage} roles={['director']} />
            <RoleRoute path="/director/roles" component={LazyRolesPage} roles={['director']} />
            <RoleRoute path="/director/organization" component={LazyOrganizationPage} roles={['director']} />
            <RoleRoute path="/director/audit" component={LazyAuditLogPage} roles={['director']} />
            <RoleRoute path="/director/notifications" component={LazyNotificationsPage} roles={['director']} />
            <RoleRoute path="/director/settings" component={LazySettingsPage} roles={['director']} />

            {/* Manager routes (operational access) */}
            <RoleRoute path="/manager/goals" component={LazyGoalsPage} roles={['manager']} />
            <RoleRoute path="/manager/goals/new" component={LazyCreateGoalPage} roles={['manager']} />
            <RoleRoute path="/manager/appraisals" component={LazyAppraisalsPage} roles={['manager']} />
            <RoleRoute path="/manager/appraisals/new" component={LazyNewAppraisalPage} roles={['manager']} />
            <RoleRoute path="/manager/calendar" component={LazyCalendarPage} roles={['manager']} />

            {/* Supervisor routes (limited operational access) */}
            <RoleRoute path="/supervisor/goals" component={LazyGoalsPage} roles={['supervisor']} />
            <RoleRoute path="/supervisor/appraisals" component={LazyAppraisalsPage} roles={['supervisor']} />
            <RoleRoute path="/supervisor/appraisals/new" component={LazyNewAppraisalPage} roles={['supervisor']} />
            <RoleRoute path="/supervisor/calendar" component={LazyCalendarPage} roles={['supervisor']} />

            {/* Employee routes (basic access) */}
            <RoleRoute path="/employee/goals" component={LazyGoalsPage} roles={['employee']} />
            <RoleRoute path="/employee/appraisals" component={LazyAppraisalsPage} roles={['employee']} />
            <RoleRoute path="/employee/calendar" component={LazyCalendarPage} roles={['employee']} />

            {/* Legacy redirects for backwards compatibility */}
            <Route path="/dashboard" element={<AuthenticatedRoute><Dashboard /></AuthenticatedRoute>} />
            <Route path="/admin" element={<AuthenticatedRoute><Dashboard /></AuthenticatedRoute>} />
            
            <Route 
              path="/profile" 
              element={<ProfilePage />}
            />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
            </SecurityMonitoringProvider>
          </SidebarStateProvider>
        </NavigationProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
