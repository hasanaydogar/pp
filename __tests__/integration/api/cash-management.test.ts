// Mock dependencies - must be before any imports that use them
jest.mock('@/lib/supabase/server');

import { createClient } from '@/lib/supabase/server';
import { CashTransactionType } from '@/lib/types/cash';

describe('Cash Management API Integration Tests', () => {
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
  let cashRouteGET: typeof import('@/app/api/portfolios/[id]/cash/route').GET;
  let cashRoutePOST: typeof import('@/app/api/portfolios/[id]/cash/route').POST;

  beforeAll(async () => {
    const cashRouteModule = await import('@/app/api/portfolios/[id]/cash/route');
    cashRouteGET = cashRouteModule.GET;
    cashRoutePOST = cashRouteModule.POST;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockRequest = (method: string, body?: object) => {
    return new Request('http://localhost/api/portfolios/portfolio-1/cash', {
      method,
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  const createRouteParams = (id: string) => ({
    params: Promise.resolve({ id }),
  });

  describe('GET /api/portfolios/[id]/cash', () => {
    it('should return cash positions for authenticated user', async () => {
      const mockCashPositions = [
        {
          id: 'cash-1',
          portfolio_id: 'portfolio-1',
          currency: 'TRY',
          amount: 100000,
          last_updated: '2025-01-01T00:00:00Z',
          notes: null,
        },
        {
          id: 'cash-2',
          portfolio_id: 'portfolio-1',
          currency: 'USD',
          amount: 5000,
          last_updated: '2025-01-01T00:00:00Z',
          notes: 'Emergency fund',
        },
      ];

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
          if (table === 'cash_positions') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              order: jest.fn().mockResolvedValue({ data: mockCashPositions, error: null }),
            };
          }
          return {};
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('GET');
      const response = await cashRouteGET(request, createRouteParams('portfolio-1'));
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toHaveLength(2);
      expect(json[0].currency).toBe('TRY');
      expect(json[0].amount).toBe(100000);
    });

    it('should return 401 for unauthenticated user', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('GET');
      const response = await cashRouteGET(request, createRouteParams('portfolio-1'));
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
      const response = await cashRouteGET(request, createRouteParams('non-existent'));
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.error).toBe('Portfolio not found');
    });

    it('should return empty array when no cash positions exist', async () => {
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
          if (table === 'cash_positions') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              order: jest.fn().mockResolvedValue({ data: [], error: null }),
            };
          }
          return {};
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('GET');
      const response = await cashRouteGET(request, createRouteParams('portfolio-1'));
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual([]);
    });
  });

  describe('POST /api/portfolios/[id]/cash', () => {
    it('should create cash position for authenticated user', async () => {
      const newCashPosition = {
        id: 'cash-3',
        portfolio_id: 'portfolio-1',
        currency: 'EUR',
        amount: 2500,
        last_updated: '2025-01-02T00:00:00Z',
        notes: 'Euro savings',
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
          if (table === 'cash_positions') {
            return {
              insert: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: newCashPosition, error: null }),
            };
          }
          return {};
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('POST', {
        currency: 'EUR',
        amount: 2500,
        notes: 'Euro savings',
      });
      const response = await cashRoutePOST(request, createRouteParams('portfolio-1'));
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.currency).toBe('EUR');
      expect(json.amount).toBe(2500);
    });

    it('should return 401 for unauthenticated user', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('POST', { currency: 'USD', amount: 1000 });
      const response = await cashRoutePOST(request, createRouteParams('portfolio-1'));
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error).toBe('Unauthorized');
    });

    it('should return 409 for duplicate currency', async () => {
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
          if (table === 'cash_positions') {
            return {
              insert: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { code: '23505', message: 'Duplicate key' }
              }),
            };
          }
          return {};
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('POST', { currency: 'TRY', amount: 50000 });
      const response = await cashRoutePOST(request, createRouteParams('portfolio-1'));
      const json = await response.json();

      expect(response.status).toBe(409);
      expect(json.error).toBe('Cash position for this currency already exists');
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

      const request = createMockRequest('POST', { currency: 'USD', amount: 1000 });
      const response = await cashRoutePOST(request, createRouteParams('non-existent'));
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.error).toBe('Portfolio not found');
    });

    it('should create cash position with default values', async () => {
      const newCashPosition = {
        id: 'cash-4',
        portfolio_id: 'portfolio-1',
        currency: 'TRY',
        amount: 0,
        last_updated: '2025-01-02T00:00:00Z',
        notes: null,
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
          if (table === 'cash_positions') {
            return {
              insert: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: newCashPosition, error: null }),
            };
          }
          return {};
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('POST', {});
      const response = await cashRoutePOST(request, createRouteParams('portfolio-1'));
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.currency).toBe('TRY'); // Default currency
      expect(json.amount).toBe(0); // Default amount
    });
  });

  describe('CashTransactionType enum', () => {
    it('should have all required transaction types', () => {
      expect(CashTransactionType.DEPOSIT).toBeDefined();
      expect(CashTransactionType.WITHDRAW).toBeDefined();
      expect(CashTransactionType.BUY_ASSET).toBeDefined();
      expect(CashTransactionType.SELL_ASSET).toBeDefined();
      expect(CashTransactionType.DIVIDEND).toBeDefined();
      expect(CashTransactionType.FEE).toBeDefined();
      expect(CashTransactionType.INTEREST).toBeDefined();
      expect(CashTransactionType.TRANSFER_IN).toBeDefined();
      expect(CashTransactionType.TRANSFER_OUT).toBeDefined();
    });
  });
});
