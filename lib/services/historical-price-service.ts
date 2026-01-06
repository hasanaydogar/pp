/**
 * Historical Price Service
 * Fetches historical prices from Yahoo Finance for backfill operations
 */

import { mapSymbolForYahoo } from '@/lib/utils/symbol-mapper';

export interface HistoricalPrice {
  date: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose: number;
}

export interface HistoricalPriceResult {
  success: boolean;
  data?: HistoricalPrice[];
  error?: string;
}

/**
 * Fetch historical prices from Yahoo Finance
 * @param symbol - Asset symbol (e.g., "THYAO", "AAPL")
 * @param currency - Asset currency (e.g., "TRY", "USD")
 * @param startDate - Start date for historical data
 * @param endDate - End date for historical data
 * @returns Array of historical prices
 */
export async function fetchHistoricalPrices(
  symbol: string,
  currency: string,
  startDate: Date,
  endDate: Date
): Promise<HistoricalPriceResult> {
  const yahooSymbol = mapSymbolForYahoo(symbol, currency);
  
  try {
    // Convert dates to Unix timestamps
    const period1 = Math.floor(startDate.getTime() / 1000);
    const period2 = Math.floor(endDate.getTime() / 1000);
    
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?period1=${period1}&period2=${period2}&interval=1d&events=history`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout for historical data

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
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    const result = data?.chart?.result?.[0];
    
    if (!result) {
      return {
        success: false,
        error: 'No data returned from Yahoo Finance',
      };
    }

    const timestamps = result.timestamp || [];
    const quotes = result.indicators?.quote?.[0] || {};
    const adjClose = result.indicators?.adjclose?.[0]?.adjclose || [];

    if (timestamps.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    const historicalPrices: HistoricalPrice[] = [];
    
    for (let i = 0; i < timestamps.length; i++) {
      const timestamp = timestamps[i];
      const open = quotes.open?.[i];
      const high = quotes.high?.[i];
      const low = quotes.low?.[i];
      const close = quotes.close?.[i];
      const volume = quotes.volume?.[i];
      const adjustedClose = adjClose[i] ?? close;

      // Skip if any required value is null/undefined
      if (close === null || close === undefined) {
        continue;
      }

      const date = new Date(timestamp * 1000);
      const dateStr = date.toISOString().split('T')[0];

      historicalPrices.push({
        date: dateStr,
        open: open ?? close,
        high: high ?? close,
        low: low ?? close,
        close,
        volume: volume ?? 0,
        adjustedClose: adjustedClose ?? close,
      });
    }

    return {
      success: true,
      data: historicalPrices,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timeout',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fetch historical prices for multiple symbols
 * @param symbols - Array of {symbol, currency} pairs
 * @param startDate - Start date
 * @param endDate - End date
 * @param onProgress - Progress callback
 */
export async function fetchMultipleHistoricalPrices(
  symbols: Array<{ symbol: string; currency: string }>,
  startDate: Date,
  endDate: Date,
  onProgress?: (current: number, total: number, symbol: string) => void
): Promise<Map<string, HistoricalPrice[]>> {
  const results = new Map<string, HistoricalPrice[]>();
  
  for (let i = 0; i < symbols.length; i++) {
    const { symbol, currency } = symbols[i];
    
    if (onProgress) {
      onProgress(i + 1, symbols.length, symbol);
    }
    
    const result = await fetchHistoricalPrices(symbol, currency, startDate, endDate);
    
    if (result.success && result.data) {
      results.set(symbol, result.data);
    } else {
      console.warn(`Failed to fetch historical prices for ${symbol}:`, result.error);
      results.set(symbol, []);
    }
    
    // Rate limiting - wait 200ms between requests
    if (i < symbols.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  return results;
}

/**
 * Get price for a specific date from historical data
 */
export function getPriceForDate(
  historicalPrices: HistoricalPrice[],
  date: string
): number | null {
  const price = historicalPrices.find(p => p.date === date);
  return price?.close ?? null;
}

/**
 * Get nearest available price for a date
 * Searches backwards if exact date not found
 */
export function getNearestPriceForDate(
  historicalPrices: HistoricalPrice[],
  date: string
): { price: number; date: string } | null {
  // Sort by date descending
  const sorted = [...historicalPrices].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const targetDate = new Date(date).getTime();
  
  // Find the nearest price on or before the target date
  for (const hp of sorted) {
    if (new Date(hp.date).getTime() <= targetDate) {
      return { price: hp.close, date: hp.date };
    }
  }
  
  // If no earlier date found, return the earliest available
  const earliest = sorted[sorted.length - 1];
  return earliest ? { price: earliest.close, date: earliest.date } : null;
}
