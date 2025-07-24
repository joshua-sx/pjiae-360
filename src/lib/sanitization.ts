import DOMPurify from 'dompurify';

// Configure DOMPurify for strict sanitization
const purifyConfig = {
  ALLOWED_TAGS: [], // No HTML tags allowed
  ALLOWED_ATTR: [], // No attributes allowed
  KEEP_CONTENT: true, // Keep text content
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,
};

// Sanitize user input to prevent XSS
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // First pass: Remove HTML tags and attributes
  let sanitized = DOMPurify.sanitize(input, purifyConfig);
  
  // Second pass: Additional cleaning for special cases
  sanitized = sanitized
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/data:/gi, '') // Remove data: protocols
    .replace(/vbscript:/gi, '') // Remove vbscript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
  
  return sanitized;
};

// Sanitize email addresses
export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '';
  
  return email
    .toLowerCase()
    .trim()
    .replace(/[^\w@.-]/g, ''); // Keep only alphanumeric, @, ., and -
};

// Sanitize names (first name, last name, display name)
export const sanitizeName = (name: string): string => {
  if (!name || typeof name !== 'string') return '';
  
  let sanitized = sanitizeInput(name);
  
  // Additional name-specific cleaning
  sanitized = sanitized
    .replace(/[^\w\s'-]/g, '') // Keep only letters, spaces, hyphens, and apostrophes
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
  
  return sanitized;
};

// Sanitize job titles and organizational data
export const sanitizeJobTitle = (title: string): string => {
  if (!title || typeof title !== 'string') return '';
  
  let sanitized = sanitizeInput(title);
  
  // Keep alphanumeric, spaces, hyphens, apostrophes, parentheses, and common punctuation
  sanitized = sanitized
    .replace(/[^\w\s'-().,&]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  return sanitized;
};

// Sanitize CSV data before parsing
export const sanitizeCSVData = (csvData: string): string => {
  if (!csvData || typeof csvData !== 'string') return '';
  
  // Remove potential script injections while preserving CSV structure
  let sanitized = csvData
    .replace(/<script[\s\S]*?<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/data:text\/html/gi, '') // Remove data URIs
    .replace(/=\s*@/g, '@') // Remove formula prefixes (Excel injection protection)
    .replace(/=\s*\+/g, '+') // Remove formula prefixes
    .replace(/=\s*-/g, '-') // Remove formula prefixes
    .replace(/=\s*\*/g, '*') // Remove formula prefixes
    .replace(/=\s*\//g, '/') // Remove formula prefixes
    .trim();
  
  return sanitized;
};

// Sanitize text areas (descriptions, justifications, etc.)
export const sanitizeTextArea = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  
  let sanitized = sanitizeInput(text);
  
  // Preserve line breaks but remove other formatting
  sanitized = sanitized
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n') // Normalize line endings
    .replace(/\n{3,}/g, '\n\n') // Limit consecutive line breaks
    .trim();
  
  return sanitized;
};

// Sanitize object with multiple fields
export const sanitizeObject = <T extends Record<string, any>>(
  obj: T,
  fieldSanitizers: Partial<Record<keyof T, (value: any) => any>>
): T => {
  const sanitized = { ...obj } as Record<string, any>;
  
  for (const [key, sanitizer] of Object.entries(fieldSanitizers)) {
    if (sanitized[key] !== undefined && sanitizer) {
      sanitized[key] = sanitizer(sanitized[key]);
    }
  }
  
  return sanitized as T;
};

// General purpose sanitizer for form data
export const sanitizeFormData = (data: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Apply appropriate sanitization based on field type
      if (key.toLowerCase().includes('email')) {
        sanitized[key] = sanitizeEmail(value);
      } else if (key.toLowerCase().includes('name')) {
        sanitized[key] = sanitizeName(value);
      } else if (key.toLowerCase().includes('title') || key.toLowerCase().includes('position')) {
        sanitized[key] = sanitizeJobTitle(value);
      } else {
        sanitized[key] = sanitizeInput(value);
      }
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};
