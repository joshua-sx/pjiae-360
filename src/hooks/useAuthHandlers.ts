import { useSignIn, useSignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface UseAuthHandlersProps {
  isSignUp: boolean;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  setIsLoading: (loading: boolean) => void;
}

export function useAuthHandlers(props: UseAuthHandlersProps) {
  const { isSignUp, email, password, firstName, lastName, setIsLoading } = props;
  const navigate = useNavigate();
  const { signIn, setActive } = useSignIn();
  const { signUp, setActive: setActiveSignUp } = useSignUp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign up flow
        if (!firstName || !lastName) {
          toast.error("First and last name are required for sign up");
          setIsLoading(false);
          return;
        }

        const result = await signUp?.create({
          emailAddress: email,
          password,
          firstName,
          lastName,
        });

        if (result?.status === "complete") {
          await setActiveSignUp?.({ session: result.createdSessionId });
          toast.success("Account created successfully!");
          navigate("/dashboard");
        } else {
          // Handle email verification if needed
          toast.info("Please check your email to verify your account");
        }
      } else {
        // Sign in flow
        const result = await signIn?.create({
          identifier: email,
          password,
        });

        if (result?.status === "complete") {
          await setActive?.({ session: result.createdSessionId });
          toast.success("Signed in successfully!");
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error?.errors?.[0]?.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: string) => {
    setIsLoading(true);
    try {
      await signIn?.authenticateWithRedirect({
        strategy: `oauth_${provider}` as any,
        redirectUrl: "/dashboard",
        redirectUrlComplete: "/dashboard",
      });
    } catch (error: any) {
      console.error("Social auth error:", error);
      toast.error("Social sign-in failed");
      setIsLoading(false);
    }
  };

  return { handleSubmit, handleSocialSignIn };
}