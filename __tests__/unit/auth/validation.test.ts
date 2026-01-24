/**
 * Unit Tests: Form Validation (T030)
 *
 * Tests for auth form validation utilities:
 * - Email validation
 * - Password strength validation
 * - Password match validation
 * - Error message localization
 */

import {
  getAuthErrorMessage,
  getErrorMessageByCode,
  createAuthError,
  createAuthSuccess,
  type AuthErrorCode,
} from '@/lib/auth/errors';

import { validatePassword } from '@/components/auth/password-strength';

describe('Auth Error Handling', () => {
  describe('getAuthErrorMessage', () => {
    it('should return Turkish message for invalid credentials', () => {
      const message = getAuthErrorMessage('Invalid login credentials');
      expect(message).toBe('Email veya şifre hatalı');
    });

    it('should return Turkish message for email already registered', () => {
      const message = getAuthErrorMessage('User already registered');
      expect(message).toBe('Bu email adresi zaten kayıtlı');
    });

    it('should return Turkish message for weak password', () => {
      const message = getAuthErrorMessage('Password should be at least 8 characters');
      expect(message).toBe('Şifre en az 8 karakter olmalı');
    });

    it('should return Turkish message for email not confirmed', () => {
      const message = getAuthErrorMessage('Email not confirmed');
      expect(message).toBe('Lütfen email adresinizi doğrulayın');
    });

    it('should return Turkish message for rate limit', () => {
      const message = getAuthErrorMessage('Too many requests');
      expect(message).toBe('Çok fazla deneme yaptınız. Lütfen bekleyin.');
    });

    it('should return Turkish message for network error', () => {
      const message = getAuthErrorMessage('fetch failed');
      expect(message).toBe('Bağlantı hatası. Lütfen tekrar deneyin.');
    });

    it('should return unknown error message for unrecognized errors', () => {
      const message = getAuthErrorMessage('Some random error');
      expect(message).toBe('Bir hata oluştu. Lütfen tekrar deneyin.');
    });

    it('should handle Error objects', () => {
      const error = new Error('Invalid login credentials');
      const message = getAuthErrorMessage(error);
      expect(message).toBe('Email veya şifre hatalı');
    });

    it('should handle null/undefined', () => {
      const message = getAuthErrorMessage(null);
      expect(message).toBe('Bir hata oluştu. Lütfen tekrar deneyin.');
    });
  });

  describe('getErrorMessageByCode', () => {
    const testCases: [AuthErrorCode, string][] = [
      ['invalid_credentials', 'Email veya şifre hatalı'],
      ['email_taken', 'Bu email adresi zaten kayıtlı'],
      ['weak_password', 'Şifre en az 8 karakter olmalı'],
      ['email_not_confirmed', 'Lütfen email adresinizi doğrulayın'],
      ['rate_limit', 'Çok fazla deneme yaptınız. Lütfen bekleyin.'],
      ['network_error', 'Bağlantı hatası. Lütfen tekrar deneyin.'],
      ['invalid_email', 'Geçerli bir email adresi girin'],
      ['password_mismatch', 'Şifreler eşleşmiyor'],
      ['user_not_found', 'Bu email adresiyle kayıtlı kullanıcı bulunamadı'],
      ['expired_token', 'Oturum süresi doldu. Lütfen tekrar giriş yapın.'],
      ['unknown', 'Bir hata oluştu. Lütfen tekrar deneyin.'],
    ];

    test.each(testCases)('should return correct message for %s', (code, expectedMessage) => {
      expect(getErrorMessageByCode(code)).toBe(expectedMessage);
    });
  });

  describe('createAuthError', () => {
    it('should create error result with correct structure', () => {
      const result = createAuthError('Invalid login credentials');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email veya şifre hatalı');
      expect(result.errorCode).toBe('invalid_credentials');
    });

    it('should handle Error objects', () => {
      const result = createAuthError(new Error('User already registered'));

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('email_taken');
    });
  });

  describe('createAuthSuccess', () => {
    it('should create success result without data', () => {
      const result = createAuthSuccess();

      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
    });

    it('should create success result with data', () => {
      const userData = { id: '123', name: 'Test' };
      const result = createAuthSuccess(userData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(userData);
    });
  });
});

describe('Password Validation', () => {
  describe('validatePassword', () => {
    it('should return error for password less than 8 characters', () => {
      expect(validatePassword('short')).toBe('Şifre en az 8 karakter olmalı');
      expect(validatePassword('1234567')).toBe('Şifre en az 8 karakter olmalı');
    });

    it('should return null for password with 8+ characters', () => {
      expect(validatePassword('password')).toBeNull();
      expect(validatePassword('12345678')).toBeNull();
      expect(validatePassword('LongSecurePassword123!')).toBeNull();
    });

    it('should return error for empty password', () => {
      expect(validatePassword('')).toBe('Şifre en az 8 karakter olmalı');
    });
  });
});

describe('Email Validation', () => {
  // Email validation regex used in forms
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  describe('valid emails', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.org',
      'user+tag@example.co.uk',
      'firstname.lastname@company.com',
      'email@subdomain.domain.com',
    ];

    test.each(validEmails)('should accept valid email: %s', (email) => {
      expect(emailRegex.test(email)).toBe(true);
    });
  });

  describe('invalid emails', () => {
    const invalidEmails = [
      'plainaddress',
      '@missingusername.com',
      'username@.com',
      'username@domain',
      'user name@domain.com',
      '',
    ];

    test.each(invalidEmails)('should reject invalid email: %s', (email) => {
      expect(emailRegex.test(email)).toBe(false);
    });
  });
});

describe('Password Match Validation', () => {
  // Simple password match function used in forms
  const passwordsMatch = (password: string, confirmPassword: string): boolean => {
    return password === confirmPassword;
  };

  it('should return true when passwords match', () => {
    expect(passwordsMatch('password123', 'password123')).toBe(true);
    expect(passwordsMatch('', '')).toBe(true);
  });

  it('should return false when passwords do not match', () => {
    expect(passwordsMatch('password123', 'password456')).toBe(false);
    expect(passwordsMatch('Password123', 'password123')).toBe(false); // Case sensitive
    expect(passwordsMatch('password123', '')).toBe(false);
  });
});

describe('Password Strength Calculation', () => {
  // Helper to calculate password strength score
  const calculateStrengthScore = (password: string): number => {
    if (!password) return 0;
    let score = 0;

    // Length checks
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Character type checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    return score;
  };

  it('should return 0 for empty password', () => {
    expect(calculateStrengthScore('')).toBe(0);
  });

  it('should return low score for weak passwords', () => {
    expect(calculateStrengthScore('abc')).toBeLessThanOrEqual(2);
    expect(calculateStrengthScore('password')).toBeLessThanOrEqual(3);
  });

  it('should return medium score for moderate passwords', () => {
    const score = calculateStrengthScore('Password1');
    expect(score).toBeGreaterThanOrEqual(3);
    expect(score).toBeLessThanOrEqual(5);
  });

  it('should return high score for strong passwords', () => {
    expect(calculateStrengthScore('MyP@ssw0rd123!')).toBeGreaterThanOrEqual(5);
  });
});
