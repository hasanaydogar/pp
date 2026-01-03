import {
  createErrorResponse,
  badRequest,
  unauthorized,
  notFound,
  internalServerError,
} from '../errors';

describe('Error Response Helpers', () => {
  describe('createErrorResponse', () => {
    it('should create error response with error message', () => {
      const response = createErrorResponse('Test error', 400);
      expect(response.status).toBe(400);
    });

    it('should include details when provided', () => {
      const details = { field: 'name', message: 'Required' };
      const response = createErrorResponse('Validation error', 400, details);
      expect(response.status).toBe(400);
    });
  });

  describe('badRequest', () => {
    it('should return 400 status', () => {
      const response = badRequest('Bad request');
      expect(response.status).toBe(400);
    });

    it('should include details when provided', () => {
      const details = { errors: ['Error 1', 'Error 2'] };
      const response = badRequest('Validation failed', details);
      expect(response.status).toBe(400);
    });
  });

  describe('unauthorized', () => {
    it('should return 401 status with default message', () => {
      const response = unauthorized();
      expect(response.status).toBe(401);
    });

    it('should return 401 status with custom message', () => {
      const response = unauthorized('Custom unauthorized message');
      expect(response.status).toBe(401);
    });
  });

  describe('notFound', () => {
    it('should return 404 status with default message', () => {
      const response = notFound();
      expect(response.status).toBe(404);
    });

    it('should return 404 status with custom message', () => {
      const response = notFound('Resource not found');
      expect(response.status).toBe(404);
    });
  });

  describe('internalServerError', () => {
    it('should return 500 status with default message', () => {
      const response = internalServerError();
      expect(response.status).toBe(500);
    });

    it('should return 500 status with custom message', () => {
      const response = internalServerError('Database error');
      expect(response.status).toBe(500);
    });

    it('should include details when provided', () => {
      const details = { code: 'DB_ERROR', message: 'Connection failed' };
      const response = internalServerError('Database error', details);
      expect(response.status).toBe(500);
    });
  });
});

