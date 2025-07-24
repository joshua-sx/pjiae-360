import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { sanitizeName, sanitizeEmail } from "@/lib/sanitization";
import { validateEmailAdvanced } from "@/lib/email-validation";
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
}: AuthFormFieldsProps) {
  const [emailError, setEmailError] = useState<string>("");

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
      </div>
      <div className="grid gap-3">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Loading..." : (isSignUp ? "Create Account" : "Log In")}
      </Button>
    </div>
  );
}