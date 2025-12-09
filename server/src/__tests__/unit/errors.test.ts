import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
  ValidationError,
} from '../../utils/errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create an error with default values', () => {
      const error = new AppError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error.code).toBeUndefined();
    });

    it('should create an error with custom values', () => {
      const error = new AppError('Custom error', 400, false, 'CUSTOM_CODE');
      expect(error.message).toBe('Custom error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(false);
      expect(error.code).toBe('CUSTOM_CODE');
    });
  });

  describe('BadRequestError', () => {
    it('should have status code 400', () => {
      const error = new BadRequestError('Bad request');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Bad request');
    });
  });

  describe('UnauthorizedError', () => {
    it('should have status code 401', () => {
      const error = new UnauthorizedError('Unauthorized');
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Unauthorized');
    });
  });

  describe('NotFoundError', () => {
    it('should have status code 404', () => {
      const error = new NotFoundError('Not found');
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Not found');
    });
  });

  describe('ConflictError', () => {
    it('should have status code 409', () => {
      const error = new ConflictError('Conflict');
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe('Conflict');
    });
  });

  describe('ValidationError', () => {
    it('should have status code 400 and include errors array', () => {
      const errors = [
        { field: 'email', message: 'Invalid email' },
        { field: 'password', message: 'Password too short' },
      ];
      const error = new ValidationError(errors);

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.errors).toEqual(errors);
    });
  });
});
