// Enhanced error sanitization
export const sanitizeErrorMessage = (error: any): string => {
  // Don't expose sensitive information in error messages
  const sensitivePatterns = [
    /password/gi,
    /token/gi,
    /key/gi,
    /secret/gi,
    /auth/gi,
    /session/gi,
  ];
  
  let message = error?.message || 'An error occurred';
  
  // Replace sensitive information with generic message
  sensitivePatterns.forEach(pattern => {
    if (pattern.test(message)) {
      message = 'Authentication error occurred';
    }
  });
  
  // Limit message length to prevent information leakage
  if (message.length > 100) {
    message = 'An unexpected error occurred';
  }
  
  return message;
};
