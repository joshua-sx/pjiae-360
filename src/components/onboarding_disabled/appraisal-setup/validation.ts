import { z } from "zod";

// Base validation schemas
export const competencySchema = z.object({
  name: z.string().min(1, "Competency name is required"),
  description: z.string().min(1, "Description is required"),
  optional: z.boolean().optional(),
  applicable: z.boolean().optional(),
});

export const goalSettingWindowSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Window name is required"),
  startDate: z.date(),
  endDate: z.date(),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export const reviewPeriodSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Review period name is required"),
  startDate: z.date(),
  endDate: z.date(),
  goalWindowId: z.string().min(1, "Must be linked to a goal setting window"),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export const competencyCriteriaSchema = z.object({
  enabled: z.boolean(),
  model: z.string(),
  customCriteria: z.array(z.string()).optional(),
  scoringSystem: z.string(),
  competencies: z.array(competencySchema).optional(),
}).refine((data) => {
  if (data.enabled && !data.model) {
    return false;
  }
  return true;
}, {
  message: "Model selection is required when competency is enabled",
  path: ["model"],
}).refine((data) => {
  if (data.enabled && !data.scoringSystem) {
    return false;
  }
  return true;
}, {
  message: "Scoring system is required when competency is enabled",
  path: ["scoringSystem"],
});

export const notificationsSchema = z.object({
  enabled: z.boolean(),
  email: z.boolean(),
  emailAddress: z.string(),
  reminders: z.boolean(),
  deadlines: z.boolean(),
}).refine((data) => {
  if (data.email && data.enabled) {
    return z.string().email().safeParse(data.emailAddress).success && data.emailAddress.length > 0;
  }
  return true;
}, {
  message: "Valid email address is required when email notifications are enabled",
  path: ["emailAddress"],
});

// Main cycle data validation schema
export const cycleDataSchema = z.object({
  frequency: z.enum(["annual", "bi-annual"]),
  cycleName: z.string().min(1, "Cycle name is required"),
  startDate: z.string().min(1, "Start date is required"),
  goalSettingWindows: z.array(goalSettingWindowSchema).min(1, "At least one goal setting window is required"),
  reviewPeriods: z.array(reviewPeriodSchema).min(1, "At least one review period is required"),
  competencyCriteria: competencyCriteriaSchema,
  notifications: notificationsSchema,
}).refine((data) => {
  // Validate that review periods don't overlap
  const periods = data.reviewPeriods.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  for (let i = 0; i < periods.length - 1; i++) {
    if (periods[i].endDate >= periods[i + 1].startDate) {
      return false;
    }
  }
  return true;
}, {
  message: "Review periods cannot overlap",
  path: ["reviewPeriods"],
}).refine((data) => {
  // Validate that each review period has a valid goal window
  const goalWindowIds = data.goalSettingWindows.map(w => w.id);
  return data.reviewPeriods.every(period => goalWindowIds.includes(period.goalWindowId));
}, {
  message: "All review periods must be linked to valid goal setting windows",
  path: ["reviewPeriods"],
});

// Step-specific validation schemas
export const basicSetupSchema = z.object({
  frequency: z.enum(["annual", "bi-annual"]),
  cycleName: z.string().min(1, "Cycle name is required"),
  startDate: z.string().min(1, "Start date is required"),
});

export const reviewPeriodsSchema = z.object({
  reviewPeriods: z.array(reviewPeriodSchema).min(1, "At least one review period is required"),
});

export const goalWindowsSchema = z.object({
  goalSettingWindows: z.array(goalSettingWindowSchema).min(1, "At least one goal setting window is required"),
});

// Validation error type
export type ValidationErrors = Record<string, string[]>;

// Helper function to format Zod errors
export const formatValidationErrors = (error: z.ZodError): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(err.message);
  });
  
  return errors;
};

// Validation hooks
export const useValidation = () => {
  const validateStep = (step: string, data: any): ValidationErrors | null => {
    try {
      switch (step) {
        case 'basic':
          basicSetupSchema.parse(data);
          break;
        case 'reviewPeriods':
          reviewPeriodsSchema.parse(data);
          break;
        case 'goalWindows':
          goalWindowsSchema.parse(data);
          break;
        case 'competency':
          competencyCriteriaSchema.parse(data.competencyCriteria);
          break;
        case 'notifications':
          notificationsSchema.parse(data.notifications);
          break;
        case 'complete':
          cycleDataSchema.parse(data);
          break;
        default:
          return null;
      }
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return formatValidationErrors(error);
      }
      return { general: ['Validation failed'] };
    }
  };

  const validateField = (fieldName: string, value: any, schema: z.ZodSchema): string[] => {
    try {
      schema.parse(value);
      return [];
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors.map(err => err.message);
      }
      return ['Validation failed'];
    }
  };

  return { validateStep, validateField };
};