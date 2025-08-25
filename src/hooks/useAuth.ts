
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { usePerformanceTracking } from './usePerformanceTracking';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { trackSupabaseQuery } = usePerformanceTracking();

  useEffect(() => {
    // Set up auth state listener FIRST to avoid missing events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Synchronous state updates only - no async operations to prevent deadlocks
        logger.auth.info('Auth state changed', { event, userId: session?.user?.id });
        setUser(session?.user ?? null);
        setSession(session);
        setIsAuthenticated(!!session?.user);
        setLoading(false);
      }
    );

    // THEN get initial session with performance tracking
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await trackSupabaseQuery(
          'auth_get_session',
          () => supabase.auth.getSession(),
          { source: 'initial_load' }
        );
        
        setUser(session?.user ?? null);
        setSession(session);
        setIsAuthenticated(!!session?.user);
      } catch (error) {
        logger.error('Failed to get initial session', {}, error instanceof Error ? error : new Error(String(error)));
        setUser(null);
        setSession(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    return () => subscription.unsubscribe();
  }, [trackSupabaseQuery]);

  const signIn = async (email: string, password: string): Promise<{ data: any; error: any }> => {
    return trackSupabaseQuery(
      'auth_sign_in',
      () => supabase.auth.signInWithPassword({ email, password }),
      { email, method: 'password' }
    );
  };

  const signUp = async (email: string, password: string, metadata?: any): Promise<{ data: any; error: any }> => {
    const redirectUrl = `${window.location.origin}/`;
    return trackSupabaseQuery(
      'auth_sign_up',
      () => supabase.auth.signUp({ 
        email, 
        password, 
        options: { 
          data: metadata,
          emailRedirectTo: redirectUrl
        } 
      }),
      { email, hasMetadata: !!metadata }
    );
  };

  const signOut = async (): Promise<{ data: any; error: any }> => {
    const result = await trackSupabaseQuery(
      'auth_sign_out',
      async () => {
        const { error } = await supabase.auth.signOut();
        // Transform to match expected return type with data property
        return { data: {}, error };
      },
      { userId: user?.id }
    );
    
    return result;
  };

  const resetPassword = async (email: string): Promise<{ data: any; error: any }> => {
    return trackSupabaseQuery(
      'auth_reset_password',
      () => supabase.auth.resetPasswordForEmail(email),
      { email }
    );
  };

  const signInWithMagicLink = async (email: string): Promise<{ data: any; error: any }> => {
    const redirectUrl = `${window.location.origin}/verify-email?email=${encodeURIComponent(email)}`;
    return trackSupabaseQuery(
      'auth_magic_link',
      () => supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl
        }
      }),
      { email }
    );
  };

  return {
    user,
    session,
    loading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    resetPassword,
    signInWithMagicLink,
  };
}
