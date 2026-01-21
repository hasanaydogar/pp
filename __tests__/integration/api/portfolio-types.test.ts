// Mock dependencies - must be before any imports that use them
jest.mock('@/lib/supabase/server');

import { createClient } from '@/lib/supabase/server';

describe('Portfolio Types API Integration Tests', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  // Import route handlers dynamically to ensure mocks are applied
  let GET: typeof import('@/app/api/portfolio-types/route').GET;
  let POST: typeof import('@/app/api/portfolio-types/route').POST;

  beforeAll(async () => {
    const routeModule = await import('@/app/api/portfolio-types/route');
    GET = routeModule.GET;
    POST = routeModule.POST;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/portfolio-types', () => {
    it('should return portfolio types for authenticated user', async () => {
      const mockPortfolioTypes = [
        {
          id: 'type-1',
          user_id: 'user-123',
          name: 'retirement',
          display_name: 'Emeklilik',
          icon: '🏦',
          color: '#10B981',
          created_at: '2025-01-01T00:00:00Z',
        },
        {
          id: 'type-2',
          user_id: 'user-123',
          name: 'growth',
          display_name: 'Büyüme',
          icon: '📈',
          color: '#3B82F6',
          created_at: '2025-01-02T00:00:00Z',
        },
      ];

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockPortfolioTypes,
          error: null,
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual(mockPortfolioTypes);
      expect(json).toHaveLength(2);
    });

    it('should return 401 for unauthenticated user', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error).toBe('Unauthorized');
    });

    it('should return empty array when user has no portfolio types', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual([]);
    });

    it('should return 500 on database error', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error', code: '500' },
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Database error');
    });
  });

  describe('POST /api/portfolio-types', () => {
    it('should create portfolio type for authenticated user', async () => {
      const newPortfolioType = {
        id: 'type-3',
        user_id: 'user-123',
        name: 'income',
        display_name: 'Gelir',
        icon: '💰',
        color: '#F59E0B',
        created_at: '2025-01-03T00:00:00Z',
      };

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: newPortfolioType,
          error: null,
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = new Request('http://localhost/api/portfolio-types', {
        method: 'POST',
        body: JSON.stringify({
          name: 'income',
          display_name: 'Gelir',
          icon: '💰',
          color: '#F59E0B',
        }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.name).toBe('income');
      expect(json.display_name).toBe('Gelir');
    });

    it('should return 401 for unauthenticated user', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = new Request('http://localhost/api/portfolio-types', {
        method: 'POST',
        body: JSON.stringify({
          name: 'test',
          display_name: 'Test',
        }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error).toBe('Unauthorized');
    });

    it('should return 400 for invalid request body', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = new Request('http://localhost/api/portfolio-types', {
        method: 'POST',
        body: JSON.stringify({
          // Missing required fields
          icon: '💰',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should return 409 for duplicate portfolio type name', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Duplicate key', code: '23505' },
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = new Request('http://localhost/api/portfolio-types', {
        method: 'POST',
        body: JSON.stringify({
          name: 'existing',
          display_name: 'Existing Type',
        }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(409);
      expect(json.error).toBe('Portfolio type with this name already exists');
    });

    it('should create portfolio type without optional fields', async () => {
      const newPortfolioType = {
        id: 'type-4',
        user_id: 'user-123',
        name: 'simple',
        display_name: 'Simple',
        icon: null,
        color: null,
        created_at: '2025-01-04T00:00:00Z',
      };

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: newPortfolioType,
          error: null,
        }),
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = new Request('http://localhost/api/portfolio-types', {
        method: 'POST',
        body: JSON.stringify({
          name: 'simple',
          display_name: 'Simple',
        }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.name).toBe('simple');
      expect(json.icon).toBeNull();
      expect(json.color).toBeNull();
    });
  });
});
