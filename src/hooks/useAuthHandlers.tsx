
import { useState } from 'react';
import { useAuth } from './useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { AuthResult } from '@/types/auth';

export function useAuthHandlers({
  isSignUp,
  email,
  password,
  firstName,
  lastName,
  setIsLoading,
}: {
  isSignUp: boolean;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  setIsLoading: (loading: boolean) => void;
}) {
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isCooldown, setIsCooldown] = useState(false);
  const { signIn, signUp, signOut, resetPassword, signInWithMagicLink } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isCooldown) return;
    
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        const metadata = { firstName, lastName };
        const result = await handleSignUp(email, password, metadata);
        if (result.success) {
          toast.success('Account created successfully! Please check your email to verify your account.');
        }
      } else {
        const result = await handleSignIn(email, password);
        if (result.success) {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      logger.auth.error('Auth form submission error', { email, isSignUp }, error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: string) => {
    // Placeholder for social sign-in implementation
    toast.info('Social sign-in not implemented yet');
  };

  const handleSignIn = async (email: string, password: string): Promise<AuthResult<{ user: any }>> => {
    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        logger.auth.error('Sign in failed', { email, error: error.message });
        toast.error(error.message || 'Failed to sign in');
        return { success: false, error };
      }

      if (data?.user) {
        logger.auth.info('User signed in successfully', { userId: data.user.id });
        toast.success('Welcome back!');
        return { success: true, data };
      }

      return { success: false, error: new Error('No user data returned') };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      logger.auth.error('Sign in error', { email }, error instanceof Error ? error : new Error(String(error)));
      toast.error(errorMessage);
      return { success: false, error };
    }
  };

  const handleSignUp = async (email: string, password: string, metadata?: any): Promise<AuthResult<{ user: any }>> => {
    try {
      const { data, error } = await signUp(email, password, metadata);
      
      if (error) {
        logger.auth.error('Sign up failed', { email, error: error.message });
        toast.error(error.message || 'Failed to create account');
        return { success: false, error };
      }

      if (data?.user) {
        logger.auth.info('User signed up successfully', { userId: data.user.id });
        return { success: true, data };
      }

      return { success: false, error: new Error('No user data returned') };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      logger.auth.error('Sign up error', { email }, error instanceof Error ? error : new Error(String(error)));
      toast.error(errorMessage);
      return { success: false, error };
    }
  };

  const handleSignOut = async (): Promise<AuthResult<void>> => {
    try {
      const { error } = await signOut();
      
      if (error) {
        logger.auth.error('Sign out failed', { error: error.message });
        toast.error('Failed to sign out');
        return { success: false, error };
      }

      logger.auth.info('User signed out successfully');
      toast.success('Signed out successfully');
      navigate('/auth/signin');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      logger.auth.error('Sign out error', {}, error instanceof Error ? error : new Error(String(error)));
      toast.error(errorMessage);
      return { success: false, error };
    }
  };

  const handlePasswordReset = async (email: string): Promise<AuthResult<void>> => {
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        logger.auth.error('Password reset failed', { email, error: error.message });
        toast.error(error.message || 'Failed to send reset email');
        return { success: false, error };
      }

      logger.auth.info('Password reset email sent', { email });
      toast.success('Password reset email sent! Check your inbox.');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      logger.auth.error('Password reset error', { email }, error instanceof Error ? error : new Error(String(error)));
      toast.error(errorMessage);
      return { success: false, error };
    }
  };

  const handleMagicLinkSignIn = async (email: string): Promise<AuthResult<void>> => {
    try {
      const { error } = await signInWithMagicLink(email);
      
      if (error) {
        logger.auth.error('Magic link sign in failed', { email, error: error.message });
        toast.error(error.message || 'Failed to send magic link');
        return { success: false, error };
      }

      logger.auth.info('Magic link sent', { email });
      toast.success('Magic link sent! Check your email to sign in.');
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      logger.auth.error('Magic link error', { email }, error instanceof Error ? error : new Error(String(error)));
      toast.error(errorMessage);
      return { success: false, error };
    }
  };

  return {
    handleSubmit,
    handleSocialSignIn,
    handleSignIn,
    handleSignUp,
    handleSignOut,
    handlePasswordReset,
    handleMagicLinkSignIn,
    cooldownSeconds,
    isCooldown,
    loading: false,
  };
}
