import { useState, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  /** A boolean-returning validator: return true if valid, false if invalid */
  validate?: (value: any) => boolean;
  message?: string;
}

export interface ValidationSchema {
  [field: string]: ValidationRule;
}

export interface ValidationErrors {
  [field: string]: string;
}

export function useFormValidation(schema: ValidationSchema) {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = useCallback((field: string, value: any): string | null => {
    const rule = schema[field];
    if (!rule) return null;

    // Required check
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return rule.message || `${field} is required`;
    }

    if (!value) return null; // Skip other validations if empty and not required

    // String-specific validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return rule.message || `${field} must be at least ${rule.minLength} characters`;
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        return rule.message || `${field} must be at most ${rule.maxLength} characters`;
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        return rule.message || `${field} format is invalid`;
      }
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    // Boolean validate function
    if (rule.validate) {
      const isValid = rule.validate(value);
      if (!isValid) {
        return rule.message || `${field} is invalid`;
      }
    }

    return null;
  }, [schema]);

  const validateForm = useCallback((data: any): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(schema).forEach((field) => {
      const error = validateField(field, data[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [schema, validateField]);

  const validateSingleField = useCallback((field: string, value: any) => {
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error || ''
    }));
    return !error;
  }, [validateField]);

  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateForm,
    validateSingleField,
    clearError,
    clearErrors: clearAllErrors,
    clearAllErrors,
    hasErrors: Object.keys(errors).length > 0
  };
}