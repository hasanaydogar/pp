import {
  AuthError,
  TokenError,
  ProviderError,
  formatAuthError,
  isAuthError,
} from '../errors';

describe('Error Utilities', () => {
  describe('AuthError', () => {
    it('should create AuthError with message', () => {
      const error = new AuthError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('AuthError');
    });

    it('should create AuthError with code and statusCode', () => {
      const error = new AuthError('Test error', 'ERR_CODE', 400);
      expect(error.code).toBe('ERR_CODE');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('TokenError', () => {
    it('should create TokenError with 401 status code', () => {
      const error = new TokenError('Token expired');
      expect(error.message).toBe('Token expired');
      expect(error.name).toBe('TokenError');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('ProviderError', () => {
    it('should create ProviderError with provider', () => {
      const error = new ProviderError('Provider error', 'google');
      expect(error.message).toBe('Provider error');
      expect(error.provider).toBe('google');
      expect(error.name).toBe('ProviderError');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('formatAuthError', () => {
    it('should format AuthError', () => {
      const error = new AuthError('Test error');
      const formatted = formatAuthError(error);
      expect(formatted).toBe('Test error');
    });

    it('should format regular Error', () => {
      const error = new Error('Regular error');
      const formatted = formatAuthError(error);
      expect(formatted).toBe('Regular error');
    });

    it('should format unknown error', () => {
      const formatted = formatAuthError('string error');
      expect(formatted).toBe('An authentication error occurred. Please try again.');
    });
  });

  describe('isAuthError', () => {
    it('should return true for AuthError', () => {
      const error = new AuthError('Test');
      expect(isAuthError(error)).toBe(true);
    });

    it('should return true for TokenError', () => {
      const error = new TokenError('Test');
      expect(isAuthError(error)).toBe(true);
    });

    it('should return true for ProviderError', () => {
      const error = new ProviderError('Test', 'google');
      expect(isAuthError(error)).toBe(true);
    });

    it('should return false for regular Error', () => {
      const error = new Error('Test');
      expect(isAuthError(error)).toBe(false);
    });
  });
});

