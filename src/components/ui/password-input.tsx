import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Input } from "./input";
import { validatePasswordSecurity } from "@/lib/security/password";

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  showStrength?: boolean;
  size?: "default" | "sm" | "lg";
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showStrength = false, value = "", onChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const passwordValue = value as string;
    
    const validation = showStrength ? validatePasswordSecurity(passwordValue) : null;
    const strengthColors = {
      weak: 'bg-red-500',
      medium: 'bg-yellow-500', 
      strong: 'bg-green-500'
    };

    return (
      <div className="space-y-2">
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            className={cn("pr-10", className)}
            ref={ref}
            value={value}
            onChange={onChange}
            {...props}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={props.disabled}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="sr-only">
              {showPassword ? "Hide password" : "Show password"}
            </span>
          </Button>
        </div>
        
        {showStrength && passwordValue && validation && (
          <div className="space-y-2">
            <div className="flex space-x-1">
              {[1, 2, 3].map((level) => (
                <div
                  key={level}
                  className={cn(
                    "h-1 flex-1 rounded-full bg-muted transition-colors",
                    validation.strength === 'strong' && strengthColors.strong,
                    validation.strength === 'medium' && level <= 2 && strengthColors.medium,
                    validation.strength === 'weak' && level === 1 && strengthColors.weak
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Password strength: <span className="font-medium">{validation.strength}</span>
            </p>
            {validation.errors.length > 0 && (
              <p className="text-xs text-destructive">{validation.errors[0]}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };