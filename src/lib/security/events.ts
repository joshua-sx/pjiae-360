import { supabase } from '@/integrations/supabase/client';

// Enhanced security event logging with database persistence
export const logSecurityEvent = async (
  eventType: string,
  details?: Record<string, any>,
  success: boolean = true
) => {
  try {
    // Get client information
    const userAgent = navigator?.userAgent || 'Unknown';
    const timestamp = new Date().toISOString();
    
    // Log to console for immediate debugging
    console.log('Security event:', { 
      eventType, 
      details, 
      success, 
      timestamp,
      userAgent 
    });

    // Insert into database for persistent logging
    const { error } = await supabase
      .from('security_audit_log')
      .insert({
        event_type: eventType,
        event_details: {
          ...details,
          timestamp,
          user_agent: userAgent,
          client_info: {
            url: window?.location?.href,
            referrer: document?.referrer
          }
        },
        success,
        user_agent: userAgent
      });

    if (error) {
      console.error('Failed to persist security event to database:', error);
      // Don't throw error to prevent disrupting user flow
    }
  } catch (error) {
    console.error('Failed to log security event:', error);
    // Fail silently to not disrupt user experience
  }
};
