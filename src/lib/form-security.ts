import { z } from "zod";
import { sanitizeInput, sanitizeName, sanitizeEmail, sanitizeJobTitle, sanitizeTextArea } from "./sanitization";
import { validateForm } from "./validation";

/**
 * Comprehensive form security and validation utilities
 * 
 * This module provides secure form handling with automatic sanitization
 * and validation to prevent XSS, injection attacks, and data corruption.
 */

// Enhanced validation schemas with built-in sanitization
export const secureProfileSchema = z.object({
  first_name: z.string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters")
    .transform(sanitizeName),
  last_name: z.string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters")
    .transform(sanitizeName),
  job_title: z.string()
    .max(100, "Job title must be less than 100 characters")
    .optional()
    .transform(val => val ? sanitizeJobTitle(val) : undefined),
  department_id: z.string().uuid().optional().or(z.literal("")),
  division_id: z.string().uuid().optional().or(z.literal("")),
  manager_id: z.string().uuid().optional().or(z.literal("")),
  hire_date: z.string().optional().or(z.literal(""))
});

export const secureGoalSchema = z.object({
  title: z.string()
    .min(1, "Goal title is required")
    .max(200, "Goal title must be less than 200 characters")
    .transform(sanitizeInput),
  description: z.string()
    .max(1000, "Goal description must be less than 1000 characters")
    .optional()
    .transform(val => val ? sanitizeTextArea(val) : undefined),
  priority: z.enum(["Low", "Medium", "High"]),
  dueDate: z.string().optional()
});

export const secureFeedbackSchema = z.object({
  feedback: z.string()
    .max(2000, "Feedback must be less than 2000 characters")
    .transform(sanitizeTextArea),
  rating: z.number().min(1).max(5).optional()
});

// Secure form data processor
export function processSecureFormData<T>(
  schema: z.ZodSchema<T>,
  formData: Record<string, any>
): { success: boolean; data?: T; errors?: Record<string, string> } {
  try {
    // First, sanitize all string fields
    const sanitizedData = Object.entries(formData).reduce((acc, [key, value]) => {
      if (typeof value === 'string') {
        // Apply basic sanitization to all string fields
        acc[key] = sanitizeInput(value);
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    // Then validate with schema (which may apply additional transformations)
    return validateForm(schema, sanitizedData);
  } catch (error) {
    console.error("Form security processing error:", error);
    return { 
      success: false, 
      errors: { general: "Form processing failed" } 
    };
  }
}

// Input validation for real-time feedback
export function validateInputSecurity(value: string, maxLength: number = 1000): {
  isValid: boolean;
  sanitizedValue: string;
  warnings: string[];
} {
  const warnings: string[] = [];
  let sanitizedValue = sanitizeInput(value);
  
  // Check for potential security issues
  if (value !== sanitizedValue) {
    warnings.push("Potentially harmful content was removed");
  }
  
  if (sanitizedValue.length > maxLength) {
    sanitizedValue = sanitizedValue.substring(0, maxLength);
    warnings.push(`Input was truncated to ${maxLength} characters`);
  }
  
  return {
    isValid: warnings.length === 0,
    sanitizedValue,
    warnings
  };
}

// Date validation helper
export function validateAndSanitizeDate(dateString: string): Date | null {
  if (!dateString || typeof dateString !== 'string') return null;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    
    // Ensure reasonable date range (not too far in past/future)
    const now = new Date();
    const minDate = new Date(1900, 0, 1);
    const maxDate = new Date(now.getFullYear() + 10, 11, 31);
    
    if (date < minDate || date > maxDate) return null;
    
    return date;
  } catch {
    return null;
  }
}

// Comprehensive form validation status
export interface FormSecurityStatus {
  isSecure: boolean;
  fieldValidations: Record<string, {
    isValid: boolean;
    sanitized: boolean;
    warnings: string[];
  }>;
  globalWarnings: string[];
}

export function assessFormSecurity(formData: Record<string, any>): FormSecurityStatus {
  const fieldValidations: Record<string, any> = {};
  const globalWarnings: string[] = [];
  let isSecure = true;

  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === 'string') {
      const validation = validateInputSecurity(value);
      fieldValidations[key] = {
        isValid: validation.isValid,
        sanitized: value !== validation.sanitizedValue,
        warnings: validation.warnings
      };
      
      if (!validation.isValid) {
        isSecure = false;
      }
    }
  }

  // Check for suspicious patterns across the form
  const allText = Object.values(formData).filter(v => typeof v === 'string').join(' ');
  if (allText.includes('<script') || allText.includes('javascript:')) {
    globalWarnings.push("Potentially malicious content detected");
    isSecure = false;
  }

  return {
    isSecure,
    fieldValidations,
    globalWarnings
  };
}

export type SecureFormData = z.infer<typeof secureProfileSchema>;
export type SecureGoalData = z.infer<typeof secureGoalSchema>;
export type SecureFeedbackData = z.infer<typeof secureFeedbackSchema>;