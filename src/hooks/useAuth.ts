
import { useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { cleanupAuthState } from '@/lib/auth/cleanup';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent re-initialization
    if (initialized.current) return;
    initialized.current = true;

    logger.auth.debug("Setting up auth state listeners");
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          logger.auth.error("Error getting session", error);
        } else {
          logger.auth.debug("Initial session retrieved", { userId: session?.user?.id });
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        logger.auth.error("Failed to get session", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        logger.auth.debug("State change event", { event, userId: session?.user?.id });
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
      initialized.current = false;
    };
  }, []);

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `https://pjiae360.com/verify-email?email=${encodeURIComponent(email)}`,
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });
      
      // If signup successful, send welcome email immediately
      if (!error && data?.user && firstName && lastName) {
        try {
          await supabase.functions.invoke('send-account-welcome', {
            body: {
              email,
              firstName,
              lastName
            }
          });
          logger.auth.debug("Welcome email sent successfully");
        } catch (emailError) {
          logger.auth.error("Failed to send welcome email", emailError);
          // Don't fail the signup if email fails
        }
      }
      
      return { data, error };
    } catch (error) {
      logger.auth.error("SignUp error", error);
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Clean up any lingering auth state and attempt global sign out
      cleanupAuthState();
      try {
        await (supabase.auth as any).signOut({ scope: 'global' });
      } catch (_) {
        // ignore
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data?.user) {
        // Force a full page reload to avoid limbo states
        window.location.href = '/';
      }
      
      return { data, error };
    } catch (error) {
      logger.auth.error("SignIn error", error);
      return { data: null, error };
    }
  };
  const signOut = async () => {
    try {
      // Clean up auth state first
      cleanupAuthState();
      try {
        await (supabase.auth as any).signOut({ scope: 'global' });
      } catch (_) {
        // ignore
      }
      // Force navigation to auth page for a clean state
      window.location.href = '/auth';
      return { error: null as any };
    } catch (error) {
      logger.auth.error("SignOut error", error);
      return { error };
    }
  };
  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };
}
