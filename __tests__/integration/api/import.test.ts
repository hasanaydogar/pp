import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/actions';

jest.mock('@/lib/supabase/server');
jest.mock('@/lib/auth/actions');

// Generate a valid UUID for tests
const generateUUID = () => 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

describe('POST /api/portfolios/[id]/assets/import', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const portfolioId = generateUUID();

  let POST: typeof import('@/app/api/portfolios/[id]/assets/import/route').POST;

  beforeAll(async () => {
    const module = await import('@/app/api/portfolios/[id]/assets/import/route');
    POST = module.POST;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
  });

  it('should import multiple assets successfully', async () => {
    const mockAsset1 = { id: 'asset-1', symbol: 'AGESA' };
    const mockAsset2 = { id: 'asset-2', symbol: 'ARCLK' };

    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      single: jest.fn()
        .mockResolvedValueOnce({ data: { id: portfolioId }, error: null }) // portfolio check
        .mockResolvedValueOnce({ data: mockAsset1, error: null }) // first asset
        .mockResolvedValueOnce({ data: mockAsset2, error: null }), // second asset
    };

    // Handle transaction inserts
    mockSupabase.insert.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      single: mockSupabase.single,
    }));

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);

    const request = new Request(
      `http://localhost/api/portfolios/${portfolioId}/assets/import`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assets: [
            { symbol: 'AGESA', quantity: 750, averageBuyPrice: 214.6 },
            { symbol: 'ARCLK', quantity: 800, averageBuyPrice: 44.09 },
          ],
        }),
      }
    );

    const response = await POST(request, {
      params: Promise.resolve({ id: portfolioId }),
    });
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.imported).toBe(2);
    expect(json.failed).toBe(0);
  });

  it('should return 401 for unauthenticated user', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue(null);

    const request = new Request(
      `http://localhost/api/portfolios/${portfolioId}/assets/import`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assets: [] }),
      }
    );

    const response = await POST(request, {
      params: Promise.resolve({ id: portfolioId }),
    });

    expect(response.status).toBe(401);
  });

  it('should return 400 for empty assets array', async () => {
    const request = new Request(
      `http://localhost/api/portfolios/${portfolioId}/assets/import`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assets: [] }),
      }
    );

    const response = await POST(request, {
      params: Promise.resolve({ id: portfolioId }),
    });
    const json = await response.json();

    expect(response.status).toBe(400);
    // Error response may have 'message' or 'error' field
    const errorMessage = json.message || json.error || '';
    expect(errorMessage).toContain('No assets provided');
  });

  it('should return 400 for invalid portfolio ID', async () => {
    const request = new Request(
      `http://localhost/api/portfolios/invalid-id/assets/import`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assets: [{ symbol: 'AGESA', quantity: 750, averageBuyPrice: 214.6 }],
        }),
      }
    );

    const response = await POST(request, {
      params: Promise.resolve({ id: 'invalid-id' }),
    });

    expect(response.status).toBe(400);
  });

  it('should handle partial failures', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      single: jest.fn()
        .mockResolvedValueOnce({ data: { id: portfolioId }, error: null }) // portfolio check
        .mockResolvedValueOnce({ data: { id: 'asset-1', symbol: 'AGESA' }, error: null }) // first asset success
        .mockResolvedValueOnce({ data: null, error: { code: '23505', message: 'Duplicate' } }), // second asset fails
    };

    mockSupabase.insert.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      single: mockSupabase.single,
    }));

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);

    const request = new Request(
      `http://localhost/api/portfolios/${portfolioId}/assets/import`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assets: [
            { symbol: 'AGESA', quantity: 750, averageBuyPrice: 214.6 },
            { symbol: 'ARCLK', quantity: 800, averageBuyPrice: 44.09 },
          ],
        }),
      }
    );

    const response = await POST(request, {
      params: Promise.resolve({ id: portfolioId }),
    });
    const json = await response.json();

    expect(response.status).toBe(201); // Still 201 because some succeeded
    expect(json.imported).toBe(1);
    expect(json.failed).toBe(1);
    expect(json.results[1].error).toContain('already exists');
  });

  it('should validate asset data', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: portfolioId }, error: null }),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);

    const request = new Request(
      `http://localhost/api/portfolios/${portfolioId}/assets/import`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assets: [
            { symbol: '', quantity: 750, averageBuyPrice: 214.6 }, // missing symbol
            { symbol: 'AGESA', quantity: -10, averageBuyPrice: 214.6 }, // negative quantity
            { symbol: 'ARCLK', quantity: 800, averageBuyPrice: -5 }, // negative price
          ],
        }),
      }
    );

    const response = await POST(request, {
      params: Promise.resolve({ id: portfolioId }),
    });
    const json = await response.json();

    expect(response.status).toBe(400); // All failed
    expect(json.failed).toBe(3);
    expect(json.imported).toBe(0);
    expect(json.results[0].error).toContain('Symbol');
    expect(json.results[1].error).toContain('quantity');
    expect(json.results[2].error).toContain('price');
  });
});
