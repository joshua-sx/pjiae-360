import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
import { PasswordInput } from "@/components/ui/password-input";
import { sanitizeName, sanitizeEmail } from "@/lib/sanitization";
import { validateEmailAdvanced } from "@/lib/email-validation";
import { useEmailSuggestions } from "@/hooks/useEmailSuggestions";
import { useState } from "react";

interface AuthFormFieldsProps {
  isSignUp: boolean;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isLoading: boolean;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  isCooldown?: boolean;
  cooldownSeconds?: number;
}

export function AuthFormFields({
  isSignUp,
  firstName,
  lastName,
  email,
  password,
  isLoading,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPasswordChange,
  isCooldown = false,
  cooldownSeconds = 0,
}: AuthFormFieldsProps) {
  const [emailError, setEmailError] = useState<string>("");
  const { suggestion, applySuggestion } = useEmailSuggestions(email);

  const handleEmailChange = (value: string) => {
    const sanitizedEmail = sanitizeEmail(value);
    const validation = validateEmailAdvanced(sanitizedEmail);
    
    setEmailError(validation.isValid ? "" : validation.errors[0] || "");
    onEmailChange(sanitizedEmail);
  };

  const handleNameChange = (value: string, onChange: (value: string) => void) => {
    const sanitizedName = sanitizeName(value);
    onChange(sanitizedName);
  };

  return (
    <div className="flex flex-col gap-6">
      {isSignUp && (
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-3">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="John"
              value={firstName}
              onChange={(e) => handleNameChange(e.target.value, onFirstNameChange)}
              required
              sanitize
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => handleNameChange(e.target.value, onLastNameChange)}
              required
              sanitize
            />
          </div>
        </div>
      )}
      <div className="grid gap-3">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@organization.com"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          required
        />
        {emailError && (
          <p className="text-sm text-destructive mt-1">{emailError}</p>
        )}
        {suggestion && (
          <div className="text-sm text-muted-foreground">
            Did you mean{" "}
            <button
              type="button"
              className="text-primary hover:underline font-medium"
              onClick={() => onEmailChange(applySuggestion())}
            >
              {suggestion}
            </button>?
          </div>
        )}
      </div>
      <div className="grid gap-3">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          showStrength={isSignUp}
          placeholder={isSignUp ? "At least 12 characters" : "Enter your password"}
          required
        />
      </div>
      <LoadingButton 
        type="submit" 
        className="w-full" 
        isLoading={isLoading}
        disabled={!!isCooldown}
        loadingText="Loading..."
      >
        {isSignUp
          ? (isCooldown ? `Please wait ${cooldownSeconds ?? 0}s` : "Create Account")
          : "Log In"}
      </LoadingButton>
    </div>
  );
}