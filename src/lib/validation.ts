/**
 * Browser validation. The rules shared with the edge function live in ONE place
 * — see `validation-core.ts`. They used to be duplicated here and all seven had
 * drifted: this copy lacked the `typeof x !== 'string'` guards, so every one of
 * them threw on non-string input instead of returning an error.
 *
 * Everything below is browser-only: password strength UI, profile shaping.
 */
export {
  sanitizeString, validateName, validateEmail, validatePassword,
  validatePhone, validateBio, validateDateOfBirth,
  type ValidationError, type ValidationResult,
} from '../supabase/functions/server/validation-core';
import {
  sanitizeString, validateName, validateEmail, validatePassword,
  validatePhone, validateBio, validateDateOfBirth,
  type ValidationError, type ValidationResult,
} from '../supabase/functions/server/validation-core';

/**
 * Validation utilities for iKan Mental Health PWA
 * Provides comprehensive validation for user inputs
 */






/**
 * Gender validation
 */
export const validateGender = (gender: string): ValidationError | null => {
  if (!gender || gender.trim().length === 0) {
    return null; // Gender is optional
  }
  
  const validGenders = ['male', 'female', 'non-binary', 'prefer-not-to-say', 'other'];
  if (!validGenders.includes(gender.toLowerCase())) {
    return { field: 'gender', message: 'Please select a valid gender option' };
  }
  
  return null;
};

/**
 * Location validation
 */
export const validateLocation = (location: string): ValidationError | null => {
  if (!location || location.trim().length === 0) {
    return null; // Location is optional
  }
  
  if (location.trim().length < 2) {
    return { field: 'location', message: 'Location must be at least 2 characters' };
  }
  
  if (location.trim().length > 100) {
    return { field: 'location', message: 'Location must be less than 100 characters' };
  }
  
  return null;
};


/**
 * Calculate password strength
 */
export const getPasswordStrength = (password: string): {
  score: number; // 0-4
  label: string;
  color: string;
} => {
  if (!password) {
    return { score: 0, label: 'No password', color: 'var(--color-text-muted)' };
  }
  
  let score = 0;
  
  // Length
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  
  // Complexity
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
  
  // Normalize to 0-4 scale
  const normalizedScore = Math.min(Math.floor(score / 1.25), 4);
  
  const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const colors = [
    'var(--color-status-danger)',
    'var(--color-status-danger)',
    'var(--color-status-warning)',
    'var(--color-status-success)',
    'var(--color-status-success)'
  ];
  
  return {
    score: normalizedScore,
    label: labels[normalizedScore],
    color: colors[normalizedScore]
  };
};

/**
 * Emergency contact validation
 */
export const validateEmergencyContact = (contact: {
  name?: string;
  phone?: string;
  relationship?: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // If any field is filled, all should be required
  const hasAnyField = contact.name || contact.phone || contact.relationship;
  
  if (hasAnyField) {
    if (!contact.name || contact.name.trim().length === 0) {
      errors.push({ field: 'emergencyContactName', message: 'Emergency contact name is required' });
    } else {
      const nameError = validateName(contact.name);
      if (nameError) {
        errors.push({ field: 'emergencyContactName', message: nameError.message });
      }
    }
    
    if (!contact.phone || contact.phone.trim().length === 0) {
      errors.push({ field: 'emergencyContactPhone', message: 'Emergency contact phone is required' });
    } else {
      const phoneError = validatePhone(contact.phone);
      if (phoneError) {
        errors.push({ field: 'emergencyContactPhone', message: phoneError.message });
      }
    }
    
    if (!contact.relationship || contact.relationship.trim().length === 0) {
      errors.push({ field: 'emergencyContactRelationship', message: 'Relationship is required' });
    } else if (contact.relationship.trim().length < 2) {
      errors.push({ field: 'emergencyContactRelationship', message: 'Relationship must be at least 2 characters' });
    } else if (contact.relationship.trim().length > 50) {
      errors.push({ field: 'emergencyContactRelationship', message: 'Relationship must be less than 50 characters' });
    }
  }
  
  return errors;
};

/**
 * Profile validation (complete)
 */
export const validateProfile = (profile: {
  name: string;
  email?: string;
  phone?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  location?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
}): ValidationResult => {
  const errors: ValidationError[] = [];
  
  // Required fields
  const nameError = validateName(profile.name);
  if (nameError) errors.push(nameError);
  
  // Optional fields
  if (profile.email) {
    const emailError = validateEmail(profile.email);
    if (emailError) errors.push(emailError);
  }
  
  if (profile.phone) {
    const phoneError = validatePhone(profile.phone);
    if (phoneError) errors.push(phoneError);
  }
  
  if (profile.bio) {
    const bioError = validateBio(profile.bio);
    if (bioError) errors.push(bioError);
  }
  
  if (profile.dateOfBirth) {
    const dobError = validateDateOfBirth(profile.dateOfBirth);
    if (dobError) errors.push(dobError);
  }
  
  if (profile.gender) {
    const genderError = validateGender(profile.gender);
    if (genderError) errors.push(genderError);
  }
  
  if (profile.location) {
    const locationError = validateLocation(profile.location);
    if (locationError) errors.push(locationError);
  }
  
  // Emergency contact
  if (profile.emergencyContact) {
    const emergencyErrors = validateEmergencyContact(profile.emergencyContact);
    errors.push(...emergencyErrors);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};


/**
 * Sanitize profile data
 */
export const sanitizeProfile = (profile: any): any => {
  return {
    ...profile,
    name: sanitizeString(profile.name),
    phone: profile.phone ? sanitizeString(profile.phone) : undefined,
    bio: profile.bio ? sanitizeString(profile.bio) : undefined,
    location: profile.location ? sanitizeString(profile.location) : undefined,
    gender: profile.gender ? sanitizeString(profile.gender) : undefined,
    emergencyContact: profile.emergencyContact ? {
      name: sanitizeString(profile.emergencyContact.name || ''),
      phone: sanitizeString(profile.emergencyContact.phone || ''),
      relationship: sanitizeString(profile.emergencyContact.relationship || '')
    } : undefined
  };
};

/**
 * URL validation
 */
export const validateUrl = (url: string): ValidationError | null => {
  if (!url || url.trim().length === 0) {
    return null; // URL is optional usually
  }
  
  try {
    new URL(url);
    return null;
  } catch (e) {
    return { field: 'url', message: 'Please enter a valid URL (e.g. https://example.com)' };
  }
};

/**
 * Common weak passwords to check against
 */
const COMMON_PASSWORDS = [
  'password', 'password123', '123456', '12345678', 'qwerty', 'abc123',
  'monkey', '1234567', 'letmein', 'trustno1', 'dragon', 'baseball',
  'iloveyou', 'master', 'sunshine', 'ashley', 'bailey', 'passw0rd',
  'shadow', '123123', '654321', 'superman', 'qazwsx', 'michael',
  'football', 'password1', 'welcome', 'admin', 'user', 'test'
];

/**
 * Check if password is commonly used
 */
export const isCommonPassword = (password: string): boolean => {
  return COMMON_PASSWORDS.includes(password.toLowerCase());
};
