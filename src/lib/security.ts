import { supabase } from "@/integrations/supabase/client";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";

// Simplified password validation for easier testing
export const validatePasswordSecurity = (
  password: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Only check minimum length
  if (password.length < config.passwordMinLength) {
    errors.push(`Password must be at least ${config.passwordMinLength} characters long`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// File validation for CSV uploads
export const validateFileUpload = (file: File): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // File size limit
  if (file.size > config.maxFileUploadSize) {
    errors.push(
      `File size must be less than ${Math.round(config.maxFileUploadSize / 1024 / 1024)}MB`
    );
  }

  // File type validation
  const allowedTypes = ["text/csv", "application/vnd.ms-excel"];
  if (!allowedTypes.includes(file.type) && !file.name.endsWith(".csv")) {
    errors.push("Only CSV files are allowed");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Check for malicious content in CSV
export const scanCSVContent = async (
  content: string
): Promise<{ isSafe: boolean; threats: string[] }> => {
  const threats: string[] = [];

  // Check for script injection attempts
  const scriptPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    /expression\s*\(/gi,
    /=\s*cmd\s*\|/gi, // Command injection
    /=\s*@SUM\(/gi, // Excel formula injection
    /=\s*HYPERLINK\(/gi,
  ];

  scriptPatterns.forEach((pattern) => {
    if (pattern.test(content)) {
      threats.push("Potential script injection detected");
    }
  });

  // Check for suspicious file paths
  if (/\.\.[\/\\]/.test(content)) {
    threats.push("Path traversal attempt detected");
  }

  // Check for SQL injection patterns (relaxed for demo)
  const sqlPatterns = [
    /\bunion\s+select\b/gi,
    /\bdrop\s+table\b/gi,
    /\bdelete\s+from\b/gi,
    /\binsert\s+into.*values\s*\(/gi,
  ];

  sqlPatterns.forEach((pattern) => {
    if (pattern.test(content)) {
      threats.push("Potential SQL injection detected");
    }
  });

  return {
    isSafe: threats.length === 0,
    threats,
  };
};

// Rate limiting utility
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 300000): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];

    // Remove old attempts outside the window
    const recentAttempts = attempts.filter((time) => now - time < windowMs);

    if (recentAttempts.length >= maxAttempts) {
      return false;
    }

    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

// Security event logging
export const logSecurityEvent = async (eventType: string, details?: Record<string, any>) => {
  try {
    // For now, just log via application logger since log_security_event function doesn't exist
    logger.info("Security event", { eventType, details });
  } catch (error) {
    console.error("Failed to log security event:", error);
  }
};

// Session timeout management
export class SessionManager {
  private timeoutDuration = config.sessionTimeoutMs;
  private warningDuration = config.sessionWarningMs;
  private timeoutId?: NodeJS.Timeout;
  private warningId?: NodeJS.Timeout;

  startTimeout(onWarning: () => void, onTimeout: () => void): void {
    this.clearTimeout();

    this.warningId = setTimeout(() => {
      onWarning();
    }, this.warningDuration);

    this.timeoutId = setTimeout(() => {
      onTimeout();
    }, this.timeoutDuration);
  }

  refreshTimeout(onWarning: () => void, onTimeout: () => void): void {
    this.startTimeout(onWarning, onTimeout);
  }

  clearTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    if (this.warningId) {
      clearTimeout(this.warningId);
    }
  }
}

export const sessionManager = new SessionManager();

// Enhanced error sanitization
export const sanitizeErrorMessage = (error: any): string => {
  // Don't expose sensitive information in error messages
  const sensitivePatterns = [/password/gi, /token/gi, /key/gi, /secret/gi, /auth/gi, /session/gi];

  let message = error?.message || "An error occurred";

  // Replace sensitive information with generic message
  sensitivePatterns.forEach((pattern) => {
    if (pattern.test(message)) {
      message = "Authentication error occurred";
    }
  });

  // Limit message length to prevent information leakage
  if (message.length > 100) {
    message = "An unexpected error occurred";
  }

  return message;
};

// Organization context validation
export const validateOrganizationContext = async (requiredRole?: string): Promise<boolean> => {
  try {
    const { data: userRoles } = await supabase.rpc("get_current_user_roles");

    if (!userRoles || userRoles.length === 0) {
      await logSecurityEvent("unauthorized_access_attempt", {
        reason: "no_roles_found",
      });
      return false;
    }

    if (requiredRole && !userRoles.some((r: any) => r.role === requiredRole)) {
      await logSecurityEvent("unauthorized_access_attempt", {
        reason: "insufficient_role",
        required_role: requiredRole,
        user_roles: userRoles.map((r: any) => r.role),
      });
      return false;
    }

    return true;
  } catch (error) {
    await logSecurityEvent("validation_error", {
      error: sanitizeErrorMessage(error),
    });
    return false;
  }
};
