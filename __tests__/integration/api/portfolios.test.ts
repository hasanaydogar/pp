// Mock dependencies - must be before any imports that use them
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/auth/actions');

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/actions';

describe('Portfolio API Integration Tests', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  };

  // Import route handlers dynamically to ensure mocks are applied
  let GET: typeof import('@/app/api/portfolios/route').GET;
  let POST: typeof import('@/app/api/portfolios/route').POST;

  beforeAll(async () => {
    const routeModule = await import('@/app/api/portfolios/route');
    GET = routeModule.GET;
    POST = routeModule.POST;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
  });

  describe('GET /api/portfolios', () => {
    it('should return portfolios for authenticated user', async () => {
      const mockPortfolios = [
        {
          id: 'portfolio-1',
          user_id: 'user-123',
          name: 'Test Portfolio',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: null,
        },
      ];

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockPortfolios,
          error: null,
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data).toEqual(mockPortfolios);
    });

    it('should return 401 for unauthenticated user', async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);

      const response = await GET();

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/portfolios', () => {
    it('should create portfolio for authenticated user', async () => {
      const newPortfolio = {
        id: 'portfolio-2',
        user_id: 'user-123',
        name: 'New Portfolio',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: null,
      };

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: newPortfolio,
          error: null,
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = new Request('http://localhost/api/portfolios', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Portfolio' }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.data.name).toBe('New Portfolio');
      expect(json.data.user_id).toBe('user-123');
    });

    it('should return 400 for invalid input', async () => {
      const request = new Request('http://localhost/api/portfolios', {
        method: 'POST',
        body: JSON.stringify({ name: '' }), // Invalid: empty name
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });
});

