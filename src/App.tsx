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
