
import { Toaster } from "@/components/ui/toaster";
import { ProfilePage } from "@/components/profile/ProfilePage";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { AuthDebugPanel } from "./components/auth/AuthDebugPanel";

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
import { NavigationProvider } from "./components/providers/NavigationProvider";

// Import lazy admin components
import {
  LazyAdminDashboard,
  LazyEmployeesPage,
  LazyEmployeeImportPage,
  LazyAppraisalCyclesPage,
  LazyReportsPage,
  LazyRolesPage,
  LazyOrganizationPage,
  LazyAuditLogPage,
  LazyNotificationsPage,
  LazySettingsPage,
  LazyAdminGoalsPage,
  LazyAppraisalsPage
} from "./components/admin/LazyAdminComponents";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthDebugPanel />
      <BrowserRouter>
        <NavigationProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/log-in" element={<AuthPage />} />
            <Route path="/create-account" element={<AuthPage isSignUp={true} />} />
            <Route path="/onboarding" element={
              <OnboardingProtectedRoute>
                <LazyOnboardingFlow />
              </OnboardingProtectedRoute>
            } />
            
            {/* Main App Routes */}
            <Route 
              path="/dashboard" 
              element={
                <AuthenticatedRoute>
                  <Dashboard />
                </AuthenticatedRoute>
              } 
            />
            <Route 
              path="/goals" 
              element={
                <AuthenticatedRoute>
                  <GoalsPage />
                </AuthenticatedRoute>
              } 
            />
            <Route 
              path="/goals/new" 
              element={
                <EnhancedRoleProtectedRoute requiredPermissions={["canManageGoals"]}>
                  <CreateGoalPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/appraisals" 
              element={
                <AuthenticatedRoute>
                  <AppraisalsPage />
                </AuthenticatedRoute>
              } 
            />
            <Route 
              path="/appraisals/new" 
              element={
                <EnhancedRoleProtectedRoute requiredPermissions={["canCreateAppraisals"]}>
                  <NewAppraisalPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/calendar" 
              element={
                <AuthenticatedRoute>
                  <CalendarPage />
                </AuthenticatedRoute>
              } 
            />

            {/* Admin Routes - Now Lazy Loaded */}
            <Route 
              path="/admin" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["admin", "director"]}>
                  <LazyAdminDashboard />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/employees" 
              element={
                <EnhancedRoleProtectedRoute requiredPermissions={["canManageEmployees"]}>
                  <LazyEmployeesPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/employees/import" 
              element={
                <EnhancedRoleProtectedRoute requiredPermissions={["canManageEmployees"]}>
                  <LazyEmployeeImportPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/cycles" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["admin", "director"]}>
                  <LazyAppraisalCyclesPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/goals" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["admin", "director"]}>
                  <LazyAdminGoalsPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/appraisals" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["admin", "director"]}>
                  <LazyAppraisalsPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/reports" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["admin", "director"]}>
                  <LazyReportsPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/roles" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["admin", "director"]}>
                  <LazyRolesPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/organization" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["admin", "director"]}>
                  <LazyOrganizationPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/audit" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["admin", "director"]}>
                  <LazyAuditLogPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/notifications" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["admin", "director"]}>
                  <LazyNotificationsPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <EnhancedRoleProtectedRoute requiredRoles={["admin", "director"]}>
                  <LazySettingsPage />
                </EnhancedRoleProtectedRoute>
              } 
            />
            
            <Route 
              path="/profile" 
              element={<ProfilePage />}
            />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </NavigationProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
