/**
 * Secure authentication hook with multi-tenant validation and session monitoring
 */

import { useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { 
  validateSessionSecurity,
  startSessionMonitoring,
  autoRefreshSession
} from '@/lib/auth/session-security';
import { 
  guardMultiTenantOperation,
  validateRoleBasedAccess
} from '@/lib/auth/multi-tenant-guard';
import { logSecurityEvent } from '@/lib/security/events';
import { useDemoMode } from '@/contexts/DemoModeContext';

export function useSecureAuth() {
  const auth = useAuth();
  const { isDemoMode } = useDemoMode();

  // Start session monitoring when authenticated
  useEffect(() => {
    if (auth.isAuthenticated && !isDemoMode) {
      const cleanup = startSessionMonitoring();
      return cleanup;
    }
  }, [auth.isAuthenticated, isDemoMode]);

  // Validate session on mount and periodically
  useEffect(() => {
    if (auth.isAuthenticated && !isDemoMode) {
      validateSessionSecurity().then(result => {
        if (!result.isValid) {
          logSecurityEvent('session_validation_failed_on_mount', {
            issues: result.issues,
            userId: auth.user?.id
          }, false);
          
          // Don't auto-logout if it's just a refresh needed
          if (!result.shouldRefresh) {
            auth.signOut();
          }
        }
      });
    }
  }, [auth.isAuthenticated, isDemoMode, auth.user?.id]);

  /**
   * Secure wrapper for database operations with multi-tenant validation
   */
  const secureOperation = useCallback(async <T>(
    operation: string,
    dbOperation: () => Promise<T>,
    options?: {
      requireOrganization?: boolean;
      allowDuringOnboarding?: boolean;
    }
  ): Promise<T> => {
    if (isDemoMode) {
      // In demo mode, execute directly without security checks
      return await dbOperation();
    }

    return await guardMultiTenantOperation(operation, dbOperation, options);
  }, [isDemoMode]);

  /**
   * Check if user has required role with organization validation
   */
  const hasSecureRole = useCallback(async (
    role: string,
    operation?: string
  ): Promise<boolean> => {
    if (isDemoMode) {
      // In demo mode, use the demo role system
      return true; // Simplified for demo
    }

    if (!auth.isAuthenticated) {
      return false;
    }

    return await validateRoleBasedAccess(role, operation || 'role_check');
  }, [auth.isAuthenticated, isDemoMode]);

  /**
   * Force session validation and refresh if needed
   */
  const validateSession = useCallback(async (): Promise<boolean> => {
    if (isDemoMode) {
      return true;
    }

    if (!auth.isAuthenticated) {
      return false;
    }

    return await autoRefreshSession();
  }, [auth.isAuthenticated, isDemoMode]);

  /**
   * Enhanced sign out with security logging
   */
  const secureSignOut = useCallback(async () => {
    try {
      if (auth.user && !isDemoMode) {
        await logSecurityEvent('secure_signout_initiated', {
          userId: auth.user.id
        });
      }
      
      return await auth.signOut();
    } catch (error) {
      await logSecurityEvent('secure_signout_error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, false);
      throw error;
    }
  }, [auth, isDemoMode]);

  /**
   * Enhanced sign in with security validation
   */
  const secureSignIn = useCallback(async (email: string, password: string) => {
    try {
      const result = await auth.signIn(email, password);
      
      if (result.data?.user && !result.error) {
        await logSecurityEvent('secure_signin_success', {
          userId: result.data.user.id,
          email
        });

        // Validate session immediately after sign in
        setTimeout(async () => {
          const sessionValid = await validateSessionSecurity();
          if (!sessionValid.isValid) {
            await logSecurityEvent('session_invalid_after_signin', {
              userId: result.data?.user?.id,
              issues: sessionValid.issues
            }, false);
          }
        }, 1000);
      } else if (result.error) {
        await logSecurityEvent('secure_signin_failed', {
          email,
          error: result.error.message
        }, false);
      }
      
      return result;
    } catch (error) {
      await logSecurityEvent('secure_signin_error', {
        email,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, false);
      throw error;
    }
  }, [auth]);

  return {
    ...auth,
    secureOperation,
    hasSecureRole,
    validateSession,
    secureSignOut,
    secureSignIn,
    isDemoMode,
  };
}