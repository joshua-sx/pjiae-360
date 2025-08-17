import { supabase } from '@/integrations/supabase/client';

/**
 * Enhanced security event logging using secure edge function
 * This ensures all audit logs go through proper authorization and hardening
 */
export const logSecurityEvent = async (
  eventType: string,
  details?: Record<string, any>,
  success: boolean = true
) => {
  try {
    // Log to console for immediate debugging
    console.log('Security event:', { 
      eventType, 
      details, 
      success, 
      timestamp: new Date().toISOString()
    });

    // Always use secure edge function for audit logging - never direct DB access
    const { error } = await supabase.functions.invoke('secure-audit-log', {
      body: {
        eventType,
        eventDetails: {
          ...details,
          client_info: {
            url: typeof window !== 'undefined' ? window?.location?.href : 'server',
            referrer: typeof document !== 'undefined' ? document?.referrer : 'unknown',
            timestamp: new Date().toISOString(),
            source: 'client_logging'
          }
        },
        success
      }
    });

    if (error) {
      console.error('Failed to log security event via edge function:', error);
      // Don't throw error to prevent disrupting user flow
    }
  } catch (error) {
    console.error('Failed to log security event:', error);
    // Fail silently to not disrupt user experience
  }
};

/**
 * Legacy function - deprecated in favor of secure edge function logging
 * @deprecated Use logSecurityEvent instead which routes through secure edge function
 */
export const logSecurityEventDirect = async (
  eventType: string,
  details?: Record<string, any>,
  success: boolean = true
) => {
  console.warn('DEPRECATED: Direct security logging bypasses authorization. Use logSecurityEvent instead.');
  return logSecurityEvent(eventType, details, success);
};
