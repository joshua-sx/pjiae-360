import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from './events';
import { validatePasswordStrength, checkPasswordHistory } from '@/lib/enhanced-security';
import { persistentRateLimiter } from './LocalStorageRateLimiter';

export interface AuthSecurityConfig {
  maxFailedAttempts: number;
  lockoutDuration: number; // in minutes
  requireEmailVerification: boolean;
  enablePasswordHistory: boolean;
}

export const DEFAULT_AUTH_CONFIG: AuthSecurityConfig = {
  maxFailedAttempts: 5,
  lockoutDuration: 15,
  requireEmailVerification: true,
  enablePasswordHistory: true
};

// Track failed login attempts in memory (in production, use Redis)
const failedAttempts = new Map<string, { count: number; lastAttempt: Date; lockedUntil?: Date }>();

export async function secureSignIn(email: string, password: string): Promise<{
  success: boolean;
  error?: string;
  requiresVerification?: boolean;
  waitTime?: number;
}> {
  try {
    // Check rate limiting first
    const rateLimitResult = await persistentRateLimiter.isAllowed(
      `login:${email}`, 
      DEFAULT_AUTH_CONFIG.maxFailedAttempts, 
      DEFAULT_AUTH_CONFIG.lockoutDuration * 60000
    );

    if (!rateLimitResult.allowed) {
      await logSecurityEvent('login_rate_limited', { 
        email, 
        waitTimeMs: rateLimitResult.waitTimeMs,
        backoffLevel: rateLimitResult.backoffLevel 
      }, false);
      
      return {
        success: false,
        error: `Too many failed attempts. Please wait ${Math.ceil(rateLimitResult.waitTimeMs / 60000)} minutes before trying again.`,
        waitTime: rateLimitResult.waitTimeMs
      };
    }

    // Attempt sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      // Track failed attempt
      const current = failedAttempts.get(email) || { count: 0, lastAttempt: new Date() };
      current.count += 1;
      current.lastAttempt = new Date();

      if (current.count >= DEFAULT_AUTH_CONFIG.maxFailedAttempts) {
        current.lockedUntil = new Date(Date.now() + DEFAULT_AUTH_CONFIG.lockoutDuration * 60000);
        await logSecurityEvent('account_locked', { email, attempts: current.count }, false);
      }

      failedAttempts.set(email, current);
      
      await logSecurityEvent('login_failed', { 
        email, 
        error: error.message,
        attempts: current.count 
      }, false);

      return {
        success: false,
        error: error.message
      };
    }

    // Clear failed attempts on successful login
    failedAttempts.delete(email);
    persistentRateLimiter.reset(`login:${email}`);

    // Check if email verification is required
    if (DEFAULT_AUTH_CONFIG.requireEmailVerification && !data.user?.email_confirmed_at) {
      await logSecurityEvent('login_unverified_email', { email }, false);
      return {
        success: false,
        requiresVerification: true,
        error: 'Please verify your email before signing in.'
      };
    }

    await logSecurityEvent('login_success', { email, userId: data.user?.id }, true);

    return { success: true };

  } catch (error) {
    await logSecurityEvent('login_error', { 
      email, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, false);
    
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    };
  }
}

export async function secureSignUp(
  email: string, 
  password: string, 
  userData: { firstName?: string; lastName?: string; organizationId?: string }
): Promise<{
  success: boolean;
  error?: string;
  requiresVerification?: boolean;
}> {
  try {
    // Validate password strength
    const passwordValidation = validatePasswordStrength(password, {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email
    });

    if (!passwordValidation.isValid) {
      await logSecurityEvent('signup_weak_password', { 
        email, 
        errors: passwordValidation.errors 
      }, false);
      
      return {
        success: false,
        error: passwordValidation.errors.join('. ')
      };
    }

    // Check password history (if user already exists)
    if (DEFAULT_AUTH_CONFIG.enablePasswordHistory) {
      const isInHistory = await checkPasswordHistory(password);
      if (!isInHistory) {
        await logSecurityEvent('signup_password_reused', { email }, false);
        return {
          success: false,
          error: 'Please choose a password you haven\'t used before.'
        };
      }
    }

    // Attempt sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.firstName || '',
          last_name: userData.lastName || '',
          organization_id: userData.organizationId || null
        }
      }
    });

    if (error) {
      await logSecurityEvent('signup_failed', { 
        email, 
        error: error.message 
      }, false);
      
      return {
        success: false,
        error: error.message
      };
    }

    await logSecurityEvent('signup_success', { 
      email, 
      userId: data.user?.id,
      requiresConfirmation: !data.user?.email_confirmed_at 
    }, true);

    return {
      success: true,
      requiresVerification: !data.user?.email_confirmed_at
    };

  } catch (error) {
    await logSecurityEvent('signup_error', { 
      email, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, false);
    
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    };
  }
}

export async function resendVerification(email: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email
    });

    if (error) {
      await logSecurityEvent('verification_resend_failed', { 
        email, 
        error: error.message 
      }, false);
      
      return {
        success: false,
        error: error.message
      };
    }

    await logSecurityEvent('verification_resend_success', { email }, true);
    
    return { success: true };

  } catch (error) {
    await logSecurityEvent('verification_resend_error', { 
      email, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, false);
    
    return {
      success: false,
      error: 'Failed to resend verification email.'
    };
  }
}

export function clearFailedAttempts(email: string): void {
  failedAttempts.delete(email);
  persistentRateLimiter.reset(`login:${email}`);
}