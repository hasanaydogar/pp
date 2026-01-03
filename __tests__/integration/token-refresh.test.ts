import { refreshToken } from '@/lib/auth/utils';
import { createClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('Token Refresh Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const mockSupabase = {
        auth: {
          refreshSession: jest.fn().mockResolvedValue({
            data: {
              session: {
                access_token: 'new-access-token',
              },
            },
            error: null,
          }),
        },
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const token = await refreshToken();

      expect(token).toBe('new-access-token');
      expect(mockSupabase.auth.refreshSession).toHaveBeenCalled();
    });

    it('should return null on refresh error', async () => {
      const mockSupabase = {
        auth: {
          refreshSession: jest.fn().mockResolvedValue({
            data: { session: null },
            error: { message: 'Refresh failed' },
          }),
        },
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const token = await refreshToken();

      expect(token).toBeNull();
    });

    it('should return null when no session', async () => {
      const mockSupabase = {
        auth: {
          refreshSession: jest.fn().mockResolvedValue({
            data: { session: null },
            error: null,
          }),
        },
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const token = await refreshToken();

      expect(token).toBeNull();
    });
  });
});

