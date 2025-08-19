
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { usePerformanceTracking } from './usePerformanceTracking';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { trackSupabaseQuery } = usePerformanceTracking();

  useEffect(() => {
    // Get initial session with performance tracking
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await trackSupabaseQuery(
          'auth_get_session',
          () => supabase.auth.getSession(),
          { source: 'initial_load' }
        );
        
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session?.user);
      } catch (error) {
        logger.error('Failed to get initial session', {}, error instanceof Error ? error : new Error(String(error)));
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.auth.info('Auth state changed', { event, userId: session?.user?.id });
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session?.user);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [trackSupabaseQuery]);

  const signIn = async (email: string, password: string) => {
    return trackSupabaseQuery(
      'auth_sign_in',
      () => supabase.auth.signInWithPassword({ email, password }),
      { email, method: 'password' }
    );
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    return trackSupabaseQuery(
      'auth_sign_up',
      () => supabase.auth.signUp({ 
        email, 
        password, 
        options: { data: metadata } 
      }),
      { email, hasMetadata: !!metadata }
    );
  };

  const signOut = async () => {
    return trackSupabaseQuery(
      'auth_sign_out',
      () => supabase.auth.signOut(),
      { userId: user?.id }
    );
  };

  const resetPassword = async (email: string) => {
    return trackSupabaseQuery(
      'auth_reset_password',
      () => supabase.auth.resetPasswordForEmail(email),
      { email }
    );
  };

  return {
    user,
    loading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
}
