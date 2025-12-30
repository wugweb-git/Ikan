/**
 * Validation utilities for iKan Mental Health PWA
 * Provides comprehensive validation for user inputs
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
 * Name validation
 */
export const validateName = (name: string): ValidationError | null => {
  if (!name || name.trim().length === 0) {
    return { field: 'name', message: 'Name is required' };
  }
  
  if (name.trim().length < 2) {
    return { field: 'name', message: 'Name must be at least 2 characters' };
  }
  
  if (name.trim().length > 100) {
    return { field: 'name', message: 'Name must be less than 100 characters' };
  }
  
  // Check for invalid characters (allow letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(name.trim())) {
    return { field: 'name', message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }
  
  return null;
};

/**
 * Email validation
 */
export const validateEmail = (email: string): ValidationError | null => {
  if (!email || email.trim().length === 0) {
    return { field: 'email', message: 'Email is required' };
  }
  
  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { field: 'email', message: 'Please enter a valid email address' };
  }
  
  if (email.length > 254) {
    return { field: 'email', message: 'Email is too long' };
  }
  
  return null;
};

/**
 * Phone number validation (supports international formats)
 */
export const validatePhone = (phone: string): ValidationError | null => {
  if (!phone || phone.trim().length === 0) {
    return null; // Phone is optional
  }
  
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length < 10) {
    return { field: 'phone', message: 'Phone number must be at least 10 digits' };
  }
  
  if (digitsOnly.length > 15) {
    return { field: 'phone', message: 'Phone number is too long' };
  }
  
  // Check for valid phone format (allows +, spaces, hyphens, parentheses)
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,5}$/;
  if (!phoneRegex.test(phone.trim())) {
    return { field: 'phone', message: 'Please enter a valid phone number' };
  }
  
  return null;
};

/**
 * Bio validation
 */
export const validateBio = (bio: string): ValidationError | null => {
  if (!bio || bio.trim().length === 0) {
    return null; // Bio is optional
  }
  
  if (bio.trim().length > 500) {
    return { field: 'bio', message: 'Bio must be less than 500 characters' };
  }
  
  return null;
};

/**
 * Date of birth validation
 */
export const validateDateOfBirth = (dateOfBirth: string): ValidationError | null => {
  if (!dateOfBirth || dateOfBirth.trim().length === 0) {
    return null; // Date of birth is optional
  }
  
  const date = new Date(dateOfBirth);
  
  // Check if valid date
  if (isNaN(date.getTime())) {
    return { field: 'dateOfBirth', message: 'Please enter a valid date' };
  }
  
  // Check if date is in the future
  if (date > new Date()) {
    return { field: 'dateOfBirth', message: 'Date of birth cannot be in the future' };
  }
  
  // Check minimum age (13 years for mental health app)
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 13);
  if (date > minDate) {
    return { field: 'dateOfBirth', message: 'You must be at least 13 years old' };
  }
  
  // Check maximum age (150 years - reasonable limit)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 150);
  if (date < maxDate) {
    return { field: 'dateOfBirth', message: 'Please enter a valid date of birth' };
  }
  
  return null;
};

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
 * Password validation
 */
export const validatePassword = (password: string): ValidationError | null => {
  if (!password || password.length === 0) {
    return { field: 'password', message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { field: 'password', message: 'Password must be at least 8 characters' };
  }
  
  if (password.length > 128) {
    return { field: 'password', message: 'Password is too long' };
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { field: 'password', message: 'Password must contain at least one uppercase letter' };
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { field: 'password', message: 'Password must contain at least one lowercase letter' };
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    return { field: 'password', message: 'Password must contain at least one number' };
  }
  
  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { field: 'password', message: 'Password must contain at least one special character' };
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
 * Sanitize string input
 */
export const sanitizeString = (input: string): string => {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
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
