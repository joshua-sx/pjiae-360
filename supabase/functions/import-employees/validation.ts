import { z } from 'https://deno.land/x/zod@v3.22.2/mod.ts'
import type { ImportRequest, ValidationResult, EmailValidationResult, SecurityContext } from './types.ts'

// Security configurations
export const SECURITY_CONFIG = {
  MAX_REQUEST_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_EMPLOYEES_PER_IMPORT: 500,
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
  MAX_REQUESTS_PER_WINDOW: 5,
  REQUEST_TIMEOUT: 30 * 1000, // 30 seconds
  ALLOWED_EMAIL_DOMAINS: [], // Empty means all domains allowed, add domains to restrict
  BLOCKED_DISPOSABLE_DOMAINS: [
    '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
    'yopmail.com', 'temp-mail.org', 'throwaway.email', 'sharklasers.com'
  ]
}

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Enhanced input sanitization functions
export const sanitizeString = (str: string): string => {
  if (!str || typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .substring(0, 255); // Limit length
};

export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '';
  return email
    .toLowerCase()
    .trim()
    .replace(/[^\w@.-]/g, ''); // Keep only valid email characters
};

export const sanitizeName = (name: string): string => {
  if (!name || typeof name !== 'string') return '';
  return name
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[^\w\s'-]/g, '') // Keep only letters, spaces, hyphens, apostrophes
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .substring(0, 100); // Limit length
};

// Security middleware functions
export const checkRateLimit = (identifier: string): boolean => {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + SECURITY_CONFIG.RATE_LIMIT_WINDOW })
    return true
  }
  
  if (record.count >= SECURITY_CONFIG.MAX_REQUESTS_PER_WINDOW) {
    return false
  }
  
  record.count++
  return true
}

export const validateEmailDomain = (email: string): EmailValidationResult => {
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return { valid: false, reason: 'Invalid email format' }
  
  // Check against blocked disposable domains
  if (SECURITY_CONFIG.BLOCKED_DISPOSABLE_DOMAINS.includes(domain)) {
    return { valid: false, reason: 'Disposable email domains not allowed' }
  }
  
  // Check against allowed domains (if configured)
  if (SECURITY_CONFIG.ALLOWED_EMAIL_DOMAINS.length > 0 && 
      !SECURITY_CONFIG.ALLOWED_EMAIL_DOMAINS.includes(domain)) {
    return { valid: false, reason: 'Email domain not in allowed list' }
  }
  
  return { valid: true }
}

// Request validation schema
const importRequestSchema = z.object({
  orgName: z.string()
    .min(1, "Organization name is required")
    .max(255, "Organization name too long")
    .transform(sanitizeString),
  people: z.array(
    z.object({
      id: z.string().uuid("Invalid employee ID"),
      firstName: z.string()
        .min(1, "First name is required")
        .max(100, "First name too long")
        .transform(sanitizeName),
      lastName: z.string()
        .min(1, "Last name is required")
        .max(100, "Last name too long")
        .transform(sanitizeName),
      email: z.string()
        .email("Invalid email format")
        .max(254, "Email too long")
        .transform(sanitizeEmail)
        .refine((email) => {
          // Additional email validation
          const parts = email.split('@');
          if (parts.length !== 2) return false;
          const [local, domain] = parts;
          return local.length > 0 && local.length <= 64 && domain.includes('.');
        }, "Invalid email format"),
      jobTitle: z.string()
        .max(150, "Job title too long")
        .transform(sanitizeString),
      department: z.string()
        .max(100, "Department name too long")
        .transform(sanitizeString)
        .optional(),
      division: z.string()
        .max(100, "Division name too long")
        .transform(sanitizeString)
        .optional(),
      employeeId: z.number().int().positive().optional(),
      role: z.string()
        .max(50, "Role name too long")
        .transform(sanitizeString)
        .optional()
    })
  ).min(1, "At least one employee is required").max(1000, "Too many employees in single import"),
  adminInfo: z.object({
    name: z.string()
      .min(1, "Admin name is required")
      .max(255, "Admin name too long")
      .transform(sanitizeName),
    email: z.string()
      .email("Invalid admin email")
      .transform(sanitizeEmail),
    role: z.string()
      .max(50, "Role too long")
      .transform(sanitizeString)
  })
})

// Security logger
export const securityLog = (event: string, details: any, level: 'info' | 'warn' | 'error' = 'info') => {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    event,
    level,
    ...details
  }
  console.log(`[SECURITY-${level.toUpperCase()}]`, JSON.stringify(logEntry))
}

// Main validation function
export const validateImportRequest = (body: any, context: SecurityContext): ValidationResult => {
  try {
    // Parse and validate request body
    const validatedData = importRequestSchema.parse(body)
    
    // Additional security validations
    if (validatedData.people.length > SECURITY_CONFIG.MAX_EMPLOYEES_PER_IMPORT) {
      securityLog('employee_limit_exceeded', { 
        userId: context.userId, 
        clientIP: context.clientIP,
        employeeCount: validatedData.people.length 
      }, 'warn')
      return { valid: false, error: 'Too many employees' }
    }

    // Validate email domains
    for (const person of validatedData.people) {
      const emailValidation = validateEmailDomain(person.email)
      if (!emailValidation.valid) {
        securityLog('invalid_email_domain', { 
          userId: context.userId, 
          clientIP: context.clientIP,
          email: person.email,
          reason: emailValidation.reason 
        }, 'warn')
        return { valid: false, error: `Invalid email domain: ${emailValidation.reason}` }
      }
    }

    return { valid: true, data: validatedData }
  } catch (validationError) {
    securityLog('validation_failed', { 
      userId: context.userId, 
      clientIP: context.clientIP,
      errors: validationError.errors || []
    }, 'warn')
    return { valid: false, error: validationError.message || 'Validation failed' }
  }
}

// Request security checks
export const validateRequestSecurity = (req: Request, context: SecurityContext): { valid: boolean; error?: string } => {
  // Rate limiting check
  if (!checkRateLimit(context.clientIP)) {
    securityLog('rate_limit_exceeded', { ip: context.clientIP }, 'warn')
    return { valid: false, error: 'Rate limit exceeded' }
  }

  // Request size validation
  const contentLength = req.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > SECURITY_CONFIG.MAX_REQUEST_SIZE) {
    securityLog('request_too_large', { 
      ip: context.clientIP, 
      size: contentLength 
    }, 'warn')
    return { valid: false, error: 'Request too large' }
  }

  return { valid: true }
}