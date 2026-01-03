// Chart data service - fetches historical price data from Yahoo Finance

import { ChartData, TimeRange, TIME_RANGE_CONFIG } from '@/lib/types/chart';
import { mapSymbolForYahoo } from '@/lib/utils/symbol-mapper';
import { calculateSMA, transformYahooData } from '@/lib/utils/chart-utils';

// Cache with 5-min TTL
const chartCache = new Map<string, { data: ChartData; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface YahooChartResponse {
  chart: {
    result: Array<{
      meta: {
        currency?: string;
        exchangeName?: string;
        regularMarketPrice?: number;
        previousClose?: number;
        chartPreviousClose?: number;
      };
      timestamp?: number[];
      indicators: {
        quote: Array<{
          open: (number | null)[];
          high: (number | null)[];
          low: (number | null)[];
          close: (number | null)[];
          volume: (number | null)[];
        }>;
      };
    }> | null;
    error?: {
      code: string;
      description: string;
    };
  };
}

export async function fetchChartData(
  symbol: string,
  currency: string,
  range: TimeRange = '1M'
): Promise<ChartData> {
  const cacheKey = `${symbol}-${currency}-${range}`;
  const cached = chartCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const yahooSymbol = mapSymbolForYahoo(symbol, currency);
  const config = TIME_RANGE_CONFIG[range];

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=${config.yahooInterval}&range=${config.yahooRange}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  if (!response.ok) {
    throw new Error(`Yahoo Finance API error: ${response.status}`);
  }

  const json: YahooChartResponse = await response.json();

  if (json.chart.error) {
    throw new Error(json.chart.error.description || 'Yahoo Finance API error');
  }

  const result = json.chart.result?.[0];

  if (!result || !result.timestamp || result.timestamp.length === 0) {
    throw new Error('No chart data available');
  }

  const { timestamp, indicators, meta } = result;
  const quote = indicators.quote[0];

  const { candles, volume } = transformYahooData(timestamp, quote);

  if (candles.length === 0) {
    throw new Error('No valid price data available');
  }

  const chartData: ChartData = {
    symbol: yahooSymbol,
    candles,
    volume,
    sma20: calculateSMA(candles, 20),
    sma50: calculateSMA(candles, 50),
    meta: {
      currency: meta.currency || currency,
      exchangeName: meta.exchangeName || '',
      regularMarketPrice: meta.regularMarketPrice || candles[candles.length - 1].close,
      previousClose: meta.previousClose || meta.chartPreviousClose || 0,
    },
  };

  chartCache.set(cacheKey, { data: chartData, timestamp: Date.now() });

  return chartData;
}

/**
 * Clear chart cache (useful for testing)
 */
export function clearChartCache(): void {
  chartCache.clear();
}
