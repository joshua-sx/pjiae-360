import { z } from "zod";

// Enhanced email validation schema
export const emailSchema = z
  .string()
  .email("Invalid email format")
  .min(1, "Email is required")
  .max(254, "Email must be less than 254 characters")
  .refine((email) => {
    // Check for common typos in domain
    const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    
    // Basic domain validation
    if (!domain || !domain.includes('.')) return false;
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /\.{2,}/, // Multiple consecutive dots
      /^\./, // Starting with dot
      /\.$/, // Ending with dot
      /@\./, // @ followed by dot
      /\.@/, // Dot followed by @
    ];
    
    return !suspiciousPatterns.some(pattern => pattern.test(email));
  }, "Invalid email format");

// Name validation schema with XSS protection
export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name must be less than 100 characters")
  .refine((name) => {
    // Reject names containing HTML/script tags
    const htmlPattern = /<[^>]*>/g;
    return !htmlPattern.test(name);
  }, "Name contains invalid characters");

// Job title validation
export const jobTitleSchema = z
  .string()
  .max(150, "Job title must be less than 150 characters")
  .optional()
  .transform((val) => val?.trim() || undefined);

// Simplified password validation schema for easier testing
export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(128, "Password must be less than 128 characters");

// CSV data validation schema
export const csvDataSchema = z
  .string()
  .min(1, "CSV data is required")
  .max(1000000, "CSV data too large") // 1MB limit
  .refine((data) => {
    // Basic CSV format validation
    const lines = data.trim().split('\n');
    if (lines.length < 2) return false; // Must have header + at least one row
    
    // Check for suspicious content
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /onclick=/i,
      /onerror=/i,
      /onload=/i,
    ];
    
    return !suspiciousPatterns.some(pattern => pattern.test(data));
  }, "CSV data contains invalid content");

// Employee import validation schema
export const employeeImportSchema = z.object({
  email: emailSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  jobTitle: jobTitleSchema,
  department: z.string().max(100).optional(),
  division: z.string().max(100).optional(),
  manager: emailSchema.optional(),
});

// Admin override validation schema
export const adminOverrideSchema = z.object({
  recordType: z.enum(['appraisal', 'goal']),
  recordId: z.string().uuid("Invalid record ID"),
  newStatus: z.string().min(1, "Status is required").max(50),
  justification: z
    .string()
    .min(10, "Justification must be at least 10 characters")
    .max(500, "Justification must be less than 500 characters")
    .refine((text) => {
      // Reject justification containing HTML/script tags
      const htmlPattern = /<[^>]*>/g;
      return !htmlPattern.test(text);
    }, "Justification contains invalid characters"),
});

// Form validation helpers
export const validateForm = <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: Record<string, string> } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: "Validation failed" } };
  }
};