import { useNotifications } from '@/hooks/useNotifications';

/**
 * Common form error handling patterns
 */
export function useFormErrorHandler() {
  const notifications = useNotifications();

  const handleError = (error: any, context = 'operation') => {
    console.error(`Form error in ${context}:`, error);
    
    // Common error patterns
    if (error?.message?.includes('unique constraint')) {
      notifications.error('This item already exists. Please use a different name.');
      return;
    }
    
    if (error?.message?.includes('permission')) {
      notifications.permissionError();
      return;
    }
    
    if (error?.message?.includes('network') || error?.code === 'NETWORK_ERROR') {
      notifications.networkError();
      return;
    }
    
    // Default error message
    const message = error?.message || `Failed to complete ${context}. Please try again.`;
    notifications.error(message);
  };

  const handleSuccess = (message: string, item?: string) => {
    notifications.success(message, item);
  };

  return {
    handleError,
    handleSuccess,
    notifications,
  };
}

/**
 * Validation utilities
 */
export const validators = {
  required: (value: any, fieldName = 'field') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is required`;
    }
    return null;
  },

  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  minLength: (value: string, min: number, fieldName = 'field') => {
    if (value && value.length < min) {
      return `${fieldName} must be at least ${min} characters long`;
    }
    return null;
  },

  maxLength: (value: string, max: number, fieldName = 'field') => {
    if (value && value.length > max) {
      return `${fieldName} must be no more than ${max} characters long`;
    }
    return null;
  },

  phoneNumber: (value: string) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (value && !phoneRegex.test(value.replace(/\D/g, ''))) {
      return 'Please enter a valid phone number';
    }
    return null;
  },
};

/**
 * Form state management utilities
 */
export function useFormState<T extends Record<string, any>>(initialData: T) {
  const [data, setData] = React.useState<T>(initialData);
  const [errors, setErrors] = React.useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = React.useState<Partial<Record<keyof T, boolean>>>({});

  const updateField = (field: keyof T, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const setFieldError = (field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const setFieldTouched = (field: keyof T, touched: boolean = true) => {
    setTouched(prev => ({ ...prev, [field]: touched }));
  };

  const validateField = (field: keyof T, validationRules: Array<(value: any) => string | null>) => {
    const value = data[field];
    for (const rule of validationRules) {
      const error = rule(value);
      if (error) {
        setFieldError(field, error);
        return false;
      }
    }
    setFieldError(field, '');
    return true;
  };

  const validateForm = (validationRules: Partial<Record<keyof T, Array<(value: any) => string | null>>>) => {
    let isValid = true;
    Object.entries(validationRules).forEach(([field, rules]) => {
      const fieldValid = validateField(field as keyof T, rules as Array<(value: any) => string | null>);
      if (!fieldValid) isValid = false;
    });
    return isValid;
  };

  const resetForm = () => {
    setData(initialData);
    setErrors({});
    setTouched({});
  };

  const hasErrors = Object.values(errors).some(error => error);

  return {
    data,
    errors,
    touched,
    updateField,
    setFieldError,
    setFieldTouched,
    validateField,
    validateForm,
    resetForm,
    hasErrors,
    setData,
  };
}

// Re-export React for the form state hook
import React from 'react';