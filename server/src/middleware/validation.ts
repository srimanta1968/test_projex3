import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ValidationError } from '../utils/errors';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors: Record<string, string> = {};
    errors.array().forEach((err) => {
      if (err.type === 'field') {
        extractedErrors[err.path] = err.msg;
      }
    });

    next(new ValidationError('Validation failed', extractedErrors));
  };
};
