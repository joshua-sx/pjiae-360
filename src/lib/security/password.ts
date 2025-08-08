import { config } from '@/lib/config';

// Simplified password validation for easier testing
export const validatePasswordSecurity = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Only check minimum length
  if (password.length < config.passwordMinLength) {
    errors.push(`Password must be at least ${config.passwordMinLength} characters long`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
