import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ProfilePage } from "@/components/profile/ProfilePage";

import { AuthDebugPanel } from "./components/auth/AuthDebugPanel";
import { AppProviders } from "./components/providers/AppProviders";
import { AppSidebar } from "./components/AppSidebar";

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

const App: React.FC = () => (
  <BrowserRouter>
    <AppProviders>
      <Toaster />
      <SonnerToaster />
      <AuthDebugPanel />
      <SidebarProvider
        defaultOpen={(() => {
          const saved = localStorage.getItem("sidebar-collapsed");
          return saved ? !JSON.parse(saved) : true;
        })()}
      >
        <AppSidebar />
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

            {/* Configuration-driven routes - single source of truth */}
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
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </SidebarProvider>
    </AppProviders>
  </BrowserRouter>
);

export default App;
