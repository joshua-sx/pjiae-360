import { useSignIn, useSignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface UseAuthHandlersProps {
  isSignUp: boolean;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  setIsLoading: (loading: boolean) => void;
}

export function useAuthHandlers({
  isSignUp,
  email,
  password,
  firstName,
  lastName,
  setIsLoading,
}: UseAuthHandlersProps) {
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const result = await signUp?.create({
          emailAddress: email,
          password,
          firstName,
          lastName,
        });
        
        if (result?.status === "complete") {
          console.log("Sign up successful, navigating to onboarding");
          navigate("/onboarding");
        } else if (result?.status === "missing_requirements") {
          // Handle email verification step
          console.log("Email verification required");
          toast({
            title: "Verify your email",
            description: "Please check your email and click the verification link to continue.",
          });
          // Attempt to send verification email
          await result.prepareEmailAddressVerification({ strategy: "email_code" });
        } else {
          console.log("Sign up result:", result);
          toast({
            title: "Sign up incomplete",
            description: "Please complete the sign up process.",
            variant: "destructive",
          });
        }
      } else {
        const result = await signIn?.create({
          identifier: email,
          password,
        });
        
        if (result?.status === "complete") {
          console.log("Sign in successful, navigating to onboarding");
          navigate("/onboarding");
        } else {
          console.log("Sign in result:", result);
          toast({
            title: "Sign in incomplete",
            description: "Please complete the sign in process.",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      const errorMessage = error.errors?.[0]?.message || "Something went wrong";
      
      // Provide more specific error messages
      let userFriendlyMessage = errorMessage;
      if (errorMessage.includes("Invalid email address")) {
        userFriendlyMessage = "Please enter a valid email address.";
      } else if (errorMessage.includes("Password is incorrect")) {
        userFriendlyMessage = "Incorrect password. Please try again.";
      } else if (errorMessage.includes("User not found")) {
        userFriendlyMessage = isSignUp ? "An account with this email already exists." : "No account found with this email. Please sign up first.";
      }
      
      toast({
        title: isSignUp ? "Sign Up Error" : "Log In Error",
        description: userFriendlyMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (strategy: "oauth_google" | "oauth_microsoft") => {
    try {
      if (isSignUp && signUp) {
        // For sign-up, use signUp flow
        await signUp.authenticateWithRedirect({
          strategy,
          redirectUrl: "/onboarding",
          redirectUrlComplete: "/onboarding",
        });
      } else {
        // For login, use signIn flow
        await signIn?.authenticateWithRedirect({
          strategy,
          redirectUrl: "/onboarding", 
          redirectUrlComplete: "/onboarding",
        });
      }
    } catch (error: any) {
      console.error("Social authentication error:", error);
      toast({
        title: isSignUp ? "Sign Up Error" : "Log In Error",
        description: error.errors?.[0]?.message || "Something went wrong with social authentication",
        variant: "destructive",
      });
    }
  };

  return {
    handleSubmit,
    handleSocialSignIn,
  };
}