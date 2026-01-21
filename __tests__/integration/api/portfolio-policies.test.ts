// Mock dependencies - must be before any imports that use them
jest.mock('@/lib/supabase/server');

import { createClient } from '@/lib/supabase/server';
import { DEFAULT_POLICY } from '@/lib/types/policy';

describe('Portfolio Policies API Integration Tests', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockPortfolio = {
    id: 'portfolio-1',
    user_id: 'user-123',
    name: 'Test Portfolio',
  };

  // Import route handlers dynamically to ensure mocks are applied
  let GET: typeof import('@/app/api/portfolios/[id]/policy/route').GET;
  let PUT: typeof import('@/app/api/portfolios/[id]/policy/route').PUT;
  let DELETE: typeof import('@/app/api/portfolios/[id]/policy/route').DELETE;

  beforeAll(async () => {
    const routeModule = await import('@/app/api/portfolios/[id]/policy/route');
    GET = routeModule.GET;
    PUT = routeModule.PUT;
    DELETE = routeModule.DELETE;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockRequest = (method: string, body?: object) => {
    return new Request('http://localhost/api/portfolios/portfolio-1/policy', {
      method,
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  const createRouteParams = (id: string) => ({
    params: Promise.resolve({ id }),
  });

  describe('GET /api/portfolios/[id]/policy', () => {
    it('should return policy for authenticated user with existing policy', async () => {
      const mockPolicy = {
        id: 'policy-1',
        portfolio_id: 'portfolio-1',
        max_weight_per_stock: 0.15,
        core_min_weight: 0.10,
        core_max_weight: 0.15,
        satellite_min_weight: 0.02,
        satellite_max_weight: 0.08,
        new_position_min_weight: 0.005,
        new_position_max_weight: 0.02,
        max_weight_per_sector: 0.30,
        cash_min_percent: 0.05,
        cash_max_percent: 0.15,
        cash_target_percent: 0.10,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: null,
      };

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn((table: string) => {
          if (table === 'portfolios') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: mockPortfolio, error: null }),
            };
          }
          if (table === 'portfolio_policies') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: mockPolicy, error: null }),
            };
          }
          return {};
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('GET');
      const response = await GET(request, createRouteParams('portfolio-1'));
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.max_weight_per_stock).toBe(0.15);
      expect(json.is_default).toBe(false);
    });

    it('should return default policy when no policy exists', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn((table: string) => {
          if (table === 'portfolios') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: mockPortfolio, error: null }),
            };
          }
          if (table === 'portfolio_policies') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116', message: 'No rows returned' }
              }),
            };
          }
          return {};
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('GET');
      const response = await GET(request, createRouteParams('portfolio-1'));
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.max_weight_per_stock).toBe(DEFAULT_POLICY.max_weight_per_stock);
      expect(json.is_default).toBe(true);
    });

    it('should return 401 for unauthenticated user', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('GET');
      const response = await GET(request, createRouteParams('portfolio-1'));
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error).toBe('Unauthorized');
    });

    it('should return 404 for non-existent portfolio', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('GET');
      const response = await GET(request, createRouteParams('non-existent'));
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.error).toBe('Portfolio not found');
    });
  });

  describe('PUT /api/portfolios/[id]/policy', () => {
    it('should create/update policy for authenticated user', async () => {
      const updatedPolicy = {
        id: 'policy-1',
        portfolio_id: 'portfolio-1',
        max_weight_per_stock: 0.20,
        core_min_weight: 0.10,
        core_max_weight: 0.15,
        satellite_min_weight: 0.02,
        satellite_max_weight: 0.08,
        new_position_min_weight: 0.005,
        new_position_max_weight: 0.02,
        max_weight_per_sector: 0.25,
        cash_min_percent: 0.05,
        cash_max_percent: 0.15,
        cash_target_percent: 0.10,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z',
      };

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn((table: string) => {
          if (table === 'portfolios') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: mockPortfolio, error: null }),
            };
          }
          if (table === 'portfolio_policies') {
            return {
              upsert: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: updatedPolicy, error: null }),
            };
          }
          return {};
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('PUT', {
        max_weight_per_stock: 0.20,
        max_weight_per_sector: 0.25,
      });
      const response = await PUT(request, createRouteParams('portfolio-1'));
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.max_weight_per_stock).toBe(0.20);
    });

    it('should return 401 for unauthenticated user', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('PUT', { max_weight_per_stock: 0.20 });
      const response = await PUT(request, createRouteParams('portfolio-1'));
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error).toBe('Unauthorized');
    });

    it('should return 400 for invalid policy values', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockPortfolio, error: null }),
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('PUT', {
        max_weight_per_stock: 2.0, // Invalid: greater than 1
      });
      const response = await PUT(request, createRouteParams('portfolio-1'));

      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent portfolio', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('PUT', { max_weight_per_stock: 0.20 });
      const response = await PUT(request, createRouteParams('non-existent'));
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.error).toBe('Portfolio not found');
    });
  });

  describe('DELETE /api/portfolios/[id]/policy', () => {
    it('should delete policy for authenticated user', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn((table: string) => {
          if (table === 'portfolios') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: mockPortfolio, error: null }),
            };
          }
          if (table === 'portfolio_policies') {
            return {
              delete: jest.fn().mockReturnThis(),
              eq: jest.fn().mockResolvedValue({ error: null }),
            };
          }
          return {};
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('DELETE');
      const response = await DELETE(request, createRouteParams('portfolio-1'));
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.message).toBe('Policy deleted, default values will be used');
    });

    it('should return 401 for unauthenticated user', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('DELETE');
      const response = await DELETE(request, createRouteParams('portfolio-1'));
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error).toBe('Unauthorized');
    });

    it('should return 404 for non-existent portfolio', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('DELETE');
      const response = await DELETE(request, createRouteParams('non-existent'));
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.error).toBe('Portfolio not found');
    });
  });
});
