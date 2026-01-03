/**
 * Price Service
 * Fetches live prices from Yahoo Finance with caching
 */

import { LivePrice, PriceResult } from '@/lib/types/price';
import { mapSymbolForYahoo } from '@/lib/utils/symbol-mapper';

// In-memory cache
const priceCache = new Map<string, { data: LivePrice; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch live price from Yahoo Finance
 * @param symbol - Asset symbol (e.g., "THYAO", "AAPL")
 * @param currency - Asset currency (e.g., "TRY", "USD")
 * @returns PriceResult with live price or error
 */
export async function fetchLivePrice(
  symbol: string,
  currency: string
): Promise<PriceResult> {
  const yahooSymbol = mapSymbolForYahoo(symbol, currency);
  const cacheKey = yahooSymbol;

  // Check cache first
  const cached = priceCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { success: true, data: cached.data };
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1d`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/json',
      },
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        error: {
          symbol: yahooSymbol,
          error: `HTTP ${response.status}: ${response.statusText}`,
          code: response.status === 404 ? 'NOT_FOUND' : 'API_ERROR',
        },
      };
    }

    const data = await response.json();
    const result = data?.chart?.result?.[0];
    const meta = result?.meta;

    if (!meta || meta.regularMarketPrice === undefined) {
      return {
        success: false,
        error: {
          symbol: yahooSymbol,
          error: 'Invalid response structure',
          code: 'API_ERROR',
        },
      };
    }

    const regularMarketPrice = meta.regularMarketPrice ?? 0;
    const previousClose = meta.previousClose ?? meta.chartPreviousClose ?? regularMarketPrice;
    const change = regularMarketPrice - previousClose;
    const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

    const livePrice: LivePrice = {
      symbol: yahooSymbol,
      price: regularMarketPrice,
      previousClose,
      change,
      changePercent,
      currency: meta.currency ?? currency,
      marketState: meta.marketState ?? 'CLOSED',
      lastUpdated: new Date().toISOString(),
    };

    // Update cache
    priceCache.set(cacheKey, { data: livePrice, timestamp: Date.now() });

    return { success: true, data: livePrice };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: {
          symbol: yahooSymbol,
          error: 'Request timeout',
          code: 'TIMEOUT',
        },
      };
    }

    return {
      success: false,
      error: {
        symbol: yahooSymbol,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'API_ERROR',
      },
    };
  }
}

/**
 * Clear the price cache (useful for testing)
 */
export function clearPriceCache(): void {
  priceCache.clear();
}

/**
 * Get cache stats (for debugging)
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: priceCache.size,
    keys: Array.from(priceCache.keys()),
  };
}
