import { useState } from "react";
import { useSignIn, useSignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { GalleryVerticalEnd } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function LoginForm({
  className,
  defaultSignUp = false,
  ...props
}: React.ComponentProps<"div"> & { defaultSignUp?: boolean }) {
  const [isSignUp, setIsSignUp] = useState(defaultSignUp);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
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

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Smartgoals 360</span>
            </a>
            <h1 className="text-xl font-bold">Welcome to Smartgoals 360</h1>
            <div className="text-center text-sm">
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <button
                type="button"
                onClick={() => {
                  if (isSignUp) {
                    navigate("/auth");
                  } else {
                    navigate("/signup");
                  }
                }}
                className="underline underline-offset-4 hover:text-primary"
              >
                {isSignUp ? "Log in" : "Sign up"}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@organization.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Loading..." : (isSignUp ? "Create Account" : "Log In")}
            </Button>
          </div>
          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-background text-muted-foreground relative z-10 px-2">
              Or continue with
            </span>
          </div>
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              type="button" 
              className="w-full"
              onClick={() => handleSocialSignIn("oauth_microsoft")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4">
                <path
                  d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"
                  fill="currentColor"
                />
              </svg>
              Continue with Microsoft
            </Button>
          </div>
        </div>
      </form>
      <div className="text-muted-foreground text-center text-xs text-balance">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}