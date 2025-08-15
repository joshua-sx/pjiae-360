import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

interface MobileFormFieldProps {
  children: React.ReactNode;
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export function MobileFormField({ 
  children, 
  label, 
  error, 
  required, 
  className 
}: MobileFormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {children}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}

interface MobileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  showPasswordToggle?: boolean;
  size?: "default" | "sm" | "lg";
}

export function MobileInput({ 
  label, 
  error, 
  showPasswordToggle, 
  type = "text",
  className,
  ...props 
}: MobileInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = showPasswordToggle ? (showPassword ? "text" : "password") : type;

  return (
    <MobileFormField label={label} error={error} required={props.required}>
      <div className="relative">
        <Input 
          type={inputType}
          className={cn(
            "h-12 text-base", // Larger height and text for mobile
            showPasswordToggle && "pr-10",
            className
          )}
          {...props}
        />
        {showPasswordToggle && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-10 w-10 p-0"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
    </MobileFormField>
  );
}

interface MobileTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function MobileTextarea({ label, error, className, ...props }: MobileTextareaProps) {
  return (
    <MobileFormField label={label} error={error} required={props.required}>
      <Textarea 
        className={cn("min-h-[100px] text-base", className)}
        {...props}
      />
    </MobileFormField>
  );
}

interface MobileSelectProps {
  label?: string;
  error?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
  required?: boolean;
}

export function MobileSelect({ 
  label, 
  error, 
  value, 
  onValueChange, 
  placeholder, 
  children, 
  required 
}: MobileSelectProps) {
  return (
    <MobileFormField label={label} error={error} required={required}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-12 text-base">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {children}
        </SelectContent>
      </Select>
    </MobileFormField>
  );
}

interface MobileFormStepProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function MobileFormStep({ 
  title, 
  description, 
  children, 
  actions, 
  className 
}: MobileFormStepProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      
      <div className="space-y-4">
        {children}
      </div>
      
      {actions && (
        <div className="flex flex-col gap-3 pt-4">
          {actions}
        </div>
      )}
    </div>
  );
}

interface MobileFormCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function MobileFormCard({ title, children, className }: MobileFormCardProps) {
  return (
    <Card className={cn("", className)}>
      {title && (
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );
}