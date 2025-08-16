import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { secureSignUp } from '@/lib/security/auth';
import { validatePasswordStrength } from '@/lib/enhanced-security';
import { Loader2, Eye, EyeOff, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

const signUpSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(12, 'Password must be at least 12 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type SignUpFormData = z.infer<typeof signUpSchema>;

interface SecureSignUpFormProps {
  onSuccess?: () => void;
  organizationId?: string;
}

interface PasswordRequirement {
  met: boolean;
  text: string;
}

export function SecureSignUpForm({ onSuccess, organizationId }: SecureSignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirement[]>([]);
  const { toast } = useToast();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const password = form.watch('password');

  React.useEffect(() => {
    if (password) {
      const validation = validatePasswordStrength(password, {
        firstName: form.getValues('firstName'),
        lastName: form.getValues('lastName'),
        email: form.getValues('email')
      });

      const requirements: PasswordRequirement[] = [
        { met: password.length >= 12, text: 'At least 12 characters' },
        { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
        { met: /[a-z]/.test(password), text: 'One lowercase letter' },
        { met: /\d/.test(password), text: 'One number' },
        { met: /[!@#$%^&*(),.?":{}|<>]/.test(password), text: 'One special character' },
        { met: validation.errors.length === 0, text: 'No common patterns or personal info' }
      ];

      setPasswordRequirements(requirements);
    } else {
      setPasswordRequirements([]);
    }
  }, [password, form.watch('firstName'), form.watch('lastName'), form.watch('email')]);

  const handleSignUp = async (data: SignUpFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await secureSignUp(data.email, data.password, {
        firstName: data.firstName,
        lastName: data.lastName,
        organizationId
      });

      if (result.success) {
        toast({
          title: 'Account created successfully',
          description: result.requiresVerification 
            ? 'Please check your email to verify your account.'
            : 'Welcome! You can now sign in.'
        });
        onSuccess?.();
      } else {
        setError(result.error || 'Sign up failed');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = passwordRequirements.filter(req => req.met).length;
  const strengthColor = passwordStrength < 3 ? 'bg-red-500' : 
                       passwordStrength < 5 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-medium">
              First Name
            </label>
            <Input
              id="firstName"
              placeholder="Enter your first name"
              disabled={isLoading}
              {...form.register('firstName')}
            />
            {form.formState.errors.firstName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.firstName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="lastName" className="text-sm font-medium">
              Last Name
            </label>
            <Input
              id="lastName"
              placeholder="Enter your last name"
              disabled={isLoading}
              {...form.register('lastName')}
            />
            {form.formState.errors.lastName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            disabled={isLoading}
            {...form.register('email')}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              disabled={isLoading}
              {...form.register('password')}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>

          {password && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Password strength</span>
                <span className="text-muted-foreground">
                  {passwordStrength}/6 requirements met
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${strengthColor}`}
                  style={{ width: `${(passwordStrength / 6) * 100}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-1">
                    {req.met ? (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    ) : (
                      <XCircle className="h-3 w-3 text-gray-400" />
                    )}
                    <span className={req.met ? 'text-green-700' : 'text-gray-500'}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {form.formState.errors.password && (
            <p className="text-sm text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm Password
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              disabled={isLoading}
              {...form.register('confirmPassword')}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || passwordStrength < 6}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>
    </div>
  );
}