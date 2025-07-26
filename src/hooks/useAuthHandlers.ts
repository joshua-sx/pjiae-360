
import { useSignIn, useSignUp, redirectToSignIn, redirectToSignUp } from "@clerk/clerk-react";
import { useToast } from "@/hooks/use-toast";
import { validatePasswordSecurity, rateLimiter, sanitizeErrorMessage } from "@/lib/security";
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
  const { isLoaded: signUpLoaded, signUp } = useSignUp();
  const { isLoaded: signInLoaded, signIn } = useSignIn();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    logger.auth.debug("Form submitted", { isSignUp, email, hasPassword: !!password });
    
    const clientIP = 'unknown'; // In production, you'd get this from headers
    const userAgent = navigator.userAgent;
    const rateLimitKey = `auth_${email}_${clientIP}`;

    // Rate limiting check
    if (!rateLimiter.isAllowed(rateLimitKey, config.authMaxAttempts, config.authWindowMs)) {
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
        if (!signUpLoaded) {
          logger.auth.warn("Sign up not ready");
          return;
        }
        logger.auth.info("Attempting sign up", { email: sanitizedData.email });
        await signUp.create({
          emailAddress: sanitizedData.email,
          password: sanitizedData.password,
          firstName: sanitizedData.firstName,
          lastName: sanitizedData.lastName,
        });

        toast({
          title: "Account created",
          description: "Redirecting to complete sign up...",
        });
        rateLimiter.reset(rateLimitKey);
        await signUp.authenticateWithRedirect({ redirectUrl: "/onboarding" });
      } else {
        if (!signInLoaded) {
          logger.auth.warn("Sign in not ready");
          return;
        }
        logger.auth.info("Attempting sign in", { email: sanitizedData.email });
        await signIn.create({
          identifier: sanitizedData.email,
          password: sanitizedData.password,
        });

        toast({ title: "Signing in", description: "Redirecting..." });
        rateLimiter.reset(rateLimitKey);
        await signIn.authenticateWithRedirect({ redirectUrl: "/onboarding" });
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
      logger.auth.info("Attempting social sign in", { provider });
      const strategy = provider === "google" ? "oauth_google" : "oauth_microsoft";
      const redirectUrl = `${window.location.origin}/onboarding`;

      if (isSignUp) {
        redirectToSignUp({ strategy, redirectUrl });
      } else {
        redirectToSignIn({ strategy, redirectUrl });
      }
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
