import { useState } from "react";
import { cn } from "@/lib/utils";
import { AuthFormHeader } from "./auth/AuthFormHeader";
import { AuthFormToggle } from "./auth/AuthFormToggle";
import { AuthFormFields } from "./auth/AuthFormFields";
import { SocialAuthButton } from "./auth/SocialAuthButton";
import { AuthFormFooter } from "./auth/AuthFormFooter";
import { useAuthHandlers } from "@/hooks/useAuthHandlers";

export function LoginForm({
  className,
  defaultSignUp = false,
  ...props
}: React.ComponentProps<"div"> & { defaultSignUp?: boolean }) {
  const [isSignUp] = useState(defaultSignUp);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { handleSubmit, handleSocialSignIn } = useAuthHandlers({
    isSignUp,
    email,
    password,
    firstName,
    lastName,
    setIsLoading,
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <AuthFormHeader />
          <AuthFormToggle isSignUp={isSignUp} />
          <AuthFormFields
            isSignUp={isSignUp}
            firstName={firstName}
            lastName={lastName}
            email={email}
            password={password}
            isLoading={isLoading}
            onFirstNameChange={setFirstName}
            onLastNameChange={setLastName}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
          />
          <SocialAuthButton 
            onSocialSignIn={() => handleSocialSignIn("oauth_microsoft")}
          />
        </div>
      </form>
      <AuthFormFooter />
    </div>
  );
}