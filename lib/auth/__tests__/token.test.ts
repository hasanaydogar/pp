import {
  decodeJWT,
  isTokenExpired,
  getTokenExpirationTime,
} from '../token';

describe('Token Utilities', () => {
  describe('decodeJWT', () => {
    it('should decode a valid JWT token', () => {
      // Create a simple test token
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(
        JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600, sub: '123' })
      );
      const signature = 'test-signature';
      const token = `${header}.${payload}.${signature}`;

      const decoded = decodeJWT(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.sub).toBe('123');
      expect(decoded?.exp).toBeDefined();
    });

    it('should return null for invalid token', () => {
      const decoded = decodeJWT('invalid.token');
      expect(decoded).toBeNull();
    });

    it('should return null for empty token', () => {
      const decoded = decodeJWT('');
      expect(decoded).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for non-expired token', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(
        JSON.stringify({
          exp: Math.floor(Date.now() / 1000) + 600, // 10 minutes from now
          sub: '123',
        })
      );
      const token = `${header}.${payload}.signature`;

      expect(isTokenExpired(token)).toBe(false);
    });

    it('should return true for expired token', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(
        JSON.stringify({
          exp: Math.floor(Date.now() / 1000) - 600, // 10 minutes ago
          sub: '123',
        })
      );
      const token = `${header}.${payload}.signature`;

      expect(isTokenExpired(token)).toBe(true);
    });

    it('should return true for token expiring soon (within 5 minutes)', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(
        JSON.stringify({
          exp: Math.floor(Date.now() / 1000) + 240, // 4 minutes from now
          sub: '123',
        })
      );
      const token = `${header}.${payload}.signature`;

      expect(isTokenExpired(token)).toBe(true);
    });

    it('should return true for invalid token', () => {
      expect(isTokenExpired('invalid.token')).toBe(true);
    });
  });

  describe('getTokenExpirationTime', () => {
    it('should return expiration time for valid token', () => {
      const exp = Math.floor(Date.now() / 1000) + 3600;
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ exp, sub: '123' }));
      const token = `${header}.${payload}.signature`;

      const expirationTime = getTokenExpirationTime(token);

      expect(expirationTime).toBe(exp * 1000); // Should be in milliseconds
    });

    it('should return null for invalid token', () => {
      const expirationTime = getTokenExpirationTime('invalid.token');
      expect(expirationTime).toBeNull();
    });
  });
});

