
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { validatePasswordSecurity, rateLimiter, logSecurityEvent, sanitizeErrorMessage } from "@/lib/security";
import { sanitizeFormData } from "@/lib/sanitization";

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
    
    const clientIP = 'unknown'; // In production, you'd get this from headers
    const userAgent = navigator.userAgent;
    const rateLimitKey = `auth_${email}_${clientIP}`;

    // Rate limiting check
    if (!rateLimiter.isAllowed(rateLimitKey, 5, 300000)) { // 5 attempts per 5 minutes
      await logSecurityEvent('rate_limit_exceeded', {
        email,
        ip: clientIP,
        user_agent: userAgent,
        action: isSignUp ? 'signup' : 'signin'
      });
      toast({
        title: "Too Many Attempts",
        description: "Please wait before trying again.",
        variant: "destructive",
      });
      return;
    }
    
    // Sanitize form data
    const sanitizedData = sanitizeFormData({
      email,
      password,
      firstName,
      lastName,
    });
    
    if (!sanitizedData.email || !sanitizedData.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (isSignUp && (!sanitizedData.firstName || !sanitizedData.lastName)) {
      toast({
        title: "Validation Error", 
        description: "Please enter your first and last name.",
        variant: "destructive",
      });
      return;
    }

    // Enhanced password validation for sign up
    if (isSignUp) {
      const passwordValidation = validatePasswordSecurity(sanitizedData.password);
      if (!passwordValidation.isValid) {
        toast({
          title: "Password Requirements Not Met",
          description: passwordValidation.errors[0],
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        console.log("Attempting sign up...");
        const { data, error } = await signUp(sanitizedData.email, sanitizedData.password, sanitizedData.firstName, sanitizedData.lastName);
        
        if (error) {
          console.error("Sign up error:", error);
          await logSecurityEvent('signup_failed', {
            email: sanitizedData.email,
            error: sanitizeErrorMessage(error),
            ip: clientIP,
            user_agent: userAgent
          });
          throw error;
        }
        
        console.log("Sign up response:", data);
        
        if (data.user) {
          console.log("Sign up successful");
          await logSecurityEvent('signup_success', {
            email: sanitizedData.email,
            ip: clientIP,
            user_agent: userAgent
          });
          toast({
            title: "Account created successfully",
            description: "Please check your email to verify your account before signing in.",
          });
          // Reset rate limiter on success
          rateLimiter.reset(rateLimitKey);
          // Navigate to login page after successful signup
          navigate("/log-in");
        }
      } else {
        console.log("Attempting sign in...");
        const { data, error } = await signIn(sanitizedData.email, sanitizedData.password);
        
        if (error) {
          console.error("Sign in error:", error);
          await logSecurityEvent('signin_failed', {
            email: sanitizedData.email,
            error: sanitizeErrorMessage(error),
            ip: clientIP,
            user_agent: userAgent
          });
          throw error;
        }
        
        console.log("Sign in response:", data);
        
        if (data.user) {
          console.log("Sign in successful, navigating to onboarding");
          await logSecurityEvent('signin_success', {
            email: sanitizedData.email,
            ip: clientIP,
            user_agent: userAgent
          });
          // Reset rate limiter on success
          rateLimiter.reset(rateLimitKey);
          navigate("/onboarding");
        }
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      const sanitizedError = sanitizeErrorMessage(error);
      
      // Provide more specific error messages
      let userFriendlyMessage = sanitizedError;
      if (error.message?.includes("Invalid login credentials")) {
        userFriendlyMessage = "Invalid email or password. Please try again.";
      } else if (error.message?.includes("User already registered")) {
        userFriendlyMessage = "An account with this email already exists. Please sign in instead.";
      } else if (error.message?.includes("Email not confirmed")) {
        userFriendlyMessage = "Please check your email and click the verification link to continue.";
      } else if (error.message?.includes("Password should be at least")) {
        userFriendlyMessage = "Password should be at least 12 characters long.";
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
