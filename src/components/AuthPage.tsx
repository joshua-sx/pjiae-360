
import { useAuth } from "@/hooks/useAuth";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "./LoginForm";
import { RouteLoader } from "./ui/navigation-loader";

const AuthPage = ({ isSignUp = false }: { isSignUp?: boolean }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { onboardingCompleted, loading: onboardingLoading } = useOnboardingStatus();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for both auth and onboarding status to load
    if (authLoading || onboardingLoading) return;
    
    if (isAuthenticated) {
      if (onboardingCompleted) {
        console.log("User is signed in and onboarding completed, redirecting to dashboard");
        navigate("/dashboard");
      } else {
        console.log("User is signed in but onboarding not completed, redirecting to onboarding");
        navigate("/onboarding");
      }
    }
  }, [isAuthenticated, onboardingCompleted, authLoading, onboardingLoading, navigate]);

  // Show loading while auth and onboarding status are initializing
  if (authLoading || onboardingLoading) {
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
