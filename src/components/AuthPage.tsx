
import { SignIn, SignUp, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const AuthPage = () => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      navigate("/dashboard");
    }
  }, [isSignedIn, navigate]);

  const handleBackToHome = () => {
    navigate("/");
  };

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

        {/* Simple Clerk Auth Components */}
        <div className="flex justify-center">
          {isSignUp ? (
            <SignUp 
              fallbackRedirectUrl="/dashboard"
              signInUrl="/auth"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-xl"
                }
              }}
            />
          ) : (
            <SignIn 
              fallbackRedirectUrl="/dashboard"
              signUpUrl="/auth"
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
