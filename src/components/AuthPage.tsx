
import { SignIn, SignUp, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const AuthPage = () => {
  const { isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      console.log("User is signed in, redirecting to onboarding");
      navigate("/onboarding");
    }
  }, [isSignedIn, isLoaded, navigate]);

  const handleBackToHome = () => {
    navigate("/");
  };

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={handleBackToHome}
          className="mb-6 text-slate-600 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        {/* Clerk Auth Components */}
        <div className="flex justify-center">
          {isSignUp ? (
            <SignUp 
              fallbackRedirectUrl="/onboarding"
              forceRedirectUrl="/onboarding"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-xl"
                }
              }}
            />
          ) : (
            <SignIn 
              fallbackRedirectUrl="/onboarding"
              forceRedirectUrl="/onboarding"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-xl"
                }
              }}
            />
          )}
        </div>

        {/* Toggle between Sign In/Sign Up */}
        <div className="text-center mt-6">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
