
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { ProfilePage } from "@/components/profile/ProfilePage";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthDebugPanel } from "./components/auth/AuthDebugPanel";
import { AppProviders } from "./components/providers/AppProviders";

import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import VerifyEmail from "./pages/VerifyEmail";

// Import routing components
import { AuthenticatedRoute } from "./components/routing/AuthenticatedRoute";
import { EnhancedRoleProtectedRoute } from "./components/routing/RoleProtectedRoute";
import { LegacyRouteRedirect } from "./components/routing/LegacyRouteRedirect";
import { AppLayout } from "./components/layouts/AppLayout";

// Import onboarding components
import OnboardingProtectedRoute from "./components/OnboardingProtectedRoute";
import LazyOnboardingFlow from "./components/LazyOnboardingFlow";

// Import configuration and components
import { routeConfig } from "./config/routes";
import { componentRegistry } from "./config/components";
import Dashboard from "./components/Dashboard";

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

// Generate routes from configuration
const generateConfigRoutes = () => {
  return routeConfig.map(({ path, component, roles }) => {
    const Component = componentRegistry[component];
    return createRoleRoute(path, Component, roles);
  });
};

const App = () => (
  <AppProviders>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <AuthDebugPanel />
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
      </BrowserRouter>
    </AppProviders>
);

export default App;
