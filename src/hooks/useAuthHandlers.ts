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
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await signUp(email, password, firstName, lastName);
        
        if (error) {
          throw error;
        }
        
        if (data.user) {
          console.log("Sign up successful");
          toast({
            title: "Account created successfully",
            description: "Please check your email to verify your account.",
          });
          // Don't navigate immediately, let them verify email first
        }
      } else {
        const { data, error } = await signIn(email, password);
        
        if (error) {
          throw error;
        }
        
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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: `${window.location.origin}/onboarding`,
        },
      });
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error("Social authentication error:", error);
      toast({
        title: isSignUp ? "Sign Up Error" : "Log In Error",
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