// Advanced email validation utilities
export interface EmailValidationResult {
  isValid: boolean;
  errors: string[];
  suggestions?: string[];
}

// Common email domains and their variations
const COMMON_DOMAINS = {
  'gmail.com': ['gmai.com', 'gmial.com', 'gmail.co', 'gmaill.com'],
  'yahoo.com': ['yaho.com', 'yahoo.co', 'yahooo.com'],
  'hotmail.com': ['hotmai.com', 'hotmial.com', 'hotmal.com'],
  'outlook.com': ['outlok.com', 'outloo.com', 'outlook.co'],
  'company.com': [], // Placeholder for organization domain
};

// Disposable email domains (common temporary email services)
const DISPOSABLE_DOMAINS = [
  '10minutemail.com',
  'tempmail.org',
  'guerrillamail.com',
  'mailinator.com',
  'yopmail.com',
  'sharklasers.com',
  'maildrop.cc',
  'temp-mail.org',
  'throwaway.email',
];

// Professional email patterns
const PROFESSIONAL_PATTERNS = [
  /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
];

export const validateEmailAdvanced = (email: string): EmailValidationResult => {
  const errors: string[] = [];
  const suggestions: string[] = [];
  
  // Basic format check
  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
    return { isValid: false, errors };
  }
  
  const trimmedEmail = email.trim().toLowerCase();
  
  // Length validation
  if (trimmedEmail.length > 254) {
    errors.push('Email address is too long (max 254 characters)');
  }
  
  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    errors.push('Invalid email format');
    return { isValid: false, errors };
  }
  
  // Split email into local and domain parts
  const [localPart, domainPart] = trimmedEmail.split('@');
  
  // Validate local part (before @)
  if (localPart.length > 64) {
    errors.push('Email local part is too long (max 64 characters)');
  }
  
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    errors.push('Email cannot start or end with a period');
  }
  
  if (localPart.includes('..')) {
    errors.push('Email cannot contain consecutive periods');
  }
  
  // Validate domain part (after @)
  if (!domainPart || domainPart.length < 3) {
    errors.push('Invalid domain');
  }
  
  if (domainPart.startsWith('.') || domainPart.endsWith('.')) {
    errors.push('Domain cannot start or end with a period');
  }
  
  if (!domainPart.includes('.')) {
    errors.push('Domain must contain at least one period');
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.{2,}/, // Multiple consecutive dots
    /@.*@/, // Multiple @ symbols
    /\s/, // Whitespace
    /[<>'"]/, // Potentially dangerous characters
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmedEmail)) {
      errors.push('Email contains invalid characters');
      break;
    }
  }
  
  // Check for disposable email domains
  if (DISPOSABLE_DOMAINS.includes(domainPart)) {
    errors.push('Temporary or disposable email addresses are not allowed');
  }
  
  // Domain typo detection and suggestions
  for (const [correctDomain, typos] of Object.entries(COMMON_DOMAINS)) {
    if (typos.includes(domainPart)) {
      suggestions.push(`Did you mean ${localPart}@${correctDomain}?`);
    }
  }
  
  // Additional professional email checks for business contexts
  const isPersonalDomain = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'].includes(domainPart);
  
  return {
    isValid: errors.length === 0,
    errors,
    suggestions,
  };
};

// Validate email for business/professional context
export const validateBusinessEmail = (email: string, organizationDomain?: string): EmailValidationResult => {
  const baseValidation = validateEmailAdvanced(email);
  
  if (!baseValidation.isValid) {
    return baseValidation;
  }
  
  const [, domainPart] = email.toLowerCase().trim().split('@');
  const errors = [...baseValidation.errors];
  const suggestions = [...(baseValidation.suggestions || [])];
  
  // Check if email matches organization domain
  if (organizationDomain && domainPart !== organizationDomain.toLowerCase()) {
    suggestions.push(`Consider using your organization email (@${organizationDomain})`);
  }
  
  // Additional business email validation
  const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
  if (personalDomains.includes(domainPart)) {
    // Note: This is a suggestion, not an error
    suggestions.push('Consider using a professional email address for business purposes');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    suggestions,
  };
};

// Batch email validation for imports
export const validateEmailBatch = (emails: string[]): Map<string, EmailValidationResult> => {
  const results = new Map<string, EmailValidationResult>();
  
  for (const email of emails) {
    results.set(email, validateEmailAdvanced(email));
  }
  
  return results;
};

// Email normalization
export const normalizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '';
  
  let normalized = email.trim().toLowerCase();
  
  // Gmail-specific normalization (remove dots and plus addressing)
  const [localPart, domainPart] = normalized.split('@');
  if (domainPart === 'gmail.com') {
    const cleanLocal = localPart.split('+')[0].replace(/\./g, '');
    normalized = `${cleanLocal}@${domainPart}`;
  }
  
  return normalized;
};