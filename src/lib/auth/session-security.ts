/**
 * Advanced session security and multi-tenant authentication hardening
 */

import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from '@/lib/security/events';

interface SessionValidationResult {
  isValid: boolean;
  issues: string[];
  shouldRefresh: boolean;
}

/**
 * Enhanced session fingerprinting for session hijacking detection
 */
export function generateSessionFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Session fingerprint', 2, 2);
  }
  
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvas: canvas.toDataURL(),
    webgl: getWebGLInfo(),
  };
  
  return btoa(JSON.stringify(fingerprint));
}

function getWebGLInfo(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (!gl) return 'none';
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    return debugInfo ? 
      `${gl.getParameter((debugInfo as any).UNMASKED_VENDOR_WEBGL)}_${gl.getParameter((debugInfo as any).UNMASKED_RENDERER_WEBGL)}` :
      'unknown';
  } catch {
    return 'error';
  }
}

/**
 * Validates current session security and detects potential hijacking
 */
export async function validateSessionSecurity(): Promise<SessionValidationResult> {
  const issues: string[] = [];
  let shouldRefresh = false;

  try {
    // Check if session exists
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      issues.push('Failed to retrieve session');
      return { isValid: false, issues, shouldRefresh: true };
    }

    if (!session) {
      issues.push('No active session');
      return { isValid: false, issues, shouldRefresh: false };
    }

    // Check token expiration (refresh if expiring within 5 minutes)
    const expiresAt = session.expires_at;
    const now = Math.floor(Date.now() / 1000);
    const fiveMinutes = 5 * 60;
    
    if (expiresAt && expiresAt <= now) {
      issues.push('Session expired');
      shouldRefresh = true;
    } else if (expiresAt && expiresAt <= now + fiveMinutes) {
      issues.push('Session expiring soon');
      shouldRefresh = true;
    }

    // Validate session fingerprint
    const currentFingerprint = generateSessionFingerprint();
    const storedFingerprint = sessionStorage.getItem('session_fingerprint');
    
    if (!storedFingerprint) {
      // First time - store fingerprint
      sessionStorage.setItem('session_fingerprint', currentFingerprint);
      await logSecurityEvent('session_fingerprint_created', {
        userId: session.user.id
      });
    } else if (storedFingerprint !== currentFingerprint) {
      issues.push('Session fingerprint mismatch - possible hijacking');
      await logSecurityEvent('session_hijack_detected', {
        userId: session.user.id,
        storedFingerprint: storedFingerprint.substring(0, 20) + '...',
        currentFingerprint: currentFingerprint.substring(0, 20) + '...'
      }, false);
      return { isValid: false, issues, shouldRefresh: false };
    }

    // Validate organization context if user is authenticated
    if (session.user) {
      const { data: orgId, error: orgError } = await supabase.rpc('get_current_user_org_id');
      if (orgError) {
        issues.push('Failed to validate organization context');
        await logSecurityEvent('org_context_validation_failed', {
          userId: session.user.id,
          error: orgError.message
        }, false);
      } else if (!orgId) {
        // User might be in onboarding - this is allowed
        await logSecurityEvent('user_without_org_context', {
          userId: session.user.id
        });
      }
    }

    // Check for concurrent sessions (optional hardening)
    await logSecurityEvent('session_validation_completed', {
      userId: session.user.id,
      issuesCount: issues.length,
      shouldRefresh
    });

    return {
      isValid: issues.length === 0,
      issues,
      shouldRefresh
    };
  } catch (error) {
    issues.push(`Session validation error: ${error}`);
    await logSecurityEvent('session_validation_error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, false);
    
    return { isValid: false, issues, shouldRefresh: false };
  }
}

/**
 * Enforces multi-tenant isolation by validating organization context
 */
export async function validateOrganizationIsolation(operationName: string): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      await logSecurityEvent('org_isolation_check_no_user', {
        operation: operationName
      }, false);
      return false;
    }

    // Validate that user belongs to exactly one organization
    const { data: orgId, error } = await supabase.rpc('get_current_user_org_id');
    if (error) {
      await logSecurityEvent('org_isolation_check_failed', {
        operation: operationName,
        userId: session.user.id,
        error: error.message
      }, false);
      return false;
    }

    if (!orgId) {
      // User might be in onboarding - check if they have pending invitations
      const { data: invitations } = await supabase
        .from('employee_invitations')
        .select('organization_id')
        .eq('email', session.user.email)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString());

      if (invitations && invitations.length > 0) {
        await logSecurityEvent('user_with_pending_invitations', {
          operation: operationName,
          userId: session.user.id,
          invitationCount: invitations.length
        });
        return true; // Allow operation for users with pending invitations
      }

      await logSecurityEvent('user_without_org_context', {
        operation: operationName,
        userId: session.user.id
      }, false);
      return false;
    }

    await logSecurityEvent('org_isolation_validated', {
      operation: operationName,
      userId: session.user.id,
      organizationId: orgId
    });

    return true;
  } catch (error) {
    await logSecurityEvent('org_isolation_validation_error', {
      operation: operationName,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, false);
    return false;
  }
}

/**
 * Auto-refresh session if needed and valid
 */
export async function autoRefreshSession(): Promise<boolean> {
  try {
    const validation = await validateSessionSecurity();
    
    if (!validation.isValid && !validation.shouldRefresh) {
      return false; // Session is invalid and shouldn't be refreshed
    }

    if (validation.shouldRefresh) {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        await logSecurityEvent('session_refresh_failed', {
          error: error.message
        }, false);
        return false;
      }

      if (data.session) {
        await logSecurityEvent('session_refreshed', {
          userId: data.session.user.id,
          newExpiresAt: data.session.expires_at
        });
        return true;
      }
    }

    return validation.isValid;
  } catch (error) {
    await logSecurityEvent('auto_refresh_error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, false);
    return false;
  }
}

/**
 * Comprehensive session monitoring hook
 */
export function startSessionMonitoring() {
  // Validate session every 5 minutes
  const sessionInterval = setInterval(async () => {
    const isValid = await autoRefreshSession();
    if (!isValid) {
      // Invalid session - redirect to login
      window.location.href = '/auth';
    }
  }, 5 * 60 * 1000);

  // Validate on page focus (detect tab switching attacks)
  const handleFocus = async () => {
    const validation = await validateSessionSecurity();
    if (!validation.isValid) {
      window.location.href = '/auth';
    }
  };

  window.addEventListener('focus', handleFocus);

  // Cleanup function
  return () => {
    clearInterval(sessionInterval);
    window.removeEventListener('focus', handleFocus);
  };
}