/**
 * Validation utilities for user inputs
 */

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Email validation regex pattern
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Password requirements
 */
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationError | null {
  if (!email || typeof email !== 'string') {
    return { field: 'email', message: 'Email is required' };
  }

  const trimmedEmail = email.trim();

  if (trimmedEmail.length === 0) {
    return { field: 'email', message: 'Email is required' };
  }

  if (trimmedEmail.length > 255) {
    return { field: 'email', message: 'Email must be less than 255 characters' };
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { field: 'email', message: 'Invalid email format' };
  }

  return null;
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationError | null {
  if (!password || typeof password !== 'string') {
    return { field: 'password', message: 'Password is required' };
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return { field: 'password', message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` };
  }

  if (password.length > 128) {
    return { field: 'password', message: 'Password must be less than 128 characters' };
  }

  if (!PASSWORD_REGEX.test(password)) {
    return {
      field: 'password',
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'
    };
  }

  return null;
}

/**
 * Validate registration input
 */
export function validateRegistrationInput(input: { email?: string; password?: string }): ValidationResult {
  const errors: ValidationError[] = [];

  const emailError = validateEmail(input.email || '');
  if (emailError) {
    errors.push(emailError);
  }

  const passwordError = validatePassword(input.password || '');
  if (passwordError) {
    errors.push(passwordError);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }
  return email.trim().toLowerCase();
}

export default {
  validateEmail,
  validatePassword,
  validateRegistrationInput,
  sanitizeEmail,
};
