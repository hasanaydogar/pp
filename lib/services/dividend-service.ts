/**
 * Dividend Service
 * Fetches dividend calendar data from Yahoo Finance
 */

import { mapSymbolForYahoo } from '@/lib/utils/symbol-mapper';

// ============================================================================
// TYPES
// ============================================================================

export interface DividendInfo {
  symbol: string;
  yahooSymbol: string;
  exDividendDate: string | null;
  paymentDate: string | null;
  dividendRate: number; // Annual dividend rate
  dividendYield: number; // Dividend yield (%)
  forwardDividend: number; // Forward annual dividend
  lastDividendValue: number; // Last dividend per share
  lastDividendDate: string | null;
  currency: string;
}

export type DividendResult = {
  success: true;
  data: DividendInfo;
} | {
  success: false;
  error: {
    symbol: string;
    error: string;
    code: 'NOT_FOUND' | 'API_ERROR' | 'TIMEOUT' | 'NO_DIVIDEND_DATA';
  };
};

// ============================================================================
// CACHE
// ============================================================================

const dividendCache = new Map<string, { data: DividendInfo; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Fetch dividend info from Yahoo Finance
 * Uses quoteSummary endpoint with calendarEvents and summaryDetail modules
 */
export async function fetchDividendInfo(
  symbol: string,
  currency: string
): Promise<DividendResult> {
  const yahooSymbol = mapSymbolForYahoo(symbol, currency);
  const cacheKey = `dividend:${yahooSymbol}`;

  // Check cache first
  const cached = dividendCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { success: true, data: cached.data };
  }

  try {
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(yahooSymbol)}?modules=calendarEvents,summaryDetail,defaultKeyStatistics`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/json',
      },
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`[DividendService] ${yahooSymbol}: HTTP ${response.status}`);
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
    
    // Check for Yahoo Finance error response
    if (data?.finance?.error) {
      console.error(`[DividendService] ${yahooSymbol}: Yahoo error - ${data.finance.error.description}`);
      return {
        success: false,
        error: {
          symbol: yahooSymbol,
          error: data.finance.error.description || 'Yahoo Finance error',
          code: 'API_ERROR',
        },
      };
    }
    
    const quoteSummary = data?.quoteSummary?.result?.[0];

    if (!quoteSummary) {
      return {
        success: false,
        error: {
          symbol: yahooSymbol,
          error: 'Invalid response structure',
          code: 'API_ERROR',
        },
      };
    }

    const calendarEvents = quoteSummary.calendarEvents || {};
    const summaryDetail = quoteSummary.summaryDetail || {};
    const defaultKeyStatistics = quoteSummary.defaultKeyStatistics || {};

    // Parse dividend info
    const dividendInfo: DividendInfo = {
      symbol,
      yahooSymbol,
      exDividendDate: parseYahooDate(calendarEvents.exDividendDate),
      paymentDate: parseYahooDate(calendarEvents.dividendDate),
      dividendRate: summaryDetail.dividendRate?.raw ?? 0,
      dividendYield: (summaryDetail.dividendYield?.raw ?? 0) * 100, // Convert to percentage
      forwardDividend: defaultKeyStatistics.forwardAnnualDividendRate?.raw ?? summaryDetail.dividendRate?.raw ?? 0,
      lastDividendValue: defaultKeyStatistics.lastDividendValue?.raw ?? summaryDetail.trailingAnnualDividendRate?.raw ?? 0,
      lastDividendDate: parseYahooDate(defaultKeyStatistics.lastDividendDate),
      currency: summaryDetail.currency ?? currency,
    };

    // Update cache
    dividendCache.set(cacheKey, { data: dividendInfo, timestamp: Date.now() });

    return { success: true, data: dividendInfo };
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
 * Fetch dividend info for multiple symbols in parallel
 */
export async function fetchMultipleDividendInfo(
  assets: Array<{ symbol: string; currency: string; assetId: string; quantity: number }>,
  batchSize: number = 5
): Promise<Map<string, DividendInfo & { assetId: string; quantity: number }>> {
  const results = new Map<string, DividendInfo & { assetId: string; quantity: number }>();

  // Process in batches to avoid rate limiting
  for (let i = 0; i < assets.length; i += batchSize) {
    const batch = assets.slice(i, i + batchSize);
    
    const batchResults = await Promise.allSettled(
      batch.map(async (asset) => {
        const result = await fetchDividendInfo(asset.symbol, asset.currency);
        return { asset, result };
      })
    );

    for (const settledResult of batchResults) {
      if (settledResult.status === 'fulfilled') {
        const { asset, result } = settledResult.value;
        if (result.success) {
          results.set(asset.symbol, {
            ...result.data,
            assetId: asset.assetId,
            quantity: asset.quantity,
          });
        }
      }
    }
  }

  return results;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Parse Yahoo Finance date format
 * Yahoo returns { raw: timestamp, fmt: "YYYY-MM-DD" }
 */
function parseYahooDate(dateObj: { raw?: number; fmt?: string } | undefined): string | null {
  if (!dateObj) return null;
  
  if (dateObj.fmt) {
    return dateObj.fmt;
  }
  
  if (dateObj.raw) {
    const date = new Date(dateObj.raw * 1000);
    return date.toISOString().split('T')[0];
  }
  
  return null;
}

/**
 * Clear dividend cache
 */
export function clearDividendCache(): void {
  dividendCache.clear();
}

/**
 * Get dividend cache stats
 */
export function getDividendCacheStats(): { size: number; keys: string[] } {
  return {
    size: dividendCache.size,
    keys: Array.from(dividendCache.keys()),
  };
}
