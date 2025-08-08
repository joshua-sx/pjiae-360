// Security event logging
export const logSecurityEvent = async (
  eventType: string,
  details?: Record<string, any>
) => {
  try {
    // For now, just log to console since log_security_event function doesn't exist
    console.log('Security event:', { eventType, details });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};
