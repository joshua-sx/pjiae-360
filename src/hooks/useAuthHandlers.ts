import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSignIn } from "@clerk/clerk-react";
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
  const { signUp, signIn } = useAuth();
  const { signIn: clerkSignIn } = useSignIn();
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
        logger.auth.info("Attempting sign up", { email: sanitizedData.email });
        const { data, error } = await signUp(
          sanitizedData.email,
          sanitizedData.password,
          sanitizedData.firstName,
          sanitizedData.lastName
        );

        if (error) {
          logger.auth.error("Sign up failed", error);
          await logSecurityEvent("signup_failed", {
            email: sanitizedData.email,
            error: sanitizeErrorMessage(error),
            ip: clientIP,
            user_agent: userAgent,
          });
          throw error;
        }

        logger.auth.debug("Sign up response received", { userId: data.user?.id });

        if (data.user) {
          logger.auth.info("Sign up successful", { userId: data.user.id });
          await logSecurityEvent("signup_success", {
            email: sanitizedData.email,
            ip: clientIP,
            user_agent: userAgent,
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
        logger.auth.info("Attempting sign in", { email: sanitizedData.email });
        const { data, error } = await signIn(sanitizedData.email, sanitizedData.password);

        if (error) {
          logger.auth.error("Sign in failed", error);
          await logSecurityEvent("signin_failed", {
            email: sanitizedData.email,
            error: sanitizeErrorMessage(error),
            ip: clientIP,
            user_agent: userAgent,
          });
          throw error;
        }

        logger.auth.debug("Sign in response received", { userId: data.user?.id });

        if (data.user) {
          logger.auth.info("Sign in successful", { userId: data.user.id });
          await logSecurityEvent("signin_success", {
            email: sanitizedData.email,
            ip: clientIP,
            user_agent: userAgent,
          });
          // Reset rate limiter on success
          rateLimiter.reset(rateLimitKey);
          navigate("/onboarding");
        }
      }
    } catch (error: any) {
      logger.auth.error("Authentication error", error);
      const sanitizedError = sanitizeErrorMessage(error);

      // Provide more specific error messages
      let userFriendlyMessage = sanitizedError;
      if (error.message?.includes("Invalid login credentials")) {
        userFriendlyMessage = "Invalid email or password. Please try again.";
      } else if (error.message?.includes("User already registered")) {
        userFriendlyMessage = "An account with this email already exists. Please sign in instead.";
      } else if (error.message?.includes("Email not confirmed")) {
        userFriendlyMessage =
          "Please check your email and click the verification link to continue.";
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
      logger.auth.info("Attempting social sign in", { provider });
      await clerkSignIn.authenticateWithRedirect({
        strategy: `oauth_${provider}`,
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
