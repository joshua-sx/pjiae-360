
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Toaster } from "@/components/ui/toaster";
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
import { RoleAwareRedirect } from "./components/routing/RoleAwareRedirect";

import OnboardingProtectedRoute from "./components/OnboardingProtectedRoute";
import LazyOnboardingFlow from "./components/LazyOnboardingFlow";

const App: React.FC = () => (
  <BrowserRouter>
    <AppProviders>
      <Toaster />
      <AuthDebugPanel />
      
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

        {/* Legacy route redirects */}
        <Route path="/dashboard" element={<RoleAwareRedirect to="dashboard" />} />
        <Route path="/admin" element={<RoleAwareRedirect to="dashboard" />} />
        <Route path="/goals" element={<RoleAwareRedirect to="goals" />} />
        <Route path="/appraisals" element={<RoleAwareRedirect to="appraisals" />} />
        <Route path="/calendar" element={<RoleAwareRedirect to="calendar" />} />

        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppProviders>
  </BrowserRouter>
);

export default App;
