// Chart utility functions for SMA/EMA calculations and data transformation

import { CandlestickData, LineData, VolumeData } from '@/lib/types/chart';

/**
 * Calculate Simple Moving Average
 */
export function calculateSMA(data: CandlestickData[], period: number): LineData[] {
  const result: LineData[] = [];

  if (data.length < period) {
    return result;
  }

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    result.push({
      time: data[i].time,
      value: Number((sum / period).toFixed(2)),
    });
  }

  return result;
}

/**
 * Calculate Exponential Moving Average
 */
export function calculateEMA(data: CandlestickData[], period: number): LineData[] {
  const result: LineData[] = [];

  if (data.length < period) {
    return result;
  }

  const multiplier = 2 / (period + 1);

  // First EMA is SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].close;
  }
  let ema = sum / period;
  result.push({ time: data[period - 1].time, value: Number(ema.toFixed(2)) });

  // Calculate EMA for rest
  for (let i = period; i < data.length; i++) {
    ema = (data[i].close - ema) * multiplier + ema;
    result.push({ time: data[i].time, value: Number(ema.toFixed(2)) });
  }

  return result;
}

/**
 * Transform Yahoo Finance data to Lightweight Charts format
 * Handles duplicate timestamps by keeping only the last value for each time
 */
export function transformYahooData(
  timestamps: number[],
  quote: {
    open: (number | null)[];
    high: (number | null)[];
    low: (number | null)[];
    close: (number | null)[];
    volume: (number | null)[];
  }
): { candles: CandlestickData[]; volume: VolumeData[] } {
  // Use Map to deduplicate by time (keeps last value for each time)
  const candleMap = new Map<string, CandlestickData>();
  const volumeMap = new Map<string, VolumeData>();

  for (let i = 0; i < timestamps.length; i++) {
    // Skip null values
    if (
      quote.close[i] === null ||
      quote.open[i] === null ||
      quote.high[i] === null ||
      quote.low[i] === null
    ) {
      continue;
    }

    const date = new Date(timestamps[i] * 1000);
    const time = date.toISOString().split('T')[0]; // YYYY-MM-DD

    // Overwrite if duplicate time exists (keeps latest)
    candleMap.set(time, {
      time,
      open: quote.open[i]!,
      high: quote.high[i]!,
      low: quote.low[i]!,
      close: quote.close[i]!,
    });

    const isUp = quote.close[i]! >= quote.open[i]!;
    volumeMap.set(time, {
      time,
      value: quote.volume[i] || 0,
      color: isUp ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)',
    });
  }

  // Convert to arrays and sort by time ascending
  const candles = Array.from(candleMap.values()).sort((a, b) => 
    a.time.localeCompare(b.time)
  );
  const volume = Array.from(volumeMap.values()).sort((a, b) => 
    a.time.localeCompare(b.time)
  );

  return { candles, volume };
}

/**
 * Format time for intraday data (includes time component)
 */
export function formatIntradayTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  // For intraday, we need Unix timestamp format for Lightweight Charts
  return Math.floor(timestamp).toString();
}
