import { toast } from 'sonner';
import { logSecurityEvent } from './events';

/**
 * Enhanced error handling for multi-tenant operations
 * Maps Supabase errors to user-friendly messages while maintaining security audit trails
 */

export interface TenancyError {
  code: string;
  message: string;
  userMessage: string;
  shouldRedirect?: boolean;
}

export const TENANCY_ERRORS: Record<string, TenancyError> = {
  PGRST301: {
    code: 'INSUFFICIENT_PRIVILEGES',
    message: 'Insufficient privileges for this operation',
    userMessage: "You don't have permission to access this data in your organization.",
  },
  PGRST116: {
    code: 'RLS_VIOLATION', 
    message: 'Row level security policy violation',
    userMessage: "Access denied - this data belongs to a different organization.",
  },
  '42501': {
    code: 'PERMISSION_DENIED',
    message: 'Permission denied for operation',
    userMessage: "You don't have the required permissions for this action.",
  },
  CROSS_ORG_ACCESS: {
    code: 'CROSS_ORG_ACCESS',
    message: 'Cross-organization access attempt detected',
    userMessage: "Access denied - data isolation violation detected.",
    shouldRedirect: true,
  },
  SESSION_EXPIRED: {
    code: 'SESSION_EXPIRED',
    message: 'Session has expired or is invalid',
    userMessage: "Your session has expired. Please log in again.",
    shouldRedirect: true,
  }
};

/**
 * Handle tenancy-related errors with proper user feedback and security logging
 */
export const handleTenancyError = async (
  error: any,
  operation: string,
  additionalContext?: Record<string, any>
) => {
  const errorCode = error?.code || error?.error_code || 'UNKNOWN';
  const tenancyError = TENANCY_ERRORS[errorCode];
  
  if (tenancyError) {
    // Log security violation
    await logSecurityEvent('tenancy_violation_detected', {
      operation,
      error_code: errorCode,
      error_message: error?.message || 'Unknown error',
      ...additionalContext
    }, false);
    
    // Show user-friendly message
    toast.error(tenancyError.userMessage);
    
    // Redirect if necessary (e.g., session expired)
    if (tenancyError.shouldRedirect) {
      setTimeout(() => {
        window.location.href = '/log-in';
      }, 2000);
    }
    
    return tenancyError;
  }
  
  // Handle generic errors
  const genericMessage = "An error occurred. Please try again or contact support if the problem persists.";
  toast.error(genericMessage);
  
  // Log generic error for investigation
  await logSecurityEvent('operation_error', {
    operation,
    error_code: errorCode,
    error_message: error?.message || 'Unknown error',
    ...additionalContext
  }, false);
  
  return {
    code: 'GENERIC_ERROR',
    message: error?.message || 'Unknown error',
    userMessage: genericMessage
  };
};

/**
 * Check if an error is tenancy-related
 */
export const isTenancyError = (error: any): boolean => {
  const errorCode = error?.code || error?.error_code;
  return errorCode && TENANCY_ERRORS[errorCode] !== undefined;
};

/**
 * Extract organization context from error for logging
 */
export const extractErrorContext = (error: any, operation: string) => {
  return {
    operation,
    timestamp: new Date().toISOString(),
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    error_details: {
      code: error?.code || error?.error_code,
      message: error?.message,
      hint: error?.hint,
      details: error?.details
    }
  };
};