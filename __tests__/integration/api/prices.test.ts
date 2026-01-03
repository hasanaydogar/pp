import { fetchLivePrice, clearPriceCache } from '@/lib/services/price-service';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Price Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearPriceCache();
  });

  describe('fetchLivePrice', () => {
    it('should fetch and parse Yahoo Finance response correctly', async () => {
      const mockResponse = {
        chart: {
          result: [
            {
              meta: {
                regularMarketPrice: 236.0,
                previousClose: 230.5,
                currency: 'USD',
                marketState: 'REGULAR',
              },
            },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fetchLivePrice('AAPL', 'USD');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.symbol).toBe('AAPL');
        expect(result.data.price).toBe(236.0);
        expect(result.data.previousClose).toBe(230.5);
        expect(result.data.change).toBeCloseTo(5.5);
        expect(result.data.changePercent).toBeCloseTo(2.386, 2);
        expect(result.data.currency).toBe('USD');
        expect(result.data.marketState).toBe('REGULAR');
      }
    });

    it('should add .IS suffix for BIST stocks', async () => {
      const mockResponse = {
        chart: {
          result: [
            {
              meta: {
                regularMarketPrice: 285.5,
                previousClose: 280.0,
                currency: 'TRY',
                marketState: 'CLOSED',
              },
            },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fetchLivePrice('THYAO', 'TRY');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.symbol).toBe('THYAO.IS');
        expect(result.data.price).toBe(285.5);
        expect(result.data.currency).toBe('TRY');
      }

      // Check that fetch was called with .IS suffix
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('THYAO.IS'),
        expect.any(Object)
      );
    });

    it('should return cached data on subsequent calls', async () => {
      const mockResponse = {
        chart: {
          result: [
            {
              meta: {
                regularMarketPrice: 100.0,
                previousClose: 100.0,
                currency: 'USD',
                marketState: 'REGULAR',
              },
            },
          ],
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      // First call
      await fetchLivePrice('TEST', 'USD');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await fetchLivePrice('TEST', 'USD');
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1, using cache
    });

    it('should handle 404 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const result = await fetchLivePrice('INVALID', 'USD');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND');
      }
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchLivePrice('AAPL', 'USD');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('API_ERROR');
        expect(result.error.error).toBe('Network error');
      }
    });

    it('should handle invalid response structure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ chart: { result: [] } }),
      });

      const result = await fetchLivePrice('AAPL', 'USD');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('API_ERROR');
      }
    });
  });
});
