
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Form submitted", { isSignUp, email, hasPassword: !!password });
    
    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (isSignUp && (!firstName || !lastName)) {
      toast({
        title: "Validation Error", 
        description: "Please enter your first and last name.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        console.log("Attempting sign up...");
        const { data, error } = await signUp(email, password, firstName, lastName);
        
        if (error) {
          console.error("Sign up error:", error);
          throw error;
        }
        
        console.log("Sign up response:", data);
        
        if (data.user) {
          console.log("Sign up successful");
          toast({
            title: "Account created successfully",
            description: "Please check your email to verify your account before signing in.",
          });
          // Navigate to login page after successful signup
          navigate("/log-in");
        }
      } else {
        console.log("Attempting sign in...");
        const { data, error } = await signIn(email, password);
        
        if (error) {
          console.error("Sign in error:", error);
          throw error;
        }
        
        console.log("Sign in response:", data);
        
        if (data.user) {
          console.log("Sign in successful, navigating to onboarding");
          navigate("/onboarding");
        }
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      const errorMessage = error.message || "Something went wrong";
      
      // Provide more specific error messages
      let userFriendlyMessage = errorMessage;
      if (errorMessage.includes("Invalid login credentials")) {
        userFriendlyMessage = "Invalid email or password. Please try again.";
      } else if (errorMessage.includes("User already registered")) {
        userFriendlyMessage = "An account with this email already exists. Please sign in instead.";
      } else if (errorMessage.includes("Email not confirmed")) {
        userFriendlyMessage = "Please check your email and click the verification link to continue.";
      } else if (errorMessage.includes("Password should be at least")) {
        userFriendlyMessage = "Password should be at least 6 characters long.";
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

  const handleSocialSignIn = async (provider: "google" | "microsoft") => {
    try {
      console.log("Attempting social sign in with:", provider);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: `${window.location.origin}/onboarding`,
        },
      });
      
      if (error) {
        console.error("Social auth error:", error);
        throw error;
      }
    } catch (error: any) {
      console.error("Social authentication error:", error);
      toast({
        title: "Authentication Error",
        description: error.message || "Something went wrong with social authentication",
        variant: "destructive",
      });
    }
  };

  return {
    handleSubmit,
    handleSocialSignIn,
  };
}
