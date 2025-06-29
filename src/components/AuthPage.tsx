
import { SignIn, SignUp, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";

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

  // Comprehensive Clerk appearance configuration
  const clerkAppearance = {
    layout: {
      unsafe_disableDevelopmentModeWarnings: true,
    },
    elements: {
      rootBox: "w-full max-w-md mx-auto",
      card: "bg-white shadow-2xl border border-slate-200 rounded-xl overflow-hidden",
      headerTitle: "text-2xl font-bold text-slate-900 text-center mb-2",
      headerSubtitle: "text-slate-600 text-center mb-6 text-sm",
      socialButtons: "mb-6",
      socialButtonsBlockButton: "border border-slate-300 hover:border-slate-400 text-slate-700 hover:bg-slate-50 rounded-lg h-11 transition-colors duration-200",
      socialButtonsBlockButtonText: "font-medium",
      dividerLine: "bg-slate-300",
      dividerText: "text-slate-500 text-sm font-medium",
      formFieldInput: "border border-slate-300 rounded-lg h-11 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200",
      formFieldLabel: "text-slate-700 font-medium text-sm mb-2",
      formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-11 font-medium transition-colors duration-200 shadow-sm",
      footerActionLink: "text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200",
      identityPreviewEditButton: "text-blue-600 hover:text-blue-700",
      formFieldSuccessText: "text-green-600 text-sm",
      formFieldErrorText: "text-red-600 text-sm",
      alertText: "text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3",
      formHeaderTitle: "text-xl font-semibold text-slate-900 mb-1",
      formHeaderSubtitle: "text-slate-600 text-sm",
      formFieldInputShowPasswordButton: "text-slate-500 hover:text-slate-700",
      formFieldAction: "text-blue-600 hover:text-blue-700 text-sm font-medium",
      footer: "mt-6 pt-6 border-t border-slate-200",
      main: "px-8 py-8",
      header: "px-8 pt-8 pb-4"
    },
    variables: {
      colorPrimary: "#2563eb",
      colorBackground: "#ffffff",
      colorInputBackground: "#ffffff",
      colorInputText: "#1e293b",
      colorText: "#1e293b",
      colorTextSecondary: "#64748b",
      colorDanger: "#dc2626",
      colorSuccess: "#16a34a",
      borderRadius: "0.5rem",
      fontFamily: "system-ui, -apple-system, sans-serif",
      fontSize: "14px",
      spacingUnit: "1rem"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={handleBackToHome}
          className="mb-6 text-slate-600 hover:text-slate-800 hover:bg-white/50 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        {/* Brand Header */}
        <div className="text-center mb-8 bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Smartgoals 360</h1>
          <p className="text-slate-600 text-sm">
            {isSignUp ? "Create your account to get started" : "Welcome back! Please sign in to continue"}
          </p>
        </div>

        {/* Clerk Auth Components */}
        <div className="flex justify-center">
          {isSignUp ? (
            <SignUp 
              fallbackRedirectUrl="/onboarding"
              forceRedirectUrl="/onboarding"
              appearance={clerkAppearance}
            />
          ) : (
            <SignIn 
              fallbackRedirectUrl="/onboarding"
              forceRedirectUrl="/onboarding"
              appearance={clerkAppearance}
            />
          )}
        </div>

        {/* Toggle between Sign In/Sign Up */}
        <div className="text-center mt-6 bg-white/40 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200 hover:underline"
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
