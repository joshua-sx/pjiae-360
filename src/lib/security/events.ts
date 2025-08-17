import { supabase } from '@/integrations/supabase/client';

// Enhanced security event logging using secure edge function
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

    // Use secure edge function for audit logging
    const { error } = await supabase.functions.invoke('secure-audit-log', {
      body: {
        eventType,
        eventDetails: {
          ...details,
          client_info: {
            url: window?.location?.href,
            referrer: document?.referrer,
            timestamp: new Date().toISOString()
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
