
import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "./LoginForm";

const AuthPage = ({ isSignUp = false }: { isSignUp?: boolean }) => {
  const { isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      console.log("User is signed in, redirecting to onboarding");
      navigate("/onboarding");
    }
  }, [isSignedIn, isLoaded, navigate]);

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
