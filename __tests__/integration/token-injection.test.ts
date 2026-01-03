import { getAuthHeaders } from '@/lib/auth/utils';
import { createClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('Token Injection Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAuthHeaders', () => {
    it('should return Authorization header with token', async () => {
      const mockSupabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: {
              session: {
                access_token: 'test-access-token',
              },
            },
          }),
        },
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const headers = await getAuthHeaders();
      const headersObj = headers as Record<string, string>;

      expect(headersObj.Authorization).toBe('Bearer test-access-token');
    });

    it('should return empty headers when no session', async () => {
      const mockSupabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: null },
          }),
        },
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const headers = await getAuthHeaders();

      expect(headers).toEqual({});
    });
  });
});

