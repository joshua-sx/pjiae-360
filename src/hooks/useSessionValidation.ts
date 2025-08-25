import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { validateSessionSecurity } from '@/lib/auth/session-security';

export interface SessionValidationResult {
  isValid: boolean;
  issues: string[];
  shouldRefresh: boolean;
}

/**
 * Dedicated hook for session validation logic
 * Extracted from useSecureAuth for single responsibility
 */
export function useSessionValidation() {
  const { session, user } = useAuth();

  const validateSession = useCallback(async (): Promise<SessionValidationResult> => {
    if (!session || !user) {
      return {
        isValid: false,
        issues: ['No active session'],
        shouldRefresh: false,
      };
    }

    try {
      return await validateSessionSecurity();
    } catch (error) {
      console.error('Session validation failed:', error);
      return {
        isValid: false,
        issues: ['Validation failed'],
        shouldRefresh: true,
      };
    }
  }, [session, user]);

  return {
    validateSession,
    hasValidSession: !!session && !!user,
  };
}