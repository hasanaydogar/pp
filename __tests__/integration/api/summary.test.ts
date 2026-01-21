// Mock dependencies - must be before any imports that use them
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/api/summary');

import { createClient } from '@/lib/supabase/server';
import { calculatePortfolioSummary, aggregatePortfolioSummaries } from '@/lib/api/summary';

describe('Summary API Integration Tests', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  // Import route handler dynamically to ensure mocks are applied
  let GET: typeof import('@/app/api/summary/route').GET;

  beforeAll(async () => {
    const routeModule = await import('@/app/api/summary/route');
    GET = routeModule.GET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockRequest = (queryParams: Record<string, string> = {}) => {
    const url = new URL('http://localhost/api/summary');
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return new Request(url.toString(), { method: 'GET' });
  };

  describe('GET /api/summary', () => {
    it('should return aggregated summary for authenticated user', async () => {
      const mockPortfolios = [
        {
          id: 'portfolio-1',
          user_id: 'user-123',
          name: 'Portfolio 1',
          assets: [
            { id: 'asset-1', symbol: 'AAPL', quantity: 10, current_price: 150 },
          ],
          cash_positions: [
            { id: 'cash-1', currency: 'USD', amount: 5000 },
          ],
        },
        {
          id: 'portfolio-2',
          user_id: 'user-123',
          name: 'Portfolio 2',
          assets: [
            { id: 'asset-2', symbol: 'GOOGL', quantity: 5, current_price: 2500 },
          ],
          cash_positions: [
            { id: 'cash-2', currency: 'USD', amount: 10000 },
          ],
        },
      ];

      const mockPolicies = [
        { portfolio_id: 'portfolio-1', max_weight_per_stock: 0.12 },
        { portfolio_id: 'portfolio-2', max_weight_per_stock: 0.15 },
      ];

      const mockSummaries = [
        {
          portfolio_id: 'portfolio-1',
          total_value: 6500,
          total_cash: 5000,
          total_assets_value: 1500,
        },
        {
          portfolio_id: 'portfolio-2',
          total_value: 22500,
          total_cash: 10000,
          total_assets_value: 12500,
        },
      ];

      const mockAggregatedResult = {
        user_id: 'user-123',
        display_currency: 'TRY',
        total_value: 29000,
        total_cash: 15000,
        total_assets_value: 14000,
        portfolio_count: 2,
        total_asset_count: 2,
        daily_change: 500,
        daily_change_percent: 1.75,
        by_portfolio: mockSummaries,
        by_asset_type: [{ type: 'STOCK', value: 14000, percentage: 0.48 }],
        by_sector: [],
        all_policy_violations: [],
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
              order: jest.fn().mockResolvedValue({ data: mockPortfolios, error: null }),
            };
          }
          if (table === 'portfolio_policies') {
            return {
              select: jest.fn().mockReturnThis(),
              in: jest.fn().mockResolvedValue({ data: mockPolicies, error: null }),
            };
          }
          return {};
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);
      (calculatePortfolioSummary as jest.Mock).mockImplementation((portfolio) => {
        return mockSummaries.find(s => s.portfolio_id === portfolio.id);
      });
      (aggregatePortfolioSummaries as jest.Mock).mockReturnValue(mockAggregatedResult);

      const request = createMockRequest();
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.portfolio_count).toBe(2);
      expect(json.total_value).toBe(29000);
      expect(json.total_cash).toBe(15000);
    });

    it('should return 401 for unauthenticated user', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest();
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error).toBe('Unauthorized');
    });

    it('should return empty summary when user has no portfolios', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest();
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.portfolio_count).toBe(0);
      expect(json.total_value).toBe(0);
      expect(json.by_portfolio).toEqual([]);
    });

    it('should use specified currency from query params', async () => {
      const mockPortfolios = [
        {
          id: 'portfolio-1',
          user_id: 'user-123',
          name: 'Portfolio 1',
          assets: [],
          cash_positions: [{ id: 'cash-1', currency: 'USD', amount: 1000 }],
        },
      ];

      const mockAggregatedResult = {
        user_id: 'user-123',
        display_currency: 'USD',
        total_value: 1000,
        total_cash: 1000,
        total_assets_value: 0,
        portfolio_count: 1,
        total_asset_count: 0,
        daily_change: 0,
        daily_change_percent: 0,
        by_portfolio: [],
        by_asset_type: [],
        by_sector: [],
        all_policy_violations: [],
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
              order: jest.fn().mockResolvedValue({ data: mockPortfolios, error: null }),
            };
          }
          if (table === 'portfolio_policies') {
            return {
              select: jest.fn().mockReturnThis(),
              in: jest.fn().mockResolvedValue({ data: [], error: null }),
            };
          }
          return {};
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);
      (calculatePortfolioSummary as jest.Mock).mockReturnValue({
        portfolio_id: 'portfolio-1',
        total_value: 1000,
      });
      (aggregatePortfolioSummaries as jest.Mock).mockReturnValue(mockAggregatedResult);

      const request = createMockRequest({ currency: 'USD' });
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.display_currency).toBe('USD');
      expect(aggregatePortfolioSummaries).toHaveBeenCalledWith(
        expect.any(Array),
        'user-123',
        'USD'
      );
    });

    it('should return 500 on database error', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database connection error' }
          }),
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest();
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Database connection error');
    });

    it('should include policy violations in response', async () => {
      const mockPortfolios = [
        {
          id: 'portfolio-1',
          user_id: 'user-123',
          name: 'Portfolio 1',
          assets: [
            { id: 'asset-1', symbol: 'AAPL', quantity: 100, current_price: 150 },
          ],
          cash_positions: [
            { id: 'cash-1', currency: 'TRY', amount: 1000 },
          ],
        },
      ];

      const mockViolations = [
        {
          portfolio_id: 'portfolio-1',
          type: 'OVER_WEIGHT',
          severity: 'critical',
          asset_symbol: 'AAPL',
          current_value: 0.95,
          limit_value: 0.12,
          recommendation: 'Consider reducing AAPL position',
        },
      ];

      const mockAggregatedResult = {
        user_id: 'user-123',
        display_currency: 'TRY',
        total_value: 16000,
        total_cash: 1000,
        total_assets_value: 15000,
        portfolio_count: 1,
        total_asset_count: 1,
        daily_change: 0,
        daily_change_percent: 0,
        by_portfolio: [],
        by_asset_type: [],
        by_sector: [],
        all_policy_violations: mockViolations,
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
              order: jest.fn().mockResolvedValue({ data: mockPortfolios, error: null }),
            };
          }
          if (table === 'portfolio_policies') {
            return {
              select: jest.fn().mockReturnThis(),
              in: jest.fn().mockResolvedValue({ data: [], error: null }),
            };
          }
          return {};
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);
      (calculatePortfolioSummary as jest.Mock).mockReturnValue({
        portfolio_id: 'portfolio-1',
        total_value: 16000,
      });
      (aggregatePortfolioSummaries as jest.Mock).mockReturnValue(mockAggregatedResult);

      const request = createMockRequest();
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.all_policy_violations).toHaveLength(1);
      expect(json.all_policy_violations[0].type).toBe('OVER_WEIGHT');
    });
  });
});
