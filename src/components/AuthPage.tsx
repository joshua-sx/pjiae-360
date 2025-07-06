
import { SignIn, SignUp, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Clean ChatGPT-style Clerk appearance configuration
  const clerkAppearance = {
    layout: {
      unsafe_disableDevelopmentModeWarnings: true,
    },
    elements: {
      rootBox: "w-full max-w-sm mx-auto",
      card: "bg-card shadow-sm border-0 rounded-none p-0",
      headerTitle: "text-2xl font-normal text-foreground text-center mb-6",
      headerSubtitle: "hidden",
      socialButtons: "space-y-3 mb-6",
      socialButtonsBlockButton: "w-full h-12 bg-background border border-border rounded-md hover:bg-accent text-foreground font-normal transition-colors",
      socialButtonsBlockButtonText: "font-normal text-sm",
      socialButtonsBlockButtonArrow: "hidden",
      dividerLine: "bg-border my-6",
      dividerText: "text-muted-foreground text-sm font-normal px-4",
      formFieldInput: "w-full h-12 bg-background border border-border rounded-md px-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-0",
      formFieldLabel: "text-foreground font-normal text-sm mb-2 block",
      formButtonPrimary: "w-full h-12 bg-primary text-primary-foreground rounded-md font-normal hover:bg-primary/90 transition-colors",
      footerActionLink: "text-primary hover:text-primary/80 font-normal text-sm",
      footer: "mt-8 text-center",
      main: "p-0",
      header: "p-0 mb-8",
      formFieldErrorText: "text-destructive text-sm mt-1",
      alertText: "text-destructive text-sm"
    },
    variables: {
      colorPrimary: "hsl(222.2 47.4% 11.2%)",
      colorBackground: "hsl(0 0% 100%)",
      colorInputBackground: "hsl(0 0% 100%)",
      colorInputText: "hsl(222.2 84% 4.9%)",
      colorText: "hsl(222.2 84% 4.9%)",
      colorTextSecondary: "hsl(215.4 16.3% 46.9%)",
      colorDanger: "hsl(0 84.2% 60.2%)",
      borderRadius: "0.375rem",
      fontFamily: "system-ui, -apple-system, sans-serif",
      fontSize: "14px"
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top-left brand name */}
      <div className="absolute top-8 left-8">
        <h1 className="text-xl font-bold text-foreground">Smartgoals 360</h1>
      </div>

      {/* Main content centered */}
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-sm">
          {/* Clerk Auth Components */}
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

          {/* Toggle between Sign In/Sign Up */}
          <div className="text-center mt-6">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:text-primary/80 text-sm font-normal transition-colors hover:underline"
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
