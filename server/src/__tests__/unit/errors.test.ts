import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,
  isAppError,
} from '../../utils/errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create an error with default values', () => {
      const error = new AppError('Test error');

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });

    it('should create an error with custom values', () => {
      const error = new AppError('Test error', 400, false, 'CUSTOM_CODE');

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(false);
      expect(error.code).toBe('CUSTOM_CODE');
    });
  });

  describe('BadRequestError', () => {
    it('should create a 400 error', () => {
      const error = new BadRequestError('Bad request');

      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('UnauthorizedError', () => {
    it('should create a 401 error', () => {
      const error = new UnauthorizedError('Unauthorized');

      expect(error.statusCode).toBe(401);
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('ForbiddenError', () => {
    it('should create a 403 error', () => {
      const error = new ForbiddenError('Forbidden');

      expect(error.statusCode).toBe(403);
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('NotFoundError', () => {
    it('should create a 404 error', () => {
      const error = new NotFoundError('Not found');

      expect(error.statusCode).toBe(404);
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('ConflictError', () => {
    it('should create a 409 error', () => {
      const error = new ConflictError('Conflict');

      expect(error.statusCode).toBe(409);
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('ValidationError', () => {
    it('should create a 422 error with validation errors', () => {
      const errors = {
        email: ['Invalid email format'],
        password: ['Password too short', 'Password must contain numbers'],
      };
      const error = new ValidationError('Validation failed', errors);

      expect(error.statusCode).toBe(422);
      expect(error.errors).toEqual(errors);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('InternalServerError', () => {
    it('should create a 500 error', () => {
      const error = new InternalServerError('Server error');

      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(false);
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('isAppError', () => {
    it('should return true for AppError instances', () => {
      expect(isAppError(new AppError('Test'))).toBe(true);
      expect(isAppError(new BadRequestError('Test'))).toBe(true);
      expect(isAppError(new NotFoundError('Test'))).toBe(true);
    });

    it('should return false for non-AppError instances', () => {
      expect(isAppError(new Error('Test'))).toBe(false);
      expect(isAppError('not an error')).toBe(false);
      expect(isAppError(null)).toBe(false);
      expect(isAppError(undefined)).toBe(false);
    });
  });
});
