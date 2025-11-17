import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ValidationError } from '../utils/errors';

/**
 * Middleware to validate request using express-validator
 * @param validations Array of validation chains
 */
export function validate(validations: ValidationChain[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      next();
      return;
    }

    // Format errors and throw ValidationError
    const formattedErrors = errors.array().map((err) => {
      if ('path' in err) {
        return {
          field: err.path,
          message: err.msg,
          value: 'value' in err ? err.value : undefined,
        };
      }
      return { message: err.msg };
    });

    next(new ValidationError('Validation failed', formattedErrors));
  };
}
