
import { Toaster } from "@/components/ui/toaster";
import { ProfilePage } from "@/components/profile/ProfilePage";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import { AuthDebugPanel } from "./components/auth/AuthDebugPanel";
import { SecurityMonitoringProvider } from "./components/providers/SecurityMonitoringProvider";
import { DemoModeProvider } from "./contexts/DemoModeContext";

import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import VerifyEmail from "./pages/VerifyEmail";

// Import routing components
import { AuthenticatedRoute } from "./components/routing/AuthenticatedRoute";
import { EnhancedRoleProtectedRoute } from "./components/routing/RoleProtectedRoute";
import { LegacyRouteRedirect } from "./components/routing/LegacyRouteRedirect";
import { NavigationProvider } from "./components/providers/NavigationProvider";
import { SidebarStateProvider } from "./components/providers/SidebarStateProvider";
import { AppLayout } from "./components/layouts/AppLayout";

// Import onboarding components
import OnboardingProtectedRoute from "./components/OnboardingProtectedRoute";
import LazyOnboardingFlow from "./components/LazyOnboardingFlow";

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

// Import lazy role-based components
import {
  LazyPersonalGoalsPage,
  LazyPersonalAppraisalsPage,
  LazyTeamGoalsPage,
  LazyTeamAppraisalsPage,
  LazyTeamAnalyticsPage,
  LazyDivisionAnalyticsPage
} from "./components/LazyRoleBasedComponents";

// Import lazy employee components
import {
  LazyEmployeeGoalsPage,
  LazyEmployeeAppraisalsPage,
  LazyEmployeeCalendarPage
} from "./components/LazyEmployeeComponents";

// Import lazy manager components
import {
  LazyManagerPersonalSection,
  LazyManagerTeamSection
} from "./components/LazyManagerComponents";

// Helper function to create role-protected routes
const createRoleRoute = (path: string, Component: React.ComponentType, roles: string[]) => (
  <Route 
    key={path}
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
      <BrowserRouter>
        <DemoModeProvider>
          <AuthDebugPanel />
          <NavigationProvider>
            <SidebarStateProvider>
              <SecurityMonitoringProvider>
                <AppLayout>
                  <LegacyRouteRedirect />
              <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/log-in" element={<AuthPage />} />
            <Route path="/create-account" element={<AuthPage isSignUp={true} />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route
              path="/onboarding" 
              element={
                <OnboardingProtectedRoute>
                  <LazyOnboardingFlow />
                </OnboardingProtectedRoute>
              } 
            />
            
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
            {createRoleRoute("/admin/goals", LazyAdminGoalsPage, ['admin'])}
            {createRoleRoute("/admin/goals/new", LazyCreateGoalPage, ['admin'])}
            {createRoleRoute("/admin/appraisals", LazyAdminAppraisalsPage, ['admin'])}
            {createRoleRoute("/admin/appraisals/new", LazyNewAppraisalPage, ['admin'])}
            {createRoleRoute("/admin/calendar", LazyCalendarPage, ['admin'])}
            {createRoleRoute("/admin/employees", LazyEmployeesPage, ['admin'])}
            {createRoleRoute("/admin/employees/import", LazyEmployeeImportPage, ['admin'])}
            {createRoleRoute("/admin/cycles", LazyAppraisalCyclesPage, ['admin'])}
            {createRoleRoute("/admin/reports", LazyReportsPage, ['admin'])}
            {createRoleRoute("/admin/roles", LazyRolesPage, ['admin'])}
            {createRoleRoute("/admin/roles/manage", LazyRoleManagementPage, ['admin'])}
            {createRoleRoute("/admin/organization", LazyOrganizationPage, ['admin'])}
            {createRoleRoute("/admin/audit", LazyAuditLogPage, ['admin'])}
            {createRoleRoute("/admin/notifications", LazyNotificationsPage, ['admin'])}
            {createRoleRoute("/admin/settings", LazySettingsPage, ['admin'])}

            {/* Director routes (role-based structure with analytics) */}
            {createRoleRoute("/director/personal", LazyManagerPersonalSection, ['director'])}
            {createRoleRoute("/director/team", LazyManagerTeamSection, ['director'])}
            {createRoleRoute("/director/team/goals", LazyTeamGoalsPage, ['director'])}
            {createRoleRoute("/director/team/appraisals", LazyTeamAppraisalsPage, ['director'])}
            {createRoleRoute("/director/team/goals/new", LazyCreateGoalPage, ['director'])}
            {createRoleRoute("/director/team/appraisals/new", LazyNewAppraisalPage, ['director'])}
            {createRoleRoute("/director/analytics", LazyDivisionAnalyticsPage, ['director'])}
            {createRoleRoute("/director/calendar", LazyCalendarPage, ['director'])}
            {createRoleRoute("/director/goals", LazyAdminGoalsPage, ['director'])}
            {createRoleRoute("/director/appraisals", LazyAdminAppraisalsPage, ['director'])}
            {createRoleRoute("/director/employees", LazyEmployeesPage, ['director'])}
            {createRoleRoute("/director/employees/import", LazyEmployeeImportPage, ['director'])}
            {createRoleRoute("/director/cycles", LazyAppraisalCyclesPage, ['director'])}
            {createRoleRoute("/director/reports", LazyReportsPage, ['director'])}
            {createRoleRoute("/director/roles", LazyRolesPage, ['director'])}
            {createRoleRoute("/director/organization", LazyOrganizationPage, ['director'])}
            {createRoleRoute("/director/audit", LazyAuditLogPage, ['director'])}
            {createRoleRoute("/director/notifications", LazyNotificationsPage, ['director'])}
            {createRoleRoute("/director/settings", LazySettingsPage, ['director'])}

            {/* Manager routes (role-based structure) */}
            {createRoleRoute("/manager/personal", LazyManagerPersonalSection, ['manager'])}
            {createRoleRoute("/manager/team", LazyManagerTeamSection, ['manager'])}
            {createRoleRoute("/manager/team/goals", LazyTeamGoalsPage, ['manager'])}
            {createRoleRoute("/manager/team/appraisals", LazyTeamAppraisalsPage, ['manager'])}
            {createRoleRoute("/manager/team/goals/new", LazyCreateGoalPage, ['manager'])}
            {createRoleRoute("/manager/team/appraisals/new", LazyNewAppraisalPage, ['manager'])}
            {createRoleRoute("/manager/analytics", LazyTeamAnalyticsPage, ['manager'])}
            {createRoleRoute("/manager/calendar", LazyCalendarPage, ['manager'])}

            {/* Supervisor routes (role-based structure) */}
            {createRoleRoute("/supervisor/personal", LazyManagerPersonalSection, ['supervisor'])}
            {createRoleRoute("/supervisor/team", LazyManagerTeamSection, ['supervisor'])}
            {createRoleRoute("/supervisor/team/goals", LazyTeamGoalsPage, ['supervisor'])}
            {createRoleRoute("/supervisor/team/appraisals", LazyTeamAppraisalsPage, ['supervisor'])}
            {createRoleRoute("/supervisor/team/goals/new", LazyCreateGoalPage, ['supervisor'])}
            {createRoleRoute("/supervisor/team/appraisals/new", LazyNewAppraisalPage, ['supervisor'])}
            {createRoleRoute("/supervisor/analytics", LazyTeamAnalyticsPage, ['supervisor'])}
            {createRoleRoute("/supervisor/calendar", LazyCalendarPage, ['supervisor'])}

            {/* Employee routes (specialized for employees) */}
            {createRoleRoute("/employee/goals", LazyEmployeeGoalsPage, ['employee'])}
            {createRoleRoute("/employee/appraisals", LazyEmployeeAppraisalsPage, ['employee'])}
            {createRoleRoute("/employee/calendar", LazyEmployeeCalendarPage, ['employee'])}

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
        </DemoModeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
