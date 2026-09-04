// Input sanitization: strip control chars, trim
export function sanitizeInput(value: string): string {
  return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').trim();
}

// --- Field validators ---

export type ValidationError = string | null;

export interface FieldValidation {
  isValid: boolean;
  error: ValidationError;
}

// Name: 2-100 chars, letters/spaces/hyphens/apostrophes/dots only
export function validateName(value: string): FieldValidation {
  const v = sanitizeInput(value);
  if (!v) return { isValid: false, error: 'Full name is required' };
  if (v.length < 2) return { isValid: false, error: 'Name must be at least 2 characters' };
  if (v.length > 100) return { isValid: false, error: 'Name must be under 100 characters' };
  if (!/^[a-zA-Z\u00C0-\u024F\u0400-\u04FF\u1E00-\u1EFF\s'\-\.]+$/.test(v)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, apostrophes, and dots' };
  }
  return { isValid: true, error: null };
}

// Email: RFC-ish, reasonable check
export function validateEmail(value: string, existingEmails: string[] = [], currentId?: string): FieldValidation {
  const v = sanitizeInput(value).toLowerCase();
  if (!v) return { isValid: false, error: 'Email is required' };
  if (v.length > 254) return { isValid: false, error: 'Email is too long (max 254 characters)' };
  // RFC 5322 simplified
  if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(v)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. name@company.com)' };
  }
  // Domain check: must have at least one dot after @
  const domain = v.split('@')[1];
  if (!domain || !domain.includes('.')) {
    return { isValid: false, error: 'Email domain is incomplete (e.g. company.com)' };
  }
  // Duplicate check
  const isDuplicate = existingEmails.some(
    (e) => e.toLowerCase() === v && e !== currentId
  );
  if (isDuplicate) {
    return { isValid: false, error: 'A candidate with this email already exists' };
  }
  return { isValid: true, error: null };
}

// Phone: optional, but if provided must be valid format
export function validatePhone(value: string): FieldValidation {
  const v = value.trim();
  if (!v) return { isValid: true, error: null }; // optional
  // Strip common formatting
  const stripped = v.replace(/[\s\-\(\)\.]/g, '');
  // Must start with + or digit, contain 7-15 digits total
  if (!/^\+?\d{7,15}$/.test(stripped)) {
    return {
      isValid: false,
      error: 'Enter a valid phone number (7-15 digits, e.g. +1 555 123 4567)',
    };
  }
  return { isValid: true, error: null };
}

// Position: 2-100 chars, reasonable job title
export function validatePosition(value: string): FieldValidation {
  const v = sanitizeInput(value);
  if (!v) return { isValid: false, error: 'Position is required' };
  if (v.length < 2) return { isValid: false, error: 'Position must be at least 2 characters' };
  if (v.length > 100) return { isValid: false, error: 'Position must be under 100 characters' };
  return { isValid: true, error: null };
}

// LinkedIn URL: optional, but if provided must be valid LinkedIn format
export function validateLinkedIn(value: string): FieldValidation {
  const v = value.trim();
  if (!v) return { isValid: true, error: null }; // optional
  // Allow linkedin.com/in/username or linkedin.com/in/username/ or just linkedin.com/in/username
  if (!/^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-_%]+\/?$/.test(v)) {
    return {
      isValid: false,
      error: 'Enter a valid LinkedIn profile URL (e.g. https://linkedin.com/in/username)',
    };
  }
  return { isValid: true, error: null };
}

// Validate all fields at once (for submit)
export interface CandidateFormData {
  name: string;
  email: string;
  phone: string;
  position: string;
  linkedIn: string;
}

export interface CandidateFormErrors {
  name: ValidationError;
  email: ValidationError;
  phone: ValidationError;
  position: ValidationError;
  linkedIn: ValidationError;
}

export function validateAllFields(
  data: CandidateFormData,
  existingEmails: string[],
  currentId?: string
): { isValid: boolean; errors: CandidateFormErrors } {
  const nameResult = validateName(data.name);
  const emailResult = validateEmail(data.email, existingEmails, currentId);
  const phoneResult = validatePhone(data.phone);
  const positionResult = validatePosition(data.position);
  const linkedInResult = validateLinkedIn(data.linkedIn);

  return {
    isValid: nameResult.isValid && emailResult.isValid && phoneResult.isValid && positionResult.isValid && linkedInResult.isValid,
    errors: {
      name: nameResult.error,
      email: emailResult.error,
      phone: phoneResult.error,
      position: positionResult.error,
      linkedIn: linkedInResult.error,
    },
  };
}
