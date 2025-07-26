import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSignIn, useSignUp } from "@clerk/clerk-react";
import {
  validatePasswordSecurity,
  rateLimiter,
  logSecurityEvent,
  sanitizeErrorMessage,
} from "@/lib/security";
import { sanitizeFormData } from "@/lib/sanitization";
import { logger } from "@/lib/logger";
import { config } from "@/lib/config";

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
  const { signIn: clerkSignIn, isLoaded: signInLoaded, setActive: setSignInActive } = useSignIn();
  const { signUp: clerkSignUp, isLoaded: signUpLoaded, setActive: setSignUpActive } = useSignUp();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    logger.auth.debug("Form submitted", { isSignUp, email, hasPassword: !!password });

    const clientIP = "unknown"; // In production, you'd get this from headers
    const userAgent = navigator.userAgent;
    const rateLimitKey = `auth_${email}_${clientIP}`;

    // Rate limiting check
    if (!rateLimiter.isAllowed(rateLimitKey, config.authMaxAttempts, config.authWindowMs)) {
      await logSecurityEvent("rate_limit_exceeded", {
        email,
        ip: clientIP,
        user_agent: userAgent,
        action: isSignUp ? "signup" : "signin",
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
        if (!signUpLoaded) return;
        
        logger.auth.info("Attempting sign up with Clerk", { email: sanitizedData.email });
        
        const result = await clerkSignUp.create({
          emailAddress: sanitizedData.email,
          password: sanitizedData.password,
          firstName: sanitizedData.firstName,
          lastName: sanitizedData.lastName,
        });

        logger.auth.debug("Sign up response received", { status: result.status });

        if (result.status === "complete") {
          logger.auth.info("Sign up successful", { userId: result.createdUserId });
          await logSecurityEvent("signup_success", {
            email: sanitizedData.email,
            ip: clientIP,
            user_agent: userAgent,
          });
          
          // Set the active session
          if (result.createdSessionId) {
            await setSignUpActive({ session: result.createdSessionId });
          }
          
          toast({
            title: "Account created successfully",
            description: "Welcome! Your account has been created.",
          });
          // Reset rate limiter on success
          rateLimiter.reset(rateLimitKey);
          navigate("/onboarding");
        } else if (result.status === "missing_requirements") {
          toast({
            title: "Email verification required",
            description: "Please check your email to verify your account.",
          });
        }
      } else {
        if (!signInLoaded) return;
        
        logger.auth.info("Attempting sign in with Clerk", { email: sanitizedData.email });
        
        const result = await clerkSignIn.create({
          identifier: sanitizedData.email,
          password: sanitizedData.password,
        });

        logger.auth.debug("Sign in response received", { status: result.status });

        if (result.status === "complete") {
          logger.auth.info("Sign in successful");
          await logSecurityEvent("signin_success", {
            email: sanitizedData.email,
            ip: clientIP,
            user_agent: userAgent,
          });
          
          // Set the active session
          if (result.createdSessionId) {
            await setSignInActive({ session: result.createdSessionId });
          }
          
          // Reset rate limiter on success
          rateLimiter.reset(rateLimitKey);
          navigate("/onboarding");
        }
      }
    } catch (error: any) {
      logger.auth.error("Authentication error", error);
      const sanitizedError = sanitizeErrorMessage(error);

      // Provide more specific error messages for Clerk errors
      let userFriendlyMessage = sanitizedError;
      if (error.errors?.[0]?.code === "form_identifier_not_found") {
        userFriendlyMessage = "No account found with this email address.";
      } else if (error.errors?.[0]?.code === "form_password_incorrect") {
        userFriendlyMessage = "Invalid password. Please try again.";
      } else if (error.errors?.[0]?.code === "identifier_already_exists") {
        userFriendlyMessage = "An account with this email already exists. Please sign in instead.";
      } else if (error.errors?.[0]?.code === "password_invalid") {
        userFriendlyMessage = "Password does not meet requirements.";
      } else if (error.message?.includes("Invalid login credentials")) {
        userFriendlyMessage = "Invalid email or password. Please try again.";
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
      if (!signInLoaded) return;
      
      logger.auth.info("Attempting social sign in", { provider });
      
      const strategy = provider === "microsoft" ? "oauth_microsoft" : "oauth_google";
      
      await clerkSignIn.authenticateWithRedirect({
        strategy,
        redirectUrl: `${window.location.origin}/onboarding`,
        redirectUrlComplete: `${window.location.origin}/onboarding`,
      });
    } catch (error: any) {
      logger.auth.error("Social authentication error", error);
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
