
import { useAuth } from "@/hooks/useAuth";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useLoadingCoordinator } from "@/hooks/useLoadingCoordinator";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "./LoginForm";
import { RouteLoader } from "./ui/navigation-loader";

const AuthPage = ({ isSignUp = false }: { isSignUp?: boolean }) => {
  const { isAuthenticated } = useAuth();
  const { onboardingCompleted } = useOnboardingStatus();
  const { isInitializing, canProceed } = useLoadingCoordinator();
  const navigate = useNavigate();

  useEffect(() => {
    if (!canProceed) return; // Single loading check
    
    if (isAuthenticated) {
      // Add small delay to ensure auth state is fully settled
      setTimeout(() => {
        if (onboardingCompleted === true) {
          console.log("User is signed in and onboarding completed, redirecting to dashboard");
          navigate("/dashboard");
        } else if (onboardingCompleted === false) {
          console.log("User is signed in but onboarding not completed, redirecting to onboarding");
          navigate("/onboarding");
        }
        // If onboardingCompleted is null, stay on auth page (still loading)
      }, 50);
    }
  }, [isAuthenticated, onboardingCompleted, canProceed, navigate]);

  // Show loading while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background">
        <RouteLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main content centered */}
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-sm">
          <LoginForm defaultSignUp={isSignUp} />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
