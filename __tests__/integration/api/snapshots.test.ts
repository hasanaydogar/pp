// Mock dependencies - must be before any imports that use them
jest.mock('@/lib/supabase/server');

import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

describe('Portfolio Snapshots API Tests', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockPortfolioId = 'portfolio-456';

  // Import route handlers dynamically to ensure mocks are applied
  let GET: typeof import('@/app/api/portfolios/[id]/snapshots/route').GET;
  let POST: typeof import('@/app/api/portfolios/[id]/snapshots/route').POST;
  let PATCH: typeof import('@/app/api/portfolios/[id]/snapshots/route').PATCH;

  beforeAll(async () => {
    const routeModule = await import('@/app/api/portfolios/[id]/snapshots/route');
    GET = routeModule.GET;
    POST = routeModule.POST;
    PATCH = routeModule.PATCH;
  });

  // Helper to create mock request
  const createMockRequest = (url: string, options: RequestInit = {}) => {
    return new NextRequest(url, options);
  };

  // Helper to create params promise
  const createParams = (id: string) => Promise.resolve({ id });

  // Reusable mock setup functions
  const createAuthMock = (user: typeof mockUser | null) => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user },
        error: user ? null : { message: 'Unauthorized' },
      }),
    },
  });

  const createPortfolioMock = (exists: boolean) => ({
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: exists ? { id: mockPortfolioId } : null,
              error: exists ? null : { message: 'Not found' },
            }),
          }),
        }),
      }),
    }),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/portfolios/[id]/snapshots', () => {
    it('should return 401 for unauthenticated user', async () => {
      const mockSupabase = createAuthMock(null);
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('http://localhost/api/portfolios/123/snapshots');
      const response = await GET(request, { params: createParams('123') });

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toBe('Unauthorized');
    });

    it('should return 404 for non-existent portfolio', async () => {
      const mockSupabase = {
        ...createAuthMock(mockUser),
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Not found' },
                }),
              }),
            }),
          }),
        }),
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('http://localhost/api/portfolios/invalid/snapshots');
      const response = await GET(request, { params: createParams('invalid') });

      expect(response.status).toBe(404);
      const json = await response.json();
      expect(json.error).toBe('Portfolio not found');
    });

    it('should return snapshots with default period (30d)', async () => {
      const mockSnapshots = [
        {
          id: 'snap-1',
          portfolio_id: mockPortfolioId,
          snapshot_date: '2026-01-15',
          total_value: 10000,
          assets_value: 8000,
          cash_value: 2000,
          daily_change: 100,
          daily_change_percent: 1.01,
        },
        {
          id: 'snap-2',
          portfolio_id: mockPortfolioId,
          snapshot_date: '2026-01-16',
          total_value: 10200,
          assets_value: 8200,
          cash_value: 2000,
          daily_change: 200,
          daily_change_percent: 2.0,
        },
      ];

      const result = { data: mockSnapshots, error: null };
      const queryResult = {
        gte: jest.fn().mockReturnValue(Promise.resolve(result)),
        then: (onFulfill: (v: typeof result) => void, onReject?: (e: Error) => void) =>
          Promise.resolve(result).then(onFulfill, onReject),
        catch: (onReject: (e: Error) => void) => Promise.resolve(result).catch(onReject),
      };

      const mockSupabase = {
        ...createAuthMock(mockUser),
        from: jest.fn().mockImplementation((table: string) => {
          if (table === 'portfolios') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: { id: mockPortfolioId },
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === 'portfolio_snapshots') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  order: jest.fn().mockReturnValue({
                    limit: jest.fn().mockReturnValue(queryResult),
                  }),
                }),
              }),
            };
          }
          return {};
        }),
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('http://localhost:3000/api/portfolios/123/snapshots');
      const response = await GET(request, { params: createParams(mockPortfolioId) });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.data).toEqual(mockSnapshots);
    });

    it('should handle different period parameters', async () => {
      const periods = ['7d', '30d', '90d', '365d', 'all'];

      for (const period of periods) {
        // Create a thenable object that also has gte method
        const result = { data: [], error: null };
        const queryResult = {
          gte: jest.fn().mockReturnValue(Promise.resolve(result)),
          then: (onFulfill: (v: typeof result) => void, onReject?: (e: Error) => void) =>
            Promise.resolve(result).then(onFulfill, onReject),
          catch: (onReject: (e: Error) => void) => Promise.resolve(result).catch(onReject),
        };

        const mockSupabase = {
          ...createAuthMock(mockUser),
          from: jest.fn().mockImplementation((table: string) => {
            if (table === 'portfolios') {
              return {
                select: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                      single: jest.fn().mockResolvedValue({
                        data: { id: mockPortfolioId },
                        error: null,
                      }),
                    }),
                  }),
                }),
              };
            }
            if (table === 'portfolio_snapshots') {
              return {
                select: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    order: jest.fn().mockReturnValue({
                      limit: jest.fn().mockReturnValue(queryResult),
                    }),
                  }),
                }),
              };
            }
            return {};
          }),
        };
        (createClient as jest.Mock).mockResolvedValue(mockSupabase);

        const request = createMockRequest(`http://localhost:3000/api/portfolios/123/snapshots?period=${period}`);
        const response = await GET(request, { params: createParams(mockPortfolioId) });

        expect(response.status).toBe(200);
      }
    });

    it('should handle custom limit parameter', async () => {
      const result = { data: [], error: null };
      const queryResult = {
        gte: jest.fn().mockReturnValue(Promise.resolve(result)),
        then: (onFulfill: (v: typeof result) => void, onReject?: (e: Error) => void) =>
          Promise.resolve(result).then(onFulfill, onReject),
        catch: (onReject: (e: Error) => void) => Promise.resolve(result).catch(onReject),
      };

      const mockSupabase = {
        ...createAuthMock(mockUser),
        from: jest.fn().mockImplementation((table: string) => {
          if (table === 'portfolios') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: { id: mockPortfolioId },
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === 'portfolio_snapshots') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  order: jest.fn().mockReturnValue({
                    limit: jest.fn().mockReturnValue(queryResult),
                  }),
                }),
              }),
            };
          }
          return {};
        }),
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('http://localhost:3000/api/portfolios/123/snapshots?limit=50');
      const response = await GET(request, { params: createParams(mockPortfolioId) });

      expect(response.status).toBe(200);
    });

    it('should return 500 on database error', async () => {
      const result = { data: null, error: { message: 'Database error' } };
      const queryResult = {
        gte: jest.fn().mockReturnValue(Promise.resolve(result)),
        then: (onFulfill: (v: typeof result) => void, onReject?: (e: Error) => void) =>
          Promise.resolve(result).then(onFulfill, onReject),
        catch: (onReject: (e: Error) => void) => Promise.resolve(result).catch(onReject),
      };

      const mockSupabase = {
        ...createAuthMock(mockUser),
        from: jest.fn().mockImplementation((table: string) => {
          if (table === 'portfolios') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: { id: mockPortfolioId },
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === 'portfolio_snapshots') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  order: jest.fn().mockReturnValue({
                    limit: jest.fn().mockReturnValue(queryResult),
                  }),
                }),
              }),
            };
          }
          return {};
        }),
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('http://localhost:3000/api/portfolios/123/snapshots');
      const response = await GET(request, { params: createParams(mockPortfolioId) });

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe('Failed to fetch snapshots');
    });

    it('should handle exception during processing', async () => {
      const mockSupabase = {
        ...createAuthMock(mockUser),
        from: jest.fn().mockImplementation(() => {
          throw new Error('Unexpected error');
        }),
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('http://localhost:3000/api/portfolios/123/snapshots');
      const response = await GET(request, { params: createParams(mockPortfolioId) });

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe('Internal server error');
    });
  });

  describe('POST /api/portfolios/[id]/snapshots', () => {
    const validSnapshotData = {
      total_value: 10000,
      assets_value: 8000,
      cash_value: 2000,
    };

    it('should return 401 for unauthenticated user', async () => {
      const mockSupabase = createAuthMock(null);
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('http://localhost/api/portfolios/123/snapshots', {
        method: 'POST',
        body: JSON.stringify(validSnapshotData),
      });
      const response = await POST(request, { params: createParams('123') });

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent portfolio', async () => {
      const mockSupabase = {
        ...createAuthMock(mockUser),
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Not found' },
                }),
              }),
            }),
          }),
        }),
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('http://localhost/api/portfolios/invalid/snapshots', {
        method: 'POST',
        body: JSON.stringify(validSnapshotData),
      });
      const response = await POST(request, { params: createParams('invalid') });

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid input data', async () => {
      const mockSupabase = {
        ...createAuthMock(mockUser),
        from: jest.fn().mockImplementation((table: string) => {
          if (table === 'portfolios') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: { id: mockPortfolioId },
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          return {};
        }),
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const invalidData = { total_value: 'not-a-number' };
      const request = createMockRequest('http://localhost/api/portfolios/123/snapshots', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });
      const response = await POST(request, { params: createParams(mockPortfolioId) });

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe('Validation failed');
    });

    it('should create new snapshot when no existing snapshot for today', async () => {
      const newSnapshot = {
        id: 'new-snap',
        portfolio_id: mockPortfolioId,
        snapshot_date: '2026-01-21',
        total_value: 10000,
        assets_value: 8000,
        cash_value: 2000,
        daily_change: 500,
        daily_change_percent: 5.26,
      };

      const previousSnapshot = {
        total_value: 9500,
      };

      const mockSupabase = {
        ...createAuthMock(mockUser),
        from: jest.fn().mockImplementation((table: string) => {
          if (table === 'portfolios') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: { id: mockPortfolioId },
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === 'portfolio_snapshots') {
            return {
              select: jest.fn().mockImplementation((cols: string) => {
                // Check for existing today's snapshot
                if (cols === 'id') {
                  return {
                    eq: jest.fn().mockReturnValue({
                      eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                          data: null, // No existing snapshot
                          error: { code: 'PGRST116' },
                        }),
                      }),
                    }),
                  };
                }
                // Get previous snapshot
                if (cols === 'total_value') {
                  return {
                    eq: jest.fn().mockReturnValue({
                      lt: jest.fn().mockReturnValue({
                        order: jest.fn().mockReturnValue({
                          limit: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({
                              data: previousSnapshot,
                              error: null,
                            }),
                          }),
                        }),
                      }),
                    }),
                  };
                }
                return {};
              }),
              insert: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: newSnapshot,
                    error: null,
                  }),
                }),
              }),
            };
          }
          return {};
        }),
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('http://localhost/api/portfolios/123/snapshots', {
        method: 'POST',
        body: JSON.stringify(validSnapshotData),
      });
      const response = await POST(request, { params: createParams(mockPortfolioId) });

      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json.data).toBeDefined();
    });

    it('should update existing snapshot for today and recalculate daily_change', async () => {
      const existingSnapshot = { id: 'existing-snap' };
      const previousSnapshot = { total_value: 9500 };
      const updatedSnapshot = {
        id: 'existing-snap',
        portfolio_id: mockPortfolioId,
        snapshot_date: '2026-01-21',
        total_value: 10000,
        assets_value: 8000,
        cash_value: 2000,
        daily_change: 500, // 10000 - 9500
        daily_change_percent: 5.263157894736842, // (500/9500)*100
      };

      const mockSupabase = {
        ...createAuthMock(mockUser),
        from: jest.fn().mockImplementation((table: string) => {
          if (table === 'portfolios') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: { id: mockPortfolioId },
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === 'portfolio_snapshots') {
            return {
              select: jest.fn().mockImplementation((cols: string) => {
                if (cols === 'id') {
                  return {
                    eq: jest.fn().mockReturnValue({
                      eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                          data: existingSnapshot,
                          error: null,
                        }),
                      }),
                    }),
                  };
                }
                if (cols === 'total_value') {
                  return {
                    eq: jest.fn().mockReturnValue({
                      lt: jest.fn().mockReturnValue({
                        order: jest.fn().mockReturnValue({
                          limit: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({
                              data: previousSnapshot,
                              error: null,
                            }),
                          }),
                        }),
                      }),
                    }),
                  };
                }
                return {};
              }),
              update: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: updatedSnapshot,
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          return {};
        }),
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('http://localhost/api/portfolios/123/snapshots', {
        method: 'POST',
        body: JSON.stringify(validSnapshotData),
      });
      const response = await POST(request, { params: createParams(mockPortfolioId) });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.updated).toBe(true);
      expect(json.data.daily_change).toBe(500);
    });

    it('should set daily_change to 0 when no previous snapshot exists', async () => {
      const newSnapshot = {
        id: 'first-snap',
        portfolio_id: mockPortfolioId,
        snapshot_date: '2026-01-21',
        total_value: 10000,
        assets_value: 8000,
        cash_value: 2000,
        daily_change: 0,
        daily_change_percent: 0,
      };

      const mockSupabase = {
        ...createAuthMock(mockUser),
        from: jest.fn().mockImplementation((table: string) => {
          if (table === 'portfolios') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: { id: mockPortfolioId },
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === 'portfolio_snapshots') {
            return {
              select: jest.fn().mockImplementation((cols: string) => {
                if (cols === 'id') {
                  return {
                    eq: jest.fn().mockReturnValue({
                      eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                          data: null,
                          error: { code: 'PGRST116' },
                        }),
                      }),
                    }),
                  };
                }
                if (cols === 'total_value') {
                  return {
                    eq: jest.fn().mockReturnValue({
                      lt: jest.fn().mockReturnValue({
                        order: jest.fn().mockReturnValue({
                          limit: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({
                              data: null, // No previous snapshot
                              error: { code: 'PGRST116' },
                            }),
                          }),
                        }),
                      }),
                    }),
                  };
                }
                return {};
              }),
              insert: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: newSnapshot,
                    error: null,
                  }),
                }),
              }),
            };
          }
          return {};
        }),
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('http://localhost/api/portfolios/123/snapshots', {
        method: 'POST',
        body: JSON.stringify(validSnapshotData),
      });
      const response = await POST(request, { params: createParams(mockPortfolioId) });

      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json.data.daily_change).toBe(0);
      expect(json.data.daily_change_percent).toBe(0);
    });

    it('should handle daily_change_percent calculation when previous value is 0', async () => {
      const previousSnapshot = { total_value: 0 };

      const mockSupabase = {
        ...createAuthMock(mockUser),
        from: jest.fn().mockImplementation((table: string) => {
          if (table === 'portfolios') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: { id: mockPortfolioId },
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === 'portfolio_snapshots') {
            return {
              select: jest.fn().mockImplementation((cols: string) => {
                if (cols === 'id') {
                  return {
                    eq: jest.fn().mockReturnValue({
                      eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                          data: null,
                          error: { code: 'PGRST116' },
                        }),
                      }),
                    }),
                  };
                }
                if (cols === 'total_value') {
                  return {
                    eq: jest.fn().mockReturnValue({
                      lt: jest.fn().mockReturnValue({
                        order: jest.fn().mockReturnValue({
                          limit: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({
                              data: previousSnapshot,
                              error: null,
                            }),
                          }),
                        }),
                      }),
                    }),
                  };
                }
                return {};
              }),
              insert: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: {
                      id: 'snap',
                      total_value: 10000,
                      daily_change: 10000,
                      daily_change_percent: 0, // Should be 0 when previous is 0 to avoid division by zero
                    },
                    error: null,
                  }),
                }),
              }),
            };
          }
          return {};
        }),
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('http://localhost/api/portfolios/123/snapshots', {
        method: 'POST',
        body: JSON.stringify(validSnapshotData),
      });
      const response = await POST(request, { params: createParams(mockPortfolioId) });

      expect(response.status).toBe(201);
    });

    it('should return 500 on insert error', async () => {
      const mockSupabase = {
        ...createAuthMock(mockUser),
        from: jest.fn().mockImplementation((table: string) => {
          if (table === 'portfolios') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: { id: mockPortfolioId },
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === 'portfolio_snapshots') {
            return {
              select: jest.fn().mockImplementation((cols: string) => {
                if (cols === 'id') {
                  return {
                    eq: jest.fn().mockReturnValue({
                      eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                          data: null,
                          error: { code: 'PGRST116' },
                        }),
                      }),
                    }),
                  };
                }
                if (cols === 'total_value') {
                  return {
                    eq: jest.fn().mockReturnValue({
                      lt: jest.fn().mockReturnValue({
                        order: jest.fn().mockReturnValue({
                          limit: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({
                              data: null,
                              error: null,
                            }),
                          }),
                        }),
                      }),
                    }),
                  };
                }
                return {};
              }),
              insert: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Insert failed' },
                  }),
                }),
              }),
            };
          }
          return {};
        }),
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('http://localhost/api/portfolios/123/snapshots', {
        method: 'POST',
        body: JSON.stringify(validSnapshotData),
      });
      const response = await POST(request, { params: createParams(mockPortfolioId) });

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe('Failed to create snapshot');
    });

    it('should update existing snapshot with zero daily_change when no previous snapshot', async () => {
      const existingSnapshot = { id: 'existing-snap' };
      const updatedSnapshot = {
        id: 'existing-snap',
        portfolio_id: mockPortfolioId,
        snapshot_date: '2026-01-21',
        total_value: 10000,
        assets_value: 8000,
        cash_value: 2000,
        daily_change: 0,
        daily_change_percent: 0,
      };

      const mockSupabase = {
        ...createAuthMock(mockUser),
        from: jest.fn().mockImplementation((table: string) => {
          if (table === 'portfolios') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: { id: mockPortfolioId },
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === 'portfolio_snapshots') {
            return {
              select: jest.fn().mockImplementation((cols: string) => {
                if (cols === 'id') {
                  return {
                    eq: jest.fn().mockReturnValue({
                      eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                          data: existingSnapshot,
                          error: null,
                        }),
                      }),
                    }),
                  };
                }
                if (cols === 'total_value') {
                  return {
                    eq: jest.fn().mockReturnValue({
                      lt: jest.fn().mockReturnValue({
                        order: jest.fn().mockReturnValue({
                          limit: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({
                              data: null, // No previous snapshot
                              error: { code: 'PGRST116' },
                            }),
                          }),
                        }),
                      }),
                    }),
                  };
                }
                return {};
              }),
              update: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: updatedSnapshot,
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          return {};
        }),
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('http://localhost:3000/api/portfolios/123/snapshots', {
        method: 'POST',
        body: JSON.stringify(validSnapshotData),
      });
      const response = await POST(request, { params: createParams(mockPortfolioId) });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.data.daily_change).toBe(0);
    });

    it('should update existing snapshot with zero percent when previous value is zero', async () => {
      const existingSnapshot = { id: 'existing-snap' };
      const previousSnapshot = { total_value: 0 };
      const updatedSnapshot = {
        id: 'existing-snap',
        portfolio_id: mockPortfolioId,
        snapshot_date: '2026-01-21',
        total_value: 10000,
        assets_value: 8000,
        cash_value: 2000,
        daily_change: 10000, // 10000 - 0
        daily_change_percent: 0, // Can't divide by zero
      };

      const mockSupabase = {
        ...createAuthMock(mockUser),
        from: jest.fn().mockImplementation((table: string) => {
          if (table === 'portfolios') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: { id: mockPortfolioId },
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === 'portfolio_snapshots') {
            return {
              select: jest.fn().mockImplementation((cols: string) => {
                if (cols === 'id') {
                  return {
                    eq: jest.fn().mockReturnValue({
                      eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                          data: existingSnapshot,
                          error: null,
                        }),
                      }),
                    }),
                  };
                }
                if (cols === 'total_value') {
                  return {
                    eq: jest.fn().mockReturnValue({
                      lt: jest.fn().mockReturnValue({
                        order: jest.fn().mockReturnValue({
                          limit: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({
                              data: previousSnapshot,
                              error: null,
                            }),
                          }),
                        }),
                      }),
                    }),
                  };
                }
                return {};
              }),
              update: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: updatedSnapshot,
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          return {};
        }),
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('http://localhost:3000/api/portfolios/123/snapshots', {
        method: 'POST',
        body: JSON.stringify(validSnapshotData),
      });
      const response = await POST(request, { params: createParams(mockPortfolioId) });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.data.daily_change).toBe(10000);
      expect(json.data.daily_change_percent).toBe(0);
    });

    it('should return 500 on update error', async () => {
      const existingSnapshot = { id: 'existing-snap' };

      const mockSupabase = {
        ...createAuthMock(mockUser),
        from: jest.fn().mockImplementation((table: string) => {
          if (table === 'portfolios') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: { id: mockPortfolioId },
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === 'portfolio_snapshots') {
            return {
              select: jest.fn().mockImplementation((cols: string) => {
                if (cols === 'id') {
                  return {
                    eq: jest.fn().mockReturnValue({
                      eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                          data: existingSnapshot,
                          error: null,
                        }),
                      }),
                    }),
                  };
                }
                if (cols === 'total_value') {
                  return {
                    eq: jest.fn().mockReturnValue({
                      lt: jest.fn().mockReturnValue({
                        order: jest.fn().mockReturnValue({
                          limit: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({
                              data: { total_value: 9500 },
                              error: null,
                            }),
                          }),
                        }),
                      }),
                    }),
                  };
                }
                return {};
              }),
              update: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: null,
                      error: { message: 'Update failed' },
                    }),
                  }),
                }),
              }),
            };
          }
          return {};
        }),
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('http://localhost/api/portfolios/123/snapshots', {
        method: 'POST',
        body: JSON.stringify(validSnapshotData),
      });
      const response = await POST(request, { params: createParams(mockPortfolioId) });

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe('Failed to update snapshot');
    });

    it('should handle exception during processing', async () => {
      const mockSupabase = {
        ...createAuthMock(mockUser),
        from: jest.fn().mockImplementation(() => {
          throw new Error('Unexpected error');
        }),
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('http://localhost/api/portfolios/123/snapshots', {
        method: 'POST',
        body: JSON.stringify(validSnapshotData),
      });
      const response = await POST(request, { params: createParams(mockPortfolioId) });

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe('Internal server error');
    });
  });

  describe('PATCH /api/portfolios/[id]/snapshots', () => {
    it('should return 401 for unauthenticated user', async () => {
      const mockSupabase = createAuthMock(null);
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('http://localhost/api/portfolios/123/snapshots', {
        method: 'PATCH',
      });
      const response = await PATCH(request, { params: createParams('123') });

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent portfolio', async () => {
      const mockSupabase = {
        ...createAuthMock(mockUser),
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Not found' },
                }),
              }),
            }),
          }),
        }),
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('http://localhost/api/portfolios/invalid/snapshots', {
        method: 'PATCH',
      });
      const response = await PATCH(request, { params: createParams('invalid') });

      expect(response.status).toBe(404);
    });

    it('should return message when less than 2 snapshots exist', async () => {
      const mockSupabase = {
        ...createAuthMock(mockUser),
        from: jest.fn().mockImplementation((table: string) => {
          if (table === 'portfolios') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: { id: mockPortfolioId },
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === 'portfolio_snapshots') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  order: jest.fn().mockResolvedValue({
                    data: [{ id: 'snap-1', total_value: 10000 }], // Only 1 snapshot
                    error: null,
                  }),
                }),
              }),
            };
          }
          return {};
        }),
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('http://localhost/api/portfolios/123/snapshots', {
        method: 'PATCH',
      });
      const response = await PATCH(request, { params: createParams(mockPortfolioId) });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.message).toBe('Not enough snapshots to recalculate');
      expect(json.updated).toBe(0);
    });

    it('should recalculate daily changes for all snapshots', async () => {
      const snapshots = [
        { id: 'snap-1', snapshot_date: '2026-01-19', total_value: 10000 },
        { id: 'snap-2', snapshot_date: '2026-01-20', total_value: 10500 },
        { id: 'snap-3', snapshot_date: '2026-01-21', total_value: 10200 },
      ];

      let updateCalls = 0;

      const mockSupabase = {
        ...createAuthMock(mockUser),
        from: jest.fn().mockImplementation((table: string) => {
          if (table === 'portfolios') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: { id: mockPortfolioId },
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === 'portfolio_snapshots') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  order: jest.fn().mockResolvedValue({
                    data: snapshots,
                    error: null,
                  }),
                }),
              }),
              update: jest.fn().mockReturnValue({
                eq: jest.fn().mockImplementation(() => {
                  updateCalls++;
                  return Promise.resolve({ error: null });
                }),
              }),
            };
          }
          return {};
        }),
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('http://localhost/api/portfolios/123/snapshots', {
        method: 'PATCH',
      });
      const response = await PATCH(request, { params: createParams(mockPortfolioId) });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.message).toBe('Daily changes recalculated');
      expect(json.updated).toBe(2); // 2 snapshots updated (skip first one)
      expect(json.total).toBe(3);
    });

    it('should handle update errors gracefully and continue', async () => {
      const snapshots = [
        { id: 'snap-1', snapshot_date: '2026-01-19', total_value: 10000 },
        { id: 'snap-2', snapshot_date: '2026-01-20', total_value: 10500 },
        { id: 'snap-3', snapshot_date: '2026-01-21', total_value: 10200 },
      ];

      let updateCallIndex = 0;

      const mockSupabase = {
        ...createAuthMock(mockUser),
        from: jest.fn().mockImplementation((table: string) => {
          if (table === 'portfolios') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: { id: mockPortfolioId },
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === 'portfolio_snapshots') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  order: jest.fn().mockResolvedValue({
                    data: snapshots,
                    error: null,
                  }),
                }),
              }),
              update: jest.fn().mockReturnValue({
                eq: jest.fn().mockImplementation(() => {
                  updateCallIndex++;
                  // First update fails, second succeeds
                  if (updateCallIndex === 1) {
                    return Promise.resolve({ error: { message: 'Update failed' } });
                  }
                  return Promise.resolve({ error: null });
                }),
              }),
            };
          }
          return {};
        }),
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('http://localhost/api/portfolios/123/snapshots', {
        method: 'PATCH',
      });
      const response = await PATCH(request, { params: createParams(mockPortfolioId) });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.updated).toBe(1); // Only 1 successful update
    });

    it('should return 500 on fetch snapshots error', async () => {
      const mockSupabase = {
        ...createAuthMock(mockUser),
        from: jest.fn().mockImplementation((table: string) => {
          if (table === 'portfolios') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: { id: mockPortfolioId },
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === 'portfolio_snapshots') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  order: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Database error' },
                  }),
                }),
              }),
            };
          }
          return {};
        }),
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('http://localhost/api/portfolios/123/snapshots', {
        method: 'PATCH',
      });
      const response = await PATCH(request, { params: createParams(mockPortfolioId) });

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe('Failed to fetch snapshots');
    });

    it('should handle exception during processing', async () => {
      const mockSupabase = {
        ...createAuthMock(mockUser),
        from: jest.fn().mockImplementation(() => {
          throw new Error('Unexpected error');
        }),
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('http://localhost/api/portfolios/123/snapshots', {
        method: 'PATCH',
      });
      const response = await PATCH(request, { params: createParams(mockPortfolioId) });

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe('Internal server error');
    });

    it('should handle previous value of zero in PATCH calculation', async () => {
      const snapshots = [
        { id: 'snap-1', snapshot_date: '2026-01-19', total_value: 0 }, // Zero value
        { id: 'snap-2', snapshot_date: '2026-01-20', total_value: 10000 },
      ];

      const updateCalls: Array<{ daily_change: number; daily_change_percent: number }> = [];

      const mockSupabase = {
        ...createAuthMock(mockUser),
        from: jest.fn().mockImplementation((table: string) => {
          if (table === 'portfolios') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: { id: mockPortfolioId },
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === 'portfolio_snapshots') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  order: jest.fn().mockResolvedValue({
                    data: snapshots,
                    error: null,
                  }),
                }),
              }),
              update: jest.fn().mockImplementation((data) => {
                updateCalls.push(data);
                return {
                  eq: jest.fn().mockResolvedValue({ error: null }),
                };
              }),
            };
          }
          return {};
        }),
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('http://localhost:3000/api/portfolios/123/snapshots', {
        method: 'PATCH',
      });
      const response = await PATCH(request, { params: createParams(mockPortfolioId) });

      expect(response.status).toBe(200);
      // When previous value is 0, percent should be 0 (avoid division by zero)
      expect(updateCalls[0].daily_change).toBe(10000);
      expect(updateCalls[0].daily_change_percent).toBe(0);
    });

    it('should calculate correct daily change values', async () => {
      const snapshots = [
        { id: 'snap-1', snapshot_date: '2026-01-19', total_value: 10000 },
        { id: 'snap-2', snapshot_date: '2026-01-20', total_value: 11000 }, // +1000, +10%
        { id: 'snap-3', snapshot_date: '2026-01-21', total_value: 10500 }, // -500, -4.545%
      ];

      const updateCalls: Array<{ daily_change: number; daily_change_percent: number }> = [];

      const mockSupabase = {
        ...createAuthMock(mockUser),
        from: jest.fn().mockImplementation((table: string) => {
          if (table === 'portfolios') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: { id: mockPortfolioId },
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === 'portfolio_snapshots') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  order: jest.fn().mockResolvedValue({
                    data: snapshots,
                    error: null,
                  }),
                }),
              }),
              update: jest.fn().mockImplementation((data) => {
                updateCalls.push(data);
                return {
                  eq: jest.fn().mockResolvedValue({ error: null }),
                };
              }),
            };
          }
          return {};
        }),
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = createMockRequest('http://localhost/api/portfolios/123/snapshots', {
        method: 'PATCH',
      });
      await PATCH(request, { params: createParams(mockPortfolioId) });

      // Verify calculations
      expect(updateCalls[0].daily_change).toBe(1000); // 11000 - 10000
      expect(updateCalls[0].daily_change_percent).toBe(10); // (1000/10000)*100

      expect(updateCalls[1].daily_change).toBe(-500); // 10500 - 11000
      expect(updateCalls[1].daily_change_percent).toBeCloseTo(-4.545454545454546); // (-500/11000)*100
    });
  });
});
