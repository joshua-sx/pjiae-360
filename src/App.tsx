
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import Dashboard from "./features/dashboard/Dashboard";
import OnboardingFlow from "./features/onboarding/OnboardingFlow";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import { PreviewProvider } from "@/features/rolePreview/contexts/PreviewContext";
import { PreviewBanner } from "@/features/rolePreview/PreviewBanner";

const queryClient = new QueryClient();

const CLERK_PUBLISHABLE_KEY = "pk_test_c3VidGxlLW1hcnRpbi05NS5jbGVyay5hY2NvdW50cy5kZXYk";

const App = () => (
  <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
    <QueryClientProvider client={queryClient}>
      <PreviewProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <PreviewBanner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <OnboardingFlow />
                </ProtectedRoute>
              } />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </PreviewProvider>
    </QueryClientProvider>
  </ClerkProvider>
);

export default App;
