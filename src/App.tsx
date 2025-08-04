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
import { AuthenticatedLayout } from "./components/layouts/AuthenticatedLayout";
import { NestedRoutes } from "./components/routing/NestedRoutes";

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
import { LegacyRouteRedirect } from "./components/routing/LegacyRouteRedirect";
import Dashboard from "./components/Dashboard";

import OnboardingProtectedRoute from "./components/OnboardingProtectedRoute";
import LazyOnboardingFlow from "./components/LazyOnboardingFlow";


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
                    <Route
                      path="/onboarding"
                      element={
                        <OnboardingProtectedRoute>
                          <LazyOnboardingFlow />
                        </OnboardingProtectedRoute>
                      }
                    />

                    {/* Nested role-based routes with shared authenticated layout */}
                    <Route path="/*" element={<NestedRoutes />} />

                    {/* Legacy redirects with sidebar */}
                    <Route
                      path="/dashboard"
                      element={
                        <AuthenticatedLayout>
                          <AuthenticatedRoute>
                            <Dashboard />
                          </AuthenticatedRoute>
                        </AuthenticatedLayout>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <AuthenticatedLayout>
                          <AuthenticatedRoute>
                            <Dashboard />
                          </AuthenticatedRoute>
                        </AuthenticatedLayout>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <AuthenticatedLayout>
                          <ProfilePage />
                        </AuthenticatedLayout>
                      }
                    />

                    <Route path="*" element={<NotFound />} />
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
