/**
 * Unit Tests: Auth Actions (T029)
 *
 * Tests for email/password authentication server actions:
 * - signInWithEmail
 * - signUpWithEmail
 * - resetPassword
 * - updatePassword
 * - getCurrentUser
 */

// Mock setup before imports
const mockSignInWithPassword = jest.fn();
const mockSignUp = jest.fn();
const mockResetPasswordForEmail = jest.fn();
const mockUpdateUser = jest.fn();
const mockGetUser = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      resetPasswordForEmail: mockResetPasswordForEmail,
      updateUser: mockUpdateUser,
      getUser: mockGetUser,
    },
  })),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('Auth Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signInWithEmail', () => {
    it('should return success with user on valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' },
      };

      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'token' } },
        error: null,
      });

      const { signInWithEmail } = await import('@/lib/auth/actions');
      const result = await signInWithEmail('test@example.com', 'password123');

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
    });

    it('should return error on invalid credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });

      const { signInWithEmail } = await import('@/lib/auth/actions');
      const result = await signInWithEmail('test@example.com', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid login credentials');
    });

    it('should handle empty email', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email is required' },
      });

      const { signInWithEmail } = await import('@/lib/auth/actions');
      const result = await signInWithEmail('', 'password123');

      expect(result.success).toBe(false);
    });
  });

  describe('signUpWithEmail', () => {
    it('should return success with user on valid registration', async () => {
      const mockUser = {
        id: 'user-456',
        email: 'newuser@example.com',
        user_metadata: { full_name: 'New User' },
      };

      mockSignUp.mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'token' } },
        error: null,
      });

      const { signUpWithEmail } = await import('@/lib/auth/actions');
      const result = await signUpWithEmail('newuser@example.com', 'password123', 'New User');

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
    });

    it('should indicate when email confirmation is needed', async () => {
      const mockUser = {
        id: 'user-456',
        email: 'newuser@example.com',
      };

      mockSignUp.mockResolvedValue({
        data: { user: mockUser, session: null }, // No session = needs confirmation
        error: null,
      });

      const { signUpWithEmail } = await import('@/lib/auth/actions');
      const result = await signUpWithEmail('newuser@example.com', 'password123', 'New User');

      expect(result.success).toBe(true);
      expect(result.needsConfirmation).toBe(true);
    });

    it('should return error when email already exists', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already registered' },
      });

      const { signUpWithEmail } = await import('@/lib/auth/actions');
      const result = await signUpWithEmail('existing@example.com', 'password123', 'Test');

      expect(result.success).toBe(false);
      expect(result.error).toContain('already registered');
    });

    it('should return error for weak password', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Password should be at least 8 characters' },
      });

      const { signUpWithEmail } = await import('@/lib/auth/actions');
      const result = await signUpWithEmail('test@example.com', 'short', 'Test');

      expect(result.success).toBe(false);
    });
  });

  describe('resetPassword', () => {
    it('should always return success for security (email exists)', async () => {
      mockResetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      });

      const { resetPassword } = await import('@/lib/auth/actions');
      const result = await resetPassword('existing@example.com');

      expect(result.success).toBe(true);
    });

    it('should always return success for security (email does not exist)', async () => {
      // Even if email doesn't exist, we return success for security
      mockResetPasswordForEmail.mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
      });

      const { resetPassword } = await import('@/lib/auth/actions');
      const result = await resetPassword('nonexistent@example.com');

      // Should still return success to not reveal if email exists
      expect(result.success).toBe(true);
    });
  });

  describe('updatePassword', () => {
    it('should return success on valid password update', async () => {
      mockUpdateUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const { updatePassword } = await import('@/lib/auth/actions');
      const result = await updatePassword('newSecurePassword123');

      expect(result.success).toBe(true);
    });

    it('should return error on invalid password', async () => {
      mockUpdateUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Password is too weak' },
      });

      const { updatePassword } = await import('@/lib/auth/actions');
      const result = await updatePassword('weak');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user data when authenticated', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        app_metadata: { provider: 'email' },
        user_metadata: {
          full_name: 'Test User',
          avatar_url: 'https://example.com/avatar.jpg',
        },
      };

      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { getCurrentUser } = await import('@/lib/auth/actions');
      const result = await getCurrentUser();

      expect(result).not.toBeNull();
      expect(result?.id).toBe('user-123');
      expect(result?.email).toBe('test@example.com');
      expect(result?.name).toBe('Test User');
    });

    it('should return null when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const { getCurrentUser } = await import('@/lib/auth/actions');
      const result = await getCurrentUser();

      expect(result).toBeNull();
    });

    it('should extract name from various metadata sources', async () => {
      // Test with given_name and family_name
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {
          given_name: 'John',
          family_name: 'Doe',
        },
      };

      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { getCurrentUser } = await import('@/lib/auth/actions');
      const result = await getCurrentUser();

      expect(result?.name).toBe('John Doe');
    });
  });
});
