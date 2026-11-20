/**
 * Validation core — the single source for client and admin validation rules.
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Escape a string for HTML contexts.
 */
export const sanitizeString = (input: string): string => {
  if (!input) return '';

  return String(input)
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const validateName = (name: string): ValidationError | null => {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return { field: 'name', message: 'Name is required' };
  }
  if (name.trim().length < 2) {
    return { field: 'name', message: 'Name must be at least 2 characters' };
  }
  if (name.trim().length > 100) {
    return { field: 'name', message: 'Name must be less than 100 characters' };
  }
  return null;
};

export const validateEmail = (email: string): ValidationError | null => {
  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    return { field: 'email', message: 'Email is required' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { field: 'email', message: 'Please enter a valid email address' };
  }
  return null;
};

export const validatePassword = (password: string): ValidationError | null => {
  if (!password || typeof password !== 'string') {
    return { field: 'password', message: 'Password is required' };
  }
  if (password.length < 8) {
    return { field: 'password', message: 'Password must be at least 8 characters' };
  }
  return null;
};

export const validatePhone = (phone: string): ValidationError | null => {
  if (!phone || typeof phone !== 'string') return null;
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    return { field: 'phone', message: 'Please enter a valid phone number' };
  }
  return null;
};

export const validateBio = (bio: string): ValidationError | null => {
  if (!bio || typeof bio !== 'string') return null;
  if (bio.trim().length > 500) {
    return { field: 'bio', message: 'Bio must be less than 500 characters' };
  }
  return null;
};

export const validateDateOfBirth = (dateOfBirth: string): ValidationError | null => {
  if (!dateOfBirth || typeof dateOfBirth !== 'string') return null;
  const date = new Date(dateOfBirth);
  if (isNaN(date.getTime())) {
    return { field: 'dateOfBirth', message: 'Please enter a valid date' };
  }
  const today = new Date();
  if (date > today) {
    return { field: 'dateOfBirth', message: 'Date of birth cannot be in the future' };
  }
  const age = today.getFullYear() - date.getFullYear();
  if (age > 120) {
    return { field: 'dateOfBirth', message: 'Please enter a valid date of birth' };
  }
  return null;
};

/** The clinical vocabulary, ordered least to most severe. Rules match on this. */
export const SEVERITY_LEVELS = [
  'minimal',
  'mild',
  'moderate',
  'moderately-severe',
  'severe',
] as const;
export type SeverityLevel = (typeof SEVERITY_LEVELS)[number];

/** What the product DOES about a score — tone and copy. Not on the matching path. */
export const RESPONSE_TIERS = ['low', 'moderate', 'high'] as const;
export type ResponseTier = (typeof RESPONSE_TIERS)[number];

export function isSeverityLevel(v: unknown): v is SeverityLevel {
  return typeof v === 'string' && (SEVERITY_LEVELS as readonly string[]).includes(v);
}

/**
 * Order two severities. Negative = `a` is less severe than `b`.
 */
export function compareSeverity(a: SeverityLevel, b: SeverityLevel): number {
  if (!isSeverityLevel(a) || !isSeverityLevel(b)) return -1;
  return SEVERITY_LEVELS.indexOf(a) - SEVERITY_LEVELS.indexOf(b);
}
