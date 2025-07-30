import { supabase } from '@/integrations/supabase/client';

// Enhanced password security configuration
export const PASSWORD_CONFIG = {
  MIN_LENGTH: 12,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: true,
  PREVENT_COMMON_PASSWORDS: true,
  PREVENT_PERSONAL_INFO: true,
  PASSWORD_HISTORY_COUNT: 5
};

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
}

export function validatePasswordStrength(password: string, userInfo?: {
  firstName?: string;
  lastName?: string;
  email?: string;
}): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  // Length check
  if (password.length < PASSWORD_CONFIG.MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_CONFIG.MIN_LENGTH} characters long`);
  } else {
    score += 1;
  }

  // Character type checks
  if (PASSWORD_CONFIG.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (PASSWORD_CONFIG.REQUIRE_UPPERCASE) {
    score += 1;
  }

  if (PASSWORD_CONFIG.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (PASSWORD_CONFIG.REQUIRE_LOWERCASE) {
    score += 1;
  }

  if (PASSWORD_CONFIG.REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else if (PASSWORD_CONFIG.REQUIRE_NUMBERS) {
    score += 1;
  }

  if (PASSWORD_CONFIG.REQUIRE_SPECIAL_CHARS && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else if (PASSWORD_CONFIG.REQUIRE_SPECIAL_CHARS) {
    score += 1;
  }

  // Personal information check
  if (PASSWORD_CONFIG.PREVENT_PERSONAL_INFO && userInfo) {
    const lowerPassword = password.toLowerCase();
    const personalInfo = [
      userInfo.firstName?.toLowerCase(),
      userInfo.lastName?.toLowerCase(),
      userInfo.email?.split('@')[0]?.toLowerCase()
    ].filter(Boolean);

    for (const info of personalInfo) {
      if (info && lowerPassword.includes(info)) {
        errors.push('Password cannot contain personal information');
        break;
      }
    }
  }

  // Common passwords check (basic implementation)
  const commonPasswords = [
    'password', '123456', 'password123', 'admin', 'qwerty',
    'letmein', 'welcome', 'monkey', '1234567890'
  ];
  
  if (PASSWORD_CONFIG.PREVENT_COMMON_PASSWORDS) {
    const lowerPassword = password.toLowerCase();
    if (commonPasswords.some(common => lowerPassword.includes(common))) {
      errors.push('Password cannot contain common password patterns');
    }
  }

  // Additional strength scoring
  if (password.length >= 16) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]{2,}/.test(password)) score += 1;
  if (/\d{2,}/.test(password)) score += 1;

  // Determine strength
  let strength: PasswordValidationResult['strength'];
  if (score >= 7) strength = 'very-strong';
  else if (score >= 5) strength = 'strong';
  else if (score >= 3) strength = 'medium';
  else strength = 'weak';

  return {
    isValid: errors.length === 0,
    errors,
    strength
  };
}

export async function checkPasswordHistory(password: string): Promise<boolean> {
  try {
    // This would require implementing a secure password history check
    // For now, we'll return true (password is not in history)
    // In a real implementation, you'd hash the password and check against stored hashes
    return true;
  } catch (error) {
    console.error('Failed to check password history:', error);
    return true; // Fail open for now
  }
}

export function logSecurityEvent(
  eventType: string,
  details: Record<string, any>,
  success = true
) {
  // Get client IP and user agent (limited in browser environment)
  const userAgent = navigator.userAgent;
  
  return supabase
    .from('security_audit_log')
    .insert({
      event_type: eventType,
      event_details: details,
      user_agent: userAgent,
      success: success
    });
}

// Session security helpers
export function getSessionFingerprint(): string {
  // Create a basic browser fingerprint for session validation
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx!.textBaseline = 'top';
  ctx!.font = '14px Arial';
  ctx!.fillText('Browser fingerprint', 2, 2);
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
}

export function validateSessionSecurity(): boolean {
  // Check for session hijacking indicators
  const storedFingerprint = sessionStorage.getItem('session_fingerprint');
  const currentFingerprint = getSessionFingerprint();
  
  if (!storedFingerprint) {
    sessionStorage.setItem('session_fingerprint', currentFingerprint);
    return true;
  }
  
  if (storedFingerprint !== currentFingerprint) {
    logSecurityEvent('session_fingerprint_mismatch', {
      stored: storedFingerprint,
      current: currentFingerprint
    }, false);
    return false;
  }
  
  return true;
}