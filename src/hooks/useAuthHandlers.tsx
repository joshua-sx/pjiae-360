
import { useState } from 'react';
import { useAuth } from './useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export function useAuthHandlers() {
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signOut, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
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
        navigate('/dashboard');
        return { success: true, data };
      }

      return { success: false, error: new Error('No user data returned') };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      logger.auth.error('Sign in error', { email }, error instanceof Error ? error : new Error(String(error)));
      toast.error(errorMessage);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string, metadata?: any) => {
    setLoading(true);
    try {
      const { data, error } = await signUp(email, password, metadata);
      
      if (error) {
        logger.auth.error('Sign up failed', { email, error: error.message });
        toast.error(error.message || 'Failed to create account');
        return { success: false, error };
      }

      if (data?.user) {
        logger.auth.info('User signed up successfully', { userId: data.user.id });
        toast.success('Account created successfully! Please check your email to verify your account.');
        return { success: true, data };
      }

      return { success: false, error: new Error('No user data returned') };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      logger.auth.error('Sign up error', { email }, error instanceof Error ? error : new Error(String(error)));
      toast.error(errorMessage);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (email: string) => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleSignIn,
    handleSignUp,
    handleSignOut,
    handlePasswordReset,
  };
}
