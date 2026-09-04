/**
 * Edge-function validation. The rules shared with the browser live in ONE place
 * — see `validation-core.ts`. This file keeps only what is server-only:
 * password hashing, and the profile/programme shaping that writes to KV.
 */
export {
  sanitizeString, validateName, validateEmail, validatePassword,
  validatePhone, validateBio, validateDateOfBirth,
  type ValidationError, type ValidationResult,
} from './validation-core.ts';
import {
  sanitizeString, validateName, validateEmail, validatePassword,
  validatePhone, validateBio, validateDateOfBirth,
  type ValidationError,
} from './validation-core.ts';

/**
 * Backend validation utilities for iKan server
 * Mirrors frontend validation but runs server-side for security
 */








/**
 * Validate profile update data
 */
export const validateProfileUpdate = (updates: any): ValidationResult => {
  const errors: ValidationError[] = [];
  
  // Validate name if present
  if (updates.name !== undefined) {
    const nameError = validateName(updates.name);
    if (nameError) errors.push(nameError);
  }
  
  // Validate email if present
  if (updates.email !== undefined) {
    const emailError = validateEmail(updates.email);
    if (emailError) errors.push(emailError);
  }
  
  // Validate phone if present
  if (updates.phone !== undefined && updates.phone !== null && updates.phone !== '') {
    const phoneError = validatePhone(updates.phone);
    if (phoneError) errors.push(phoneError);
  }
  
  // Validate bio if present
  if (updates.bio !== undefined && updates.bio !== null && updates.bio !== '') {
    const bioError = validateBio(updates.bio);
    if (bioError) errors.push(bioError);
  }
  
  // Validate date of birth if present
  if (updates.dateOfBirth !== undefined && updates.dateOfBirth !== null && updates.dateOfBirth !== '') {
    const dobError = validateDateOfBirth(updates.dateOfBirth);
    if (dobError) errors.push(dobError);
  }
  
  // Validate emergency contact if present
  if (updates.emergencyContact) {
    const contact = updates.emergencyContact;
    
    // If any field is present, all should be present
    const hasAny = contact.name || contact.phone || contact.relationship;
    
    if (hasAny) {
      if (!contact.name || !contact.phone || !contact.relationship) {
        errors.push({ 
          field: 'emergencyContact', 
          message: 'All emergency contact fields are required' 
        });
      } else {
        const nameError = validateName(contact.name);
        if (nameError) errors.push({ field: 'emergencyContactName', message: nameError.message });
        
        const phoneError = validatePhone(contact.phone);
        if (phoneError) errors.push({ field: 'emergencyContactPhone', message: phoneError.message });
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate equip program content constraints
 * RELAXED LIMITS to prevent saving errors
 */
export const validateEquipProgram = (program: any): ValidationResult => {
  const errors: ValidationError[] = [];

  // SECTION 1 Constraints
  if (program.section1_title) {
    if (program.section1_title.length < 2) errors.push({ field: 'section1_title', message: 'Section 1 Title must be at least 2 chars' });
    if (program.section1_title.length > 200) errors.push({ field: 'section1_title', message: 'Section 1 Title must be under 200 chars' });
  }

  if (program.section1_eligibility_points) {
    // Relaxed from 4 to 10
    if (program.section1_eligibility_points.length > 10) {
      errors.push({ field: 'section1_eligibility_points', message: 'Section 1 Checklist limited to 10 items' });
    }
    program.section1_eligibility_points.forEach((point: string, idx: number) => {
      // Relaxed from 30 to 2, 90 to 500
      if (point.length < 2) errors.push({ field: `section1_eligibility_points[${idx}]`, message: 'Checklist item too short (min 2 chars)' });
      if (point.length > 500) errors.push({ field: `section1_eligibility_points[${idx}]`, message: 'Checklist item too long (max 500 chars)' });
    });
  }

  if (program.section1_who_content) {
    // Relaxed from 120 to 2, 260 to 5000
    if (program.section1_who_content.length < 2) errors.push({ field: 'section1_who_content', message: 'Participation text too short (min 2 chars)' });
    if (program.section1_who_content.length > 5000) errors.push({ field: 'section1_who_content', message: 'Participation text too long (max 5000 chars)' });
  }

  // SECTION 2 Constraints
  if (program.section2_title) {
    // Relaxed from 20 to 2, 60 to 200
    if (program.section2_title.length < 2) errors.push({ field: 'section2_title', message: 'Section 2 Title too short (min 2 chars)' });
    if (program.section2_title.length > 200) errors.push({ field: 'section2_title', message: 'Section 2 Title too long (max 200 chars)' });
  }

  // SECTION 3 Constraints
  if (program.section3_title) {
    // Relaxed from 15 to 2, 40 to 200
    if (program.section3_title.length < 2) errors.push({ field: 'section3_title', message: 'Section 3 Title too short (min 2 chars)' });
    if (program.section3_title.length > 200) errors.push({ field: 'section3_title', message: 'Section 3 Title too long (max 200 chars)' });
  }

  // SECTION 4 Constraints
  if (program.section4_benefits) {
    // Relaxed from 4 to 20
    if (program.section4_benefits.length > 20) errors.push({ field: 'section4_benefits', message: 'Benefits limited to 20 items' });
    program.section4_benefits.forEach((b: any, idx: number) => {
      const title = typeof b === 'string' ? b : b.title || '';
      const desc = typeof b === 'string' ? '' : b.description || '';
      // Relaxed min/max constraints significantly
      if (title.length < 2) errors.push({ field: `section4_benefits[${idx}].title`, message: 'Benefit title too short (min 2 chars)' });
      if (title.length > 200) errors.push({ field: `section4_benefits[${idx}].title`, message: 'Benefit title too long (max 200 chars)' });
      if (desc.length < 2) errors.push({ field: `section4_benefits[${idx}].description`, message: 'Benefit description too short (min 2 chars)' });
      if (desc.length > 1000) errors.push({ field: `section4_benefits[${idx}].description`, message: 'Benefit description too long (max 1000 chars)' });
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitize profile update data
 */
export const sanitizeProfileUpdate = (updates: any): any => {
  const sanitized: any = {};
  
  if (updates.name !== undefined) {
    sanitized.name = sanitizeString(updates.name);
  }
  
  if (updates.phone !== undefined) {
    sanitized.phone = updates.phone ? sanitizeString(updates.phone) : null;
  }
  
  if (updates.bio !== undefined) {
    sanitized.bio = updates.bio ? sanitizeString(updates.bio) : null;
  }
  
  if (updates.dateOfBirth !== undefined) {
    sanitized.dateOfBirth = updates.dateOfBirth || null;
  }
  
  if (updates.gender !== undefined) {
    sanitized.gender = updates.gender ? sanitizeString(updates.gender) : null;
  }
  
  if (updates.location !== undefined) {
    sanitized.location = updates.location ? sanitizeString(updates.location) : null;
  }
  
  if (updates.emergencyContact) {
    sanitized.emergencyContactName = updates.emergencyContact.name ? sanitizeString(updates.emergencyContact.name) : null;
    sanitized.emergencyContactPhone = updates.emergencyContact.phone ? sanitizeString(updates.emergencyContact.phone) : null;
    sanitized.emergencyContactRelationship = updates.emergencyContact.relationship ? sanitizeString(updates.emergencyContact.relationship) : null;
  }
  
  // Also handle flat emergency contact fields (from Account.tsx data mapping fix)
  if (updates.emergencyContactName !== undefined) {
    sanitized.emergencyContactName = updates.emergencyContactName ? sanitizeString(updates.emergencyContactName) : null;
  }
  if (updates.emergencyContactPhone !== undefined) {
    sanitized.emergencyContactPhone = updates.emergencyContactPhone ? sanitizeString(updates.emergencyContactPhone) : null;
  }
  if (updates.emergencyContactRelationship !== undefined) {
    sanitized.emergencyContactRelationship = updates.emergencyContactRelationship ? sanitizeString(updates.emergencyContactRelationship) : null;
  }
  
  if (updates.preferences !== undefined) {
    sanitized.preferences = updates.preferences;
  }
  
  if (updates.avatar_url !== undefined) {
    sanitized.avatar_url = updates.avatar_url;
  }
  
  return sanitized;
};

/**
 * Hash password using SHA-256 (simple hashing for demo)
 * In production, use bcrypt or argon2
 */
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

/**
 * Verify password against hash
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
};