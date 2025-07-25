
import { Toaster } from "@/components/ui/toaster";
import { ProfilePage } from "@/components/profile/ProfilePage";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { AuthDebugPanel } from "./components/auth/AuthDebugPanel";
import { SecurityMonitoringProvider } from "./components/providers/SecurityMonitoringProvider";

import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import LazyOnboardingFlow from "./components/LazyOnboardingFlow";
import OnboardingProtectedRoute from "./components/OnboardingProtectedRoute";
import NotFound from "./pages/NotFound";
import AppraisalsPage from "./components/AppraisalsPage";
import NewAppraisalPage from "./components/NewAppraisalPage";
import GoalsPage from "./components/GoalsPage";
import CreateGoalPage from "./components/CreateGoalPage";
import CalendarPage from "./components/CalendarPage";
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
  LazyAdminDashboard,
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
            <Route path="/onboarding" element={
              <OnboardingProtectedRoute>
                <LazyOnboardingFlow />
              </OnboardingProtectedRoute>
            } />
            
            {/* Role-Based Routes */}
            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["admin"]}>
                  <Dashboard />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/goals" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["admin"]}>
                  <LazyAdminGoalsPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/goals/new" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["admin"]}>
                  <LazyCreateGoalPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/appraisals" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["admin"]}>
                  <LazyAdminAppraisalsPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/appraisals/new" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["admin"]}>
                  <LazyNewAppraisalPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/calendar" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["admin"]}>
                  <LazyCalendarPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/employees" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["admin"]}>
                  <LazyEmployeesPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/employees/import" 
              element={
                 <EnhancedRoleProtectedRoute requiredRoles={["admin"]}>
                   <LazyEmployeeImportPage />
                 </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/cycles" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["admin"]}>
                  <LazyAppraisalCyclesPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/reports" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["admin"]}>
                  <LazyReportsPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/roles" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["admin"]}>
                  <LazyRolesPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/roles/manage" 
              element={
                 <EnhancedRoleProtectedRoute requiredRoles={["admin"]}>
                   <LazyRoleManagementPage />
                 </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/organization" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["admin"]}>
                  <LazyOrganizationPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/audit" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["admin"]}>
                  <LazyAuditLogPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/notifications" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["admin"]}>
                  <LazyNotificationsPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["admin"]}>
                  <LazySettingsPage />
                </EnhancedRoleProtectedRoute>
              } 
            />

            {/* Director Routes */}
            <Route 
              path="/director/dashboard" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["director"]}>
                  <Dashboard />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/director/goals" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["director"]}>
                  <LazyAdminGoalsPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/director/goals/new" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["director"]}>
                  <LazyCreateGoalPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/director/appraisals" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["director"]}>
                  <LazyAdminAppraisalsPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/director/appraisals/new" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["director"]}>
                  <LazyNewAppraisalPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/director/calendar" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["director"]}>
                  <LazyCalendarPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/director/employees" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["director"]}>
                  <LazyEmployeesPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/director/employees/import" 
              element={
                 <EnhancedRoleProtectedRoute requiredRoles={["director"]}>
                   <LazyEmployeeImportPage />
                 </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/director/cycles" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["director"]}>
                  <LazyAppraisalCyclesPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/director/reports" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["director"]}>
                  <LazyReportsPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/director/roles" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["director"]}>
                  <LazyRolesPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/director/organization" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["director"]}>
                  <LazyOrganizationPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/director/audit" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["director"]}>
                  <LazyAuditLogPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/director/notifications" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["director"]}>
                  <LazyNotificationsPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/director/settings" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["director"]}>
                  <LazySettingsPage />
                </EnhancedRoleProtectedRoute>
              } 
            />

            {/* Manager Routes */}
            <Route 
              path="/manager/dashboard" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["manager"]}>
                  <Dashboard />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/manager/goals" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["manager"]}>
                  <LazyGoalsPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/manager/goals/new" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["manager"]}>
                  <LazyCreateGoalPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/manager/appraisals" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["manager"]}>
                  <LazyAppraisalsPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/manager/appraisals/new" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["manager"]}>
                  <LazyNewAppraisalPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/manager/calendar" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["manager"]}>
                  <LazyCalendarPage />
                </EnhancedRoleProtectedRoute>
              } 
            />

            {/* Supervisor Routes */}
            <Route 
              path="/supervisor/dashboard" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["supervisor"]}>
                  <Dashboard />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/supervisor/goals" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["supervisor"]}>
                  <LazyGoalsPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/supervisor/appraisals" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["supervisor"]}>
                  <LazyAppraisalsPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/supervisor/appraisals/new" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["supervisor"]}>
                  <LazyNewAppraisalPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/supervisor/calendar" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["supervisor"]}>
                  <LazyCalendarPage />
                </EnhancedRoleProtectedRoute>
              } 
            />

            {/* Employee Routes */}
            <Route 
              path="/employee/dashboard" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["employee"]}>
                  <Dashboard />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/employee/goals" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["employee"]}>
                  <LazyGoalsPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/employee/appraisals" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["employee"]}>
                  <LazyAppraisalsPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/employee/calendar" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["employee"]}>
                  <LazyCalendarPage />
                </EnhancedRoleProtectedRoute>
              } 
            />

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
