# Task Breakdown: Asset Price Chart with Lightweight Charts

<!-- FEATURE_DIR: 009-asset-price-chart -->
<!-- FEATURE_ID: 009 -->
<!-- TASK_FILE: 001 -->
<!-- STATUS: completed -->
<!-- CREATED: 2026-01-03 -->
<!-- COMPLETED: 2026-01-13 -->

## Progress Overview

| Metric | Value |
|--------|-------|
| Total Tasks | 10 |
| Completed | 10 |
| In Progress | 0 |
| Blocked | 0 |
| Completion | 100% |

---

## Task List

### Phase 1: Infrastructure

#### T001: Install Lightweight Charts Package
- **Status**: [x] Completed
- **Type**: setup
- **Priority**: HIGH
- **Estimate**: 5 min
- **Dependencies**: None
- **Parallel**: [P]

**Description**:
npm ile lightweight-charts paketini kur.

**Implementation**:
```bash
npm install lightweight-charts
```

**Acceptance Criteria**:
- [ ] Package installed successfully
- [ ] No peer dependency warnings

---

#### T002: Create Chart Type Definitions
- **Status**: [x] Completed
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 15 min
- **Dependencies**: None
- **Parallel**: [P]

**Description**:
Chart verileri için TypeScript tip tanımlamaları oluştur.

**File**: `lib/types/chart.ts`

**Implementation**:
```typescript
export type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y' | 'MAX';

export interface TimeRangeConfig {
  label: string;
  yahooRange: string;
  yahooInterval: string;
}

export const TIME_RANGE_CONFIG: Record<TimeRange, TimeRangeConfig> = {
  '1D': { label: '1G', yahooRange: '1d', yahooInterval: '5m' },
  '1W': { label: '1H', yahooRange: '5d', yahooInterval: '1h' },
  '1M': { label: '1A', yahooRange: '1mo', yahooInterval: '1d' },
  '3M': { label: '3A', yahooRange: '3mo', yahooInterval: '1d' },
  '1Y': { label: '1Y', yahooRange: '1y', yahooInterval: '1d' },
  '5Y': { label: '5Y', yahooRange: '5y', yahooInterval: '1wk' },
  'MAX': { label: 'MAX', yahooRange: 'max', yahooInterval: '1mo' },
};

export interface CandlestickData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface VolumeData {
  time: string;
  value: number;
  color: string;
}

export interface LineData {
  time: string;
  value: number;
}

export interface ChartData {
  symbol: string;
  candles: CandlestickData[];
  volume: VolumeData[];
  sma20: LineData[];
  sma50: LineData[];
  meta: {
    currency: string;
    exchangeName: string;
    regularMarketPrice: number;
    previousClose: number;
  };
}
```

**Acceptance Criteria**:
- [ ] All types exported correctly
- [ ] TIME_RANGE_CONFIG covers all ranges
- [ ] TypeScript compiles without errors

---

#### T003: Create Chart Utility Functions
- **Status**: [x] Completed
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 20 min
- **Dependencies**: T002
- **Parallel**: No

**Description**:
SMA/EMA hesaplama ve veri dönüşüm fonksiyonları.

**File**: `lib/utils/chart-utils.ts`

**Implementation**:
```typescript
import { CandlestickData, LineData, VolumeData } from '@/lib/types/chart';

// Simple Moving Average
export function calculateSMA(data: CandlestickData[], period: number): LineData[] {
  const result: LineData[] = [];
  
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    result.push({
      time: data[i].time,
      value: sum / period,
    });
  }
  
  return result;
}

// Exponential Moving Average
export function calculateEMA(data: CandlestickData[], period: number): LineData[] {
  const result: LineData[] = [];
  const multiplier = 2 / (period + 1);
  
  // First EMA is SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].close;
  }
  let ema = sum / period;
  result.push({ time: data[period - 1].time, value: ema });
  
  // Calculate EMA for rest
  for (let i = period; i < data.length; i++) {
    ema = (data[i].close - ema) * multiplier + ema;
    result.push({ time: data[i].time, value: ema });
  }
  
  return result;
}

// Transform Yahoo Finance data to chart format
export function transformYahooData(
  timestamps: number[],
  quote: { open: number[]; high: number[]; low: number[]; close: number[]; volume: number[] }
): { candles: CandlestickData[]; volume: VolumeData[] } {
  const candles: CandlestickData[] = [];
  const volume: VolumeData[] = [];

  for (let i = 0; i < timestamps.length; i++) {
    if (quote.close[i] === null || quote.open[i] === null) continue;

    const date = new Date(timestamps[i] * 1000);
    const time = date.toISOString().split('T')[0]; // YYYY-MM-DD

    candles.push({
      time,
      open: quote.open[i],
      high: quote.high[i],
      low: quote.low[i],
      close: quote.close[i],
    });

    volume.push({
      time,
      value: quote.volume[i] || 0,
      color: quote.close[i] >= quote.open[i] 
        ? 'rgba(34, 197, 94, 0.5)'  // green
        : 'rgba(239, 68, 68, 0.5)', // red
    });
  }

  return { candles, volume };
}
```

**Acceptance Criteria**:
- [ ] SMA calculation is correct
- [ ] EMA calculation is correct
- [ ] Yahoo data transforms properly
- [ ] Null values are handled

---

### Phase 2: Backend API

#### T004: Create Chart Data Service
- **Status**: [x] Completed
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 30 min
- **Dependencies**: T003
- **Parallel**: No

**Description**:
Yahoo Finance'den geçmiş fiyat verisi çeken servis.

**File**: `lib/services/chart-data-service.ts`

**Implementation**:
```typescript
import { ChartData, TimeRange, TIME_RANGE_CONFIG } from '@/lib/types/chart';
import { mapSymbolForYahoo } from '@/lib/utils/symbol-mapper';
import { calculateSMA, transformYahooData } from '@/lib/utils/chart-utils';

// Cache with 5-min TTL
const chartCache = new Map<string, { data: ChartData; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

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
  
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=${config.yahooInterval}&range=${config.yahooRange}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Yahoo Finance API error: ${response.status}`);
  }
  
  const json = await response.json();
  const result = json.chart.result?.[0];
  
  if (!result) {
    throw new Error('No chart data available');
  }
  
  const { timestamps, indicators } = result;
  const quote = indicators.quote[0];
  const meta = result.meta;
  
  const { candles, volume } = transformYahooData(timestamps || result.timestamp, quote);
  
  const chartData: ChartData = {
    symbol: yahooSymbol,
    candles,
    volume,
    sma20: calculateSMA(candles, 20),
    sma50: calculateSMA(candles, 50),
    meta: {
      currency: meta.currency || currency,
      exchangeName: meta.exchangeName || '',
      regularMarketPrice: meta.regularMarketPrice || 0,
      previousClose: meta.previousClose || 0,
    },
  };
  
  chartCache.set(cacheKey, { data: chartData, timestamp: Date.now() });
  
  return chartData;
}
```

**Acceptance Criteria**:
- [ ] Fetches data from Yahoo Finance
- [ ] Caches responses for 5 minutes
- [ ] Calculates SMA20 and SMA50
- [ ] Handles errors gracefully

---

#### T005: Create Chart API Endpoint
- **Status**: [x] Completed
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 15 min
- **Dependencies**: T004
- **Parallel**: No

**Description**:
Chart verisi için Next.js API endpoint.

**File**: `app/api/chart/[symbol]/route.ts`

**Implementation**:
```typescript
import { NextResponse } from 'next/server';
import { fetchChartData } from '@/lib/services/chart-data-service';
import { TimeRange } from '@/lib/types/chart';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const { searchParams } = new URL(request.url);
    const range = (searchParams.get('range') || '1M') as TimeRange;
    const currency = searchParams.get('currency') || 'USD';

    const data = await fetchChartData(symbol, currency, range);

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('Chart API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

**Acceptance Criteria**:
- [ ] Returns chart data for valid symbol
- [ ] Supports range and currency params
- [ ] Returns proper error responses
- [ ] Sets cache headers

---

### Phase 3: Chart Component

#### T006: Create useChartData Hook
- **Status**: [x] Completed
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 15 min
- **Dependencies**: T005
- **Parallel**: No

**Description**:
Chart verisi için React hook.

**File**: `lib/hooks/use-chart-data.ts`

**Implementation**:
```typescript
'use client';

import { useState, useCallback, useEffect } from 'react';
import { ChartData, TimeRange } from '@/lib/types/chart';

interface UseChartDataResult {
  data: ChartData | null;
  loading: boolean;
  error: string | null;
  range: TimeRange;
  setRange: (range: TimeRange) => void;
  refetch: () => void;
}

export function useChartData(
  symbol: string | null | undefined,
  currency: string,
  defaultRange: TimeRange = '1M'
): UseChartDataResult {
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<TimeRange>(defaultRange);

  const fetchData = useCallback(async () => {
    if (!symbol) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/chart/${encodeURIComponent(symbol)}?range=${range}&currency=${currency}`
      );
      const json = await response.json();

      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch chart data');
      }

      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [symbol, currency, range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    range,
    setRange,
    refetch: fetchData,
  };
}
```

**Acceptance Criteria**:
- [ ] Fetches data on mount
- [ ] Refetches when range changes
- [ ] Handles loading/error states
- [ ] Provides refetch function

---

#### T007: Create PriceChart Component
- **Status**: [x] Completed
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 45 min
- **Dependencies**: T006
- **Parallel**: No

**Description**:
Lightweight Charts ile ana grafik komponenti.

**File**: `components/charts/price-chart.tsx`

**Implementation**:
```typescript
'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import { ChartData, TimeRange, TIME_RANGE_CONFIG } from '@/lib/types/chart';
import { useChartData } from '@/lib/hooks/use-chart-data';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';

interface PriceChartProps {
  symbol: string;
  currency: string;
  height?: number;
  showVolume?: boolean;
  showSMA20?: boolean;
  showSMA50?: boolean;
  defaultRange?: TimeRange;
}

const darkTheme = {
  layout: {
    background: { color: '#18181b' },
    textColor: '#a1a1aa',
  },
  grid: {
    vertLines: { color: '#27272a' },
    horzLines: { color: '#27272a' },
  },
  crosshair: {
    mode: 1,
    vertLine: { color: '#52525b', labelBackgroundColor: '#27272a' },
    horzLine: { color: '#52525b', labelBackgroundColor: '#27272a' },
  },
};

const lightTheme = {
  layout: {
    background: { color: '#ffffff' },
    textColor: '#71717a',
  },
  grid: {
    vertLines: { color: '#f4f4f5' },
    horzLines: { color: '#f4f4f5' },
  },
  crosshair: {
    mode: 1,
    vertLine: { color: '#d4d4d8', labelBackgroundColor: '#e4e4e7' },
    horzLine: { color: '#d4d4d8', labelBackgroundColor: '#e4e4e7' },
  },
};

export function PriceChart({
  symbol,
  currency,
  height = 400,
  showVolume = true,
  showSMA20 = true,
  showSMA50 = true,
  defaultRange = '1M',
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { data, loading, error, range, setRange } = useChartData(symbol, currency, defaultRange);
  const [isDark, setIsDark] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Initialize and update chart
  useEffect(() => {
    if (!chartContainerRef.current || !data) return;

    // Clear previous chart
    if (chartRef.current) {
      chartRef.current.remove();
    }

    const theme = isDark ? darkTheme : lightTheme;
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      ...theme,
      rightPriceScale: { borderColor: isDark ? '#27272a' : '#e4e4e7' },
      timeScale: { borderColor: isDark ? '#27272a' : '#e4e4e7' },
    });

    chartRef.current = chart;

    // Candlestick series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });
    candleSeries.setData(data.candles as any);

    // Volume series
    if (showVolume && data.volume.length > 0) {
      const volumeSeries = chart.addHistogramSeries({
        priceFormat: { type: 'volume' },
        priceScaleId: '',
      });
      volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });
      volumeSeries.setData(data.volume as any);
    }

    // SMA 20
    if (showSMA20 && data.sma20.length > 0) {
      const sma20Series = chart.addLineSeries({
        color: '#3b82f6',
        lineWidth: 1,
        priceLineVisible: false,
      });
      sma20Series.setData(data.sma20 as any);
    }

    // SMA 50
    if (showSMA50 && data.sma50.length > 0) {
      const sma50Series = chart.addLineSeries({
        color: '#f97316',
        lineWidth: 1,
        priceLineVisible: false,
      });
      sma50Series.setData(data.sma50 as any);
    }

    chart.timeScale().fitContent();

    // Resize handler
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data, isDark, height, showVolume, showSMA20, showSMA50]);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header with time range buttons */}
      <div className="mb-4 flex items-center justify-between">
        <Text className="font-semibold">Price Chart</Text>
        <div className="flex gap-1">
          {(Object.keys(TIME_RANGE_CONFIG) as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                range === r
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
              }`}
            >
              {TIME_RANGE_CONFIG[r].label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <Skeleton className="w-full" style={{ height }} />
      ) : error ? (
        <div
          className="flex items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800"
          style={{ height }}
        >
          <Text className="text-zinc-500">Chart data unavailable</Text>
        </div>
      ) : (
        <div ref={chartContainerRef} style={{ height }} />
      )}

      {/* Legend */}
      {data && (showSMA20 || showSMA50) && (
        <div className="mt-2 flex gap-4 text-xs">
          {showSMA20 && (
            <div className="flex items-center gap-1">
              <div className="h-0.5 w-4 bg-blue-500" />
              <Text className="text-zinc-500">SMA 20</Text>
            </div>
          )}
          {showSMA50 && (
            <div className="flex items-center gap-1">
              <div className="h-0.5 w-4 bg-orange-500" />
              <Text className="text-zinc-500">SMA 50</Text>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

**Acceptance Criteria**:
- [ ] Candlestick chart renders correctly
- [ ] Volume histogram shows below
- [ ] SMA lines render smoothly
- [ ] Time range buttons work
- [ ] Dark/light mode switches
- [ ] Responsive to window resize

---

### Phase 4: Integration

#### T008: Integrate Chart into Asset Page
- **Status**: [x] Completed
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 15 min
- **Dependencies**: T007
- **Parallel**: No

**Description**:
PriceChart'ı asset detay sayfasına entegre et.

**File**: `app/(protected)/assets/[id]/page.tsx`

**Changes**:
```typescript
// Add import
import { PriceChart } from '@/components/charts/price-chart';

// Add after market data section
{asset.symbol && (
  <PriceChart
    symbol={asset.symbol}
    currency={asset.currency || 'USD'}
    height={400}
    showVolume={true}
    showSMA20={true}
    showSMA50={true}
    defaultRange="1M"
  />
)}
```

**Acceptance Criteria**:
- [ ] Chart visible on asset page
- [ ] Uses correct symbol and currency
- [ ] Loads without errors

---

### Phase 5: Polish

#### T009: Add Dynamic Import for SSR
- **Status**: [x] Completed
- **Type**: development
- **Priority**: MEDIUM
- **Estimate**: 10 min
- **Dependencies**: T008
- **Parallel**: No

**Description**:
SSR sorunlarını önlemek için dynamic import kullan.

**Implementation**:
```typescript
// In asset page:
import dynamic from 'next/dynamic';

const PriceChart = dynamic(
  () => import('@/components/charts/price-chart').then((mod) => mod.PriceChart),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-[400px] w-full" />
  }
);
```

**Acceptance Criteria**:
- [ ] No SSR errors
- [ ] Loading skeleton shows during hydration

---

#### T010: Final Testing & Commit
- **Status**: [x] Completed
- **Type**: testing
- **Priority**: HIGH
- **Estimate**: 15 min
- **Dependencies**: T009
- **Parallel**: No

**Description**:
Tam test ve commit.

**Tests**:
- [ ] TypeScript compiles without errors
- [ ] Chart loads for BIST stocks (THYAO, AGESA)
- [ ] All time ranges work
- [ ] Dark mode works
- [ ] Mobile responsive
- [ ] No console errors

**Commit Message**:
```
feat: add interactive price chart with Lightweight Charts

- Add candlestick chart with OHLC data
- Add volume histogram below price
- Add SMA 20/50 indicators
- Support 7 time ranges (1D to MAX)
- Yahoo Finance data integration
- Dark/light mode theming
- Responsive design
```

**Acceptance Criteria**:
- [ ] All tests pass
- [ ] Changes committed
- [ ] Ready for push

---

## Execution Order

```
T001 ──┬── T002 ───── T003 ───── T004 ───── T005 ───── T006 ───── T007 ───── T008 ───── T009 ───── T010
       │
       └── (Parallel: Package install)
```

## AI Execution Guidelines

### Sequential Execution Required
All tasks after T001/T002 depend on previous tasks. Execute in order.

### Key Files to Create
1. `lib/types/chart.ts`
2. `lib/utils/chart-utils.ts`
3. `lib/services/chart-data-service.ts`
4. `lib/hooks/use-chart-data.ts`
5. `app/api/chart/[symbol]/route.ts`
6. `components/charts/price-chart.tsx`

### Existing Files to Modify
1. `app/(protected)/assets/[id]/page.tsx` - Add chart integration

### Dependencies
- Uses existing `symbol-mapper.ts`
- Uses existing Catalyst UI components
