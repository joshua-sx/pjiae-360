
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { validatePasswordSecurity, persistentRateLimiter, logSecurityEvent, sanitizeErrorMessage } from "@/lib/security";
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
  const navigate = useNavigate();
const { toast } = useToast();

  // Cooldown management for rate-limit errors
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const cooldownRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) {
        window.clearInterval(cooldownRef.current);
        cooldownRef.current = null;
      }
    };
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    logger.auth.debug("Form submitted", { isSignUp, email, hasPassword: !!password });
    
    const clientIP = 'unknown'; // In production, you'd get this from headers
    const userAgent = navigator.userAgent;
    const rateLimitKey = `auth_${email}_${clientIP}`;

    // Rate limiting check
    const rateLimitResult = persistentRateLimiter.isAllowed(rateLimitKey, config.authMaxAttempts, config.authWindowMs);
    if (!rateLimitResult.allowed) {
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
        logger.auth.info("Attempting sign up", { email: sanitizedData.email });
        const { data, error } = await signUp(sanitizedData.email, sanitizedData.password, sanitizedData.firstName, sanitizedData.lastName);
        
        if (error) {
          logger.auth.error("Sign up failed", error);
          await logSecurityEvent('signup_failed', {
            email: sanitizedData.email,
            error: sanitizeErrorMessage(error),
            ip: clientIP,
            user_agent: userAgent
          });
          throw error;
        }
        
        logger.auth.debug("Sign up response received", { userId: data.user?.id });
        
        if (data.user) {
          logger.auth.info("Sign up successful", { userId: data.user.id });
          await logSecurityEvent('signup_success', {
            email: sanitizedData.email,
            ip: clientIP,
            user_agent: userAgent
          });
          
          // Send welcome email
          try {
            await supabase.functions.invoke('send-account-welcome', {
              body: {
                email: sanitizedData.email,
                firstName: sanitizedData.firstName,
                lastName: sanitizedData.lastName,
              }
            });
            logger.auth.info("Welcome email sent", { email: sanitizedData.email });
          } catch (emailError) {
            logger.auth.error("Failed to send welcome email", emailError);
            // Don't block signup flow if email fails
          }
          
          toast({
            title: "Account created successfully",
            description: "Please check your email to verify your account.",
          });
          // Reset rate limiter on success
          persistentRateLimiter.reset(rateLimitKey);
          // Navigate to verification page with email parameter
          navigate(`/verify-email?email=${encodeURIComponent(sanitizedData.email)}`);
        }
      } else {
        logger.auth.info("Attempting sign in", { email: sanitizedData.email });
        const { data, error } = await signIn(sanitizedData.email, sanitizedData.password);
        
        if (error) {
          logger.auth.error("Sign in failed", error);
          await logSecurityEvent('signin_failed', {
            email: sanitizedData.email,
            error: sanitizeErrorMessage(error),
            ip: clientIP,
            user_agent: userAgent
          });
          throw error;
        }
        
        logger.auth.debug("Sign in response received", { userId: data.user?.id });
        
        if (data.user) {
          logger.auth.info("Sign in successful", { userId: data.user.id });
          await logSecurityEvent('signin_success', {
            email: sanitizedData.email,
            ip: clientIP,
            user_agent: userAgent
          });
          // Reset rate limiter on success
          persistentRateLimiter.reset(rateLimitKey);
          navigate("/onboarding");
        }
      }
    } catch (error: any) {
      logger.auth.error("Authentication error", error);
      const sanitizedError = sanitizeErrorMessage(error);

      // Provide more specific error messages
      let userFriendlyMessage = sanitizedError;
      const rawMessage: string = error?.message || "";
      if (rawMessage.includes("Invalid login credentials")) {
        userFriendlyMessage = "Invalid email or password. Please try again.";
      } else if (rawMessage.includes("User already registered")) {
        userFriendlyMessage = "An account with this email already exists. Please sign in instead.";
      } else if (rawMessage.includes("Email not confirmed")) {
        userFriendlyMessage = "Please check your email and click the verification link to continue.";
      } else if (rawMessage.includes("Password should be at least")) {
        userFriendlyMessage = "Password should be at least 12 characters long.";
      }

      // Detect rate limit and SMTP setup issues
      const isOverEmailRateLimit =
        (error?.code && String(error.code) === 'over_email_send_rate_limit') ||
        (typeof error?.status === 'number' && error.status === 429) ||
        /over.*email.*send.*rate.*limit/i.test(rawMessage) ||
        (/rate limit/i.test(rawMessage) && /email|send|resend/i.test(rawMessage));

      const looksLikeSmtpIssue = /535|Invalid username|API key not found|Error sending confirmation email/i.test(rawMessage);

      if (isSignUp && isOverEmailRateLimit) {
        // Start 60s cooldown
        setCooldownSeconds(60);
        if (cooldownRef.current) {
          window.clearInterval(cooldownRef.current);
        }
        cooldownRef.current = window.setInterval(() => {
          setCooldownSeconds((prev) => {
            if (prev <= 1) {
              if (cooldownRef.current) {
                window.clearInterval(cooldownRef.current);
                cooldownRef.current = null;
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        toast({
          title: "Too many verification emails",
          description: "Please wait a moment before requesting another verification email. We've routed you to the resend page.",
        });
        // Route to verification page so user can resend later
        navigate(`/verify-email?email=${encodeURIComponent(sanitizedData.email)}`);
      } else if (isSignUp && looksLikeSmtpIssue) {
        await logSecurityEvent('smtp_auth_error', {
          email,
          error: rawMessage,
          context: 'during_signup_verification',
        });

        const supabaseAuthSettingsUrl = `https://supabase.com/dashboard/project/vtmwhvxdgrvaegprmkwg/auth/providers`;
        const resendDomainsUrl = `https://resend.com/domains`;

        toast({
          title: "Email delivery configuration issue",
          description: (
            <div className="space-y-2">
              <p>We couldn't send the verification email. Please verify your SMTP settings.</p>
              <ul className="list-disc pl-4">
                <li>Username must be <strong>resend</strong></li>
                <li>Password is your <strong>Resend API key</strong></li>
                <li>Host: <code>smtp.resend.com</code> • Port: <code>465</code> (SSL)</li>
              </ul>
              <div className="flex gap-3 pt-1">
                <a className="underline" href="/test-emails">Troubleshoot email</a>
                <a className="underline" href={supabaseAuthSettingsUrl} target="_blank" rel="noreferrer">Open Supabase Auth settings</a>
                <a className="underline" href={resendDomainsUrl} target="_blank" rel="noreferrer">Verify Resend domain</a>
              </div>
            </div>
          ),
          variant: "destructive",
        });
      } else {
        toast({
          title: isSignUp ? "Sign Up Error" : "Log In Error",
          description: userFriendlyMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: "google" | "microsoft") => {
    try {
      logger.auth.info("Attempting social sign in", { provider });
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: `${window.location.origin}/onboarding`,
        },
      });
      
      if (error) {
        logger.auth.error("Social auth error", error);
        throw error;
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
    cooldownSeconds,
    isCooldown: cooldownSeconds > 0,
  };
}
