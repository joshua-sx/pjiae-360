
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ProfilePage } from "@/components/profile/ProfilePage";

import { AuthDebugPanel } from "./components/auth/AuthDebugPanel";
import { AppProviders } from "./components/providers/AppProviders";
import { AuthenticatedLayout } from "./components/layouts/AuthenticatedLayout";
import { NestedRoutes } from "./components/routing/NestedRoutes";

import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import VerifyEmail from "./pages/VerifyEmail";
import EmailTestPage from "./pages/EmailTestPage";

import { AuthenticatedRoute } from "./components/routing/AuthenticatedRoute";
import { LegacyRouteRedirect } from "./components/routing/LegacyRouteRedirect";
import Dashboard from "./components/Dashboard";

import OnboardingProtectedRoute from "./components/OnboardingProtectedRoute";
import LazyOnboardingFlow from "./components/LazyOnboardingFlow";

const App: React.FC = () => (
  <BrowserRouter>
    <AppProviders>
      <Toaster />
      <SonnerToaster />
      <AuthDebugPanel />
      <LegacyRouteRedirect />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/log-in" element={<AuthPage />} />
        <Route path="/create-account" element={<AuthPage isSignUp={true} />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/test-emails" element={<EmailTestPage />} />
        <Route
          path="/onboarding"
          element={
            <OnboardingProtectedRoute>
              <LazyOnboardingFlow />
            </OnboardingProtectedRoute>
          }
        />

        {/* Nested routes for role-based navigation */}
        <Route path="/*" element={<NestedRoutes />} />

        {/* Legacy redirects for backwards compatibility */}
        <Route
          path="/dashboard"
          element={
            <AuthenticatedRoute>
              <AuthenticatedLayout>
                <Dashboard />
              </AuthenticatedLayout>
            </AuthenticatedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AuthenticatedRoute>
              <AuthenticatedLayout>
                <Dashboard />
              </AuthenticatedLayout>
            </AuthenticatedRoute>
          }
        />

        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppProviders>
  </BrowserRouter>
);

export default App;
