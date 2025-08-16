import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { secureSignIn, resendVerification } from '@/lib/security/auth';
import { Loader2, Eye, EyeOff, AlertTriangle } from 'lucide-react';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

type SignInFormData = z.infer<typeof signInSchema>;

interface SecureSignInFormProps {
  onSuccess?: () => void;
  onNeedVerification?: (email: string) => void;
}

export function SecureSignInForm({ onSuccess, onNeedVerification }: SecureSignInFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [waitTime, setWaitTime] = useState<number | null>(null);
  const { toast } = useToast();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const handleSignIn = async (data: SignInFormData) => {
    setIsLoading(true);
    setError(null);
    setWaitTime(null);

    try {
      const result = await secureSignIn(data.email, data.password);

      if (result.success) {
        toast({
          title: 'Sign in successful',
          description: 'Welcome back!'
        });
        onSuccess?.();
      } else if (result.requiresVerification) {
        setNeedsVerification(true);
        onNeedVerification?.(data.email);
      } else {
        setError(result.error || 'Sign in failed');
        if (result.waitTime) {
          setWaitTime(result.waitTime);
        }
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const email = form.getValues('email');
    if (!email) return;

    setIsLoading(true);
    try {
      const result = await resendVerification(email);
      if (result.success) {
        toast({
          title: 'Verification email sent',
          description: 'Please check your email and click the verification link.'
        });
        setNeedsVerification(false);
      } else {
        setError(result.error || 'Failed to resend verification email');
      }
    } catch (error) {
      setError('Failed to resend verification email');
    } finally {
      setIsLoading(false);
    }
  };

  const formatWaitTime = (ms: number): string => {
    const minutes = Math.ceil(ms / 60000);
    return minutes === 1 ? '1 minute' : `${minutes} minutes`;
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            {waitTime && (
              <div className="mt-2 text-sm">
                Please wait {formatWaitTime(waitTime)} before trying again.
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {needsVerification && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please verify your email address before signing in.
            <Button
              variant="link"
              className="p-0 h-auto font-normal ml-1"
              onClick={handleResendVerification}
              disabled={isLoading}
            >
              Resend verification email
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={form.handleSubmit(handleSignIn)} className="space-y-4">
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
              placeholder="Enter your password"
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
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || (waitTime && waitTime > 0)}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>
    </div>
  );
}