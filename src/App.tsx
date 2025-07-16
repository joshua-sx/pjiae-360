import { Toaster } from "@/components/ui/toaster";
import { ProfilePage } from "@/components/profile/ProfilePage";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthDebugPanel } from "./components/auth/AuthDebugPanel";

import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import LazyOnboardingFlow from "./components/LazyOnboardingFlow";
import ProtectedRoute from "./components/ProtectedRoute";
import OnboardingProtectedRoute from "./components/OnboardingProtectedRoute";
import NotFound from "./pages/NotFound";
import AppraisalsPage from "./components/AppraisalsPage";
import NewAppraisalPage from "./components/NewAppraisalPage";
import GoalsPage from "./components/GoalsPage";
import CreateGoalPage from "./components/CreateGoalPage";
import AdminDashboard from "./components/admin/AdminDashboard";
import EmployeesPage from "./components/admin/employees/EmployeesPage";
import EmployeeImportPage from "./components/admin/employees/EmployeeImportPage";
import AppraisalCyclesPage from "./components/admin/cycles/AppraisalCyclesPage";
import ReportsPage from "./components/admin/reports/ReportsPage";
import RolesPage from "./components/admin/roles/RolesPage";
import OrganizationPage from "./components/admin/organization/OrganizationPage";
import AuditLogPage from "./components/admin/audit/AuditLogPage";
import NotificationsPage from "./components/admin/notifications/NotificationsPage";
import SettingsPage from "./components/admin/settings/SettingsPage";
import AdminGoalsPage from "./components/admin/goals/AdminGoalsPage";
import AdminAppraisalsPage from "./components/admin/appraisals/AdminAppraisalsPage";
import CalendarPage from "./components/CalendarPage";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import Unauthorized from "./pages/Unauthorized";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthDebugPanel />
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/log-in" element={<AuthPage />} />
            <Route path="/create-account" element={<AuthPage isSignUp={true} />} />
            <Route path="/onboarding" element={
              <OnboardingProtectedRoute>
                <LazyOnboardingFlow />
              </OnboardingProtectedRoute>
            } />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/goals" 
              element={
                <ProtectedRoute>
                  <GoalsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/goals/new" 
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute requiredPermissions={["canManageGoals"]}>
                    <CreateGoalPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/appraisals" 
              element={
                <ProtectedRoute>
                  <AppraisalsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/appraisals/new" 
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute requiredPermissions={["canCreateAppraisals"]}>
                    <NewAppraisalPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/calendar" 
              element={
                <ProtectedRoute>
                  <CalendarPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute requiredRoles={["admin", "director"]}>
                    <AdminDashboard />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/employees" 
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute requiredPermissions={["canManageEmployees"]}>
                    <EmployeesPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/employees/import" 
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute requiredPermissions={["canManageEmployees"]}>
                    <EmployeeImportPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/cycles" 
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute requiredRoles={["admin", "director"]}>
                    <AppraisalCyclesPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/goals" 
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute requiredRoles={["admin", "director"]}>
                    <AdminGoalsPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/appraisals" 
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute requiredRoles={["admin", "director"]}>
                    <AdminAppraisalsPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/reports" 
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute requiredRoles={["admin", "director"]}>
                    <ReportsPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/roles" 
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute requiredRoles={["admin", "director"]}>
                    <RolesPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/organization" 
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute requiredRoles={["admin", "director"]}>
                    <OrganizationPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/audit" 
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute requiredRoles={["admin", "director"]}>
                    <AuditLogPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/notifications" 
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute requiredRoles={["admin", "director"]}>
                    <NotificationsPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute requiredRoles={["admin", "director"]}>
                    <SettingsPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={<ProfilePage />}
            />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
  </QueryClientProvider>
);

export default App;
