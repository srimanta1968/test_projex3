import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, ValidationError as ExpressValidationError } from 'express-validator';
import { ValidationError } from '../utils/errors';

/**
 * Validation middleware that runs express-validator checks and throws ValidationError if fails
 */
export function validate(validations: ValidationChain[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Check for errors
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      next();
      return;
    }

    // Format errors by field
    const formattedErrors: Record<string, string[]> = {};
    errors.array().forEach((error: ExpressValidationError) => {
      if (error.type === 'field') {
        const field = error.path;
        if (!formattedErrors[field]) {
          formattedErrors[field] = [];
        }
        formattedErrors[field].push(error.msg);
      }
    });

    throw new ValidationError('Validation failed', formattedErrors);
  };
}

/**
 * Common validation helpers
 */
/**
 * Middleware to validate request after running inline validators
 * Use this after body(), param(), query() validators
 */
export function validateRequest(req: Request, _res: Response, next: NextFunction): void {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    next();
    return;
  }

  // Format errors by field
  const formattedErrors: Record<string, string[]> = {};
  errors.array().forEach((error: ExpressValidationError) => {
    if (error.type === 'field') {
      const field = error.path;
      if (!formattedErrors[field]) {
        formattedErrors[field] = [];
      }
      formattedErrors[field].push(error.msg);
    }
  });

  throw new ValidationError('Validation failed', formattedErrors);
}

export const commonValidations = {
  /**
   * UUID validation pattern
   */
  uuidPattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,

  /**
   * Email validation pattern
   */
  emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  /**
   * Check if string is valid UUID
   */
  isUUID(value: string): boolean {
    return this.uuidPattern.test(value);
  },

  /**
   * Check if string is valid email
   */
  isEmail(value: string): boolean {
    return this.emailPattern.test(value);
  },

  /**
   * Sanitize string - trim and escape HTML
   */
  sanitizeString(value: string): string {
    return value
      .trim()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },
};
