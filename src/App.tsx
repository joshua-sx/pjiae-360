import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";

import { ProfilePage } from "@/components/profile/ProfilePage";
import { AuthDebugPanel } from "./components/auth/AuthDebugPanel";
import { AppProviders } from "./components/providers/AppProviders";
import { AppSidebar } from "./components/AppSidebar";

// Assuming these exist at this path; adjust if located elsewhere.
import {
  DemoModeProvider,
  NavigationProvider,
  SidebarStateProvider,
  SecurityMonitoringProvider,
} from "./components/providers";

import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import VerifyEmail from "./pages/VerifyEmail";

import { AuthenticatedRoute } from "./components/routing/AuthenticatedRoute";
import { EnhancedRoleProtectedRoute } from "./components/routing/EnhancedRoleProtectedRoute";
import { LegacyRouteRedirect } from "./components/routing/LegacyRouteRedirect";
import { AppLayout } from "./components/layouts/AppLayout";

import OnboardingProtectedRoute from "./components/OnboardingProtectedRoute";
import LazyOnboardingFlow from "./components/LazyOnboardingFlow";

import { routeConfig } from "./config/routes";
import { componentRegistry } from "./config/components";
import Dashboard from "./components/Dashboard";

// Helper to create role-protected routes
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

// Generate configuration-driven routes
const generateConfigRoutes = () => {
  return routeConfig.map(({ path, component, roles }) => {
    const Component = componentRegistry[component];
    return createRoleRoute(path, Component, roles);
  });
};

const queryClient = new QueryClient();

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <SonnerToaster />
      <BrowserRouter>
        <AppProviders>
          <DemoModeProvider>
            <AuthDebugPanel />
            <NavigationProvider>
              <SidebarStateProvider>
                <SecurityMonitoringProvider>
                  <LegacyRouteRedirect />
                  <Routes>
                    {/* Public routes without sidebar */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/log-in" element={<AuthPage />} />
                    <Route path="/create-account" element={<AuthPage isSignUp={true} />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route path="*" element={<NotFound />} />
                    
                    {/* Onboarding route */}
                    <Route
                      path="/onboarding"
                      element={
                        <OnboardingProtectedRoute>
                          <LazyOnboardingFlow />
                        </OnboardingProtectedRoute>
                      }
                    />

                    {/* Authenticated routes with sidebar */}
                    <Route
                      path="/*"
                      element={
                        <SidebarProvider 
                          defaultOpen={(() => {
                            const saved = localStorage.getItem('sidebar-collapsed')
                            return saved ? !JSON.parse(saved) : true
                          })()}
                        >
                          <AppSidebar />
                          <AppLayout>
                            <Routes>
                              {/* Configuration-driven routes */}
                              {generateConfigRoutes()}

                              {/* Legacy redirects for backwards compatibility */}
                              <Route
                                path="/dashboard"
                                element={
                                  <AuthenticatedRoute>
                                    <Dashboard />
                                  </AuthenticatedRoute>
                                }
                              />
                              <Route
                                path="/admin"
                                element={
                                  <AuthenticatedRoute>
                                    <Dashboard />
                                  </AuthenticatedRoute>
                                }
                              />

                              <Route path="/profile" element={<ProfilePage />} />
                            </Routes>
                          </AppLayout>
                        </SidebarProvider>
                      }
                    />
                  </Routes>
                </SecurityMonitoringProvider>
              </SidebarStateProvider>
            </NavigationProvider>
          </DemoModeProvider>
        </AppProviders>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
