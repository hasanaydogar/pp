/**
 * Integration Tests: Email Auth Flows (T031)
 *
 * Tests for complete authentication flows:
 * - Login flow
 * - Register flow
 * - Password reset flow
 * - Error scenarios
 */

import { redirect } from 'next/navigation';

// Mock setup before imports
const mockSignInWithPassword = jest.fn();
const mockSignUp = jest.fn();
const mockResetPasswordForEmail = jest.fn();
const mockUpdateUser = jest.fn();
const mockGetUser = jest.fn();
const mockSignOut = jest.fn();
const mockSignInWithOAuth = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      resetPasswordForEmail: mockResetPasswordForEmail,
      updateUser: mockUpdateUser,
      getUser: mockGetUser,
      signOut: mockSignOut,
      signInWithOAuth: mockSignInWithOAuth,
    },
  })),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;

describe('Email Auth Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login Flow', () => {
    it('should complete full login flow with valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' },
      };

      const mockSession = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_at: Date.now() + 3600000,
      };

      // Step 1: Sign in
      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const { signInWithEmail } = await import('@/lib/auth/actions');
      const loginResult = await signInWithEmail('test@example.com', 'password123');

      expect(loginResult.success).toBe(true);
      expect(loginResult.user).toBeDefined();

      // Step 2: Verify user can be retrieved
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { getCurrentUser } = await import('@/lib/auth/actions');
      const user = await getCurrentUser();

      expect(user).not.toBeNull();
      expect(user?.email).toBe('test@example.com');
    });

    it('should handle login with incorrect password', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });

      const { signInWithEmail } = await import('@/lib/auth/actions');
      const result = await signInWithEmail('test@example.com', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid login credentials');
    });

    it('should handle login with non-existent email', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });

      const { signInWithEmail } = await import('@/lib/auth/actions');
      const result = await signInWithEmail('nonexistent@example.com', 'password123');

      expect(result.success).toBe(false);
    });

    it('should handle rate limiting', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Too many requests' },
      });

      const { signInWithEmail } = await import('@/lib/auth/actions');
      const result = await signInWithEmail('test@example.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Too many requests');
    });
  });

  describe('Register Flow', () => {
    it('should complete full registration flow', async () => {
      const mockUser = {
        id: 'new-user-123',
        email: 'newuser@example.com',
        user_metadata: { full_name: 'New User' },
      };

      // Registration without email confirmation
      mockSignUp.mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'token' } },
        error: null,
      });

      const { signUpWithEmail } = await import('@/lib/auth/actions');
      const result = await signUpWithEmail('newuser@example.com', 'password123', 'New User');

      expect(result.success).toBe(true);
      expect(result.user?.email).toBe('newuser@example.com');
      expect(result.needsConfirmation).toBeFalsy();
    });

    it('should handle registration requiring email confirmation', async () => {
      const mockUser = {
        id: 'new-user-123',
        email: 'newuser@example.com',
        user_metadata: { full_name: 'New User' },
      };

      // Registration with email confirmation required (no session)
      mockSignUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      const { signUpWithEmail } = await import('@/lib/auth/actions');
      const result = await signUpWithEmail('newuser@example.com', 'password123', 'New User');

      expect(result.success).toBe(true);
      expect(result.needsConfirmation).toBe(true);
    });

    it('should handle duplicate email registration', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already registered' },
      });

      const { signUpWithEmail } = await import('@/lib/auth/actions');
      const result = await signUpWithEmail('existing@example.com', 'password123', 'Test');

      expect(result.success).toBe(false);
      expect(result.error).toContain('already registered');
    });

    it('should handle weak password error', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Password should be at least 8 characters' },
      });

      const { signUpWithEmail } = await import('@/lib/auth/actions');
      const result = await signUpWithEmail('test@example.com', 'weak', 'Test');

      expect(result.success).toBe(false);
    });
  });

  describe('Password Reset Flow', () => {
    it('should send password reset email', async () => {
      mockResetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      });

      const { resetPassword } = await import('@/lib/auth/actions');
      const result = await resetPassword('test@example.com');

      expect(result.success).toBe(true);
    });

    it('should not reveal if email exists (security)', async () => {
      // Even if email doesn't exist, should return success
      mockResetPasswordForEmail.mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
      });

      const { resetPassword } = await import('@/lib/auth/actions');
      const result = await resetPassword('nonexistent@example.com');

      // Should still return success for security
      expect(result.success).toBe(true);
    });

    it('should update password successfully', async () => {
      mockUpdateUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const { updatePassword } = await import('@/lib/auth/actions');
      const result = await updatePassword('newSecurePassword123');

      expect(result.success).toBe(true);
    });

    it('should handle password update failure', async () => {
      mockUpdateUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Session expired' },
      });

      const { updatePassword } = await import('@/lib/auth/actions');
      const result = await updatePassword('newPassword123');

      expect(result.success).toBe(false);
    });
  });

  describe('Sign Out Flow', () => {
    it('should sign out and redirect to login', async () => {
      mockSignOut.mockResolvedValue({
        error: null,
      });

      // signOut throws redirect, so we need to catch it
      const { signOut } = await import('@/lib/auth/actions');

      try {
        await signOut();
      } catch (e) {
        // redirect throws an error in tests
      }

      expect(mockRedirect).toHaveBeenCalledWith('/login');
    });
  });

  describe('OAuth Flow Integration', () => {
    it('should initiate Google OAuth flow', async () => {
      mockSignInWithOAuth.mockResolvedValue({
        data: { url: 'https://accounts.google.com/oauth/...' },
        error: null,
      });

      const { signInWithProvider } = await import('@/lib/auth/actions');

      try {
        await signInWithProvider('google');
      } catch (e) {
        // redirect throws
      }

      // Should redirect to OAuth URL
      expect(mockRedirect).toHaveBeenCalled();
    });
  });
});

describe('Auth State Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('should extract user metadata correctly', async () => {
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
      const user = await getCurrentUser();

      expect(user?.name).toBe('Test User');
      expect(user?.avatar_url).toBe('https://example.com/avatar.jpg');
    });

    it('should handle Google OAuth metadata format', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@gmail.com',
        app_metadata: { provider: 'google' },
        user_metadata: {
          name: 'Google User',
          picture: 'https://lh3.googleusercontent.com/...',
        },
      };

      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { getCurrentUser } = await import('@/lib/auth/actions');
      const user = await getCurrentUser();

      expect(user?.name).toBe('Google User');
      expect(user?.avatar_url).toBe('https://lh3.googleusercontent.com/...');
    });
  });
});
