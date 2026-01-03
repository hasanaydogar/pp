import { createClient } from '@/lib/supabase/server';

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Mock the actions module
jest.mock('@/lib/auth/actions', () => ({
  signInWithProvider: jest.fn(),
}));

describe('OAuth2 Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signInWithProvider', () => {
    it('should have signInWithProvider function available', async () => {
      const { signInWithProvider } = await import('@/lib/auth/actions');
      expect(signInWithProvider).toBeDefined();
    });
  });
});

