# Implementation Plan: Asset Price Chart with Lightweight Charts

<!-- FEATURE_DIR: 009-asset-price-chart -->
<!-- FEATURE_ID: 009 -->
<!-- PLAN_NUMBER: 001 -->
<!-- STATUS: approved -->
<!-- CREATED: 2026-01-03 -->

## Specification Reference
- **Spec ID**: SPEC-009
- **Spec Version**: 1.0
- **Plan Version**: 1.0
- **Generated**: 2026-01-03

---

## Architecture Overview

### High-Level Design
Asset detay sayfasına TradingView'in Lightweight Charts kütüphanesi ile profesyonel fiyat grafiği entegrasyonu. Yahoo Finance API'den geçmiş fiyat verisi çekilecek, client-side'da interaktif grafik render edilecek.

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  Asset Page     │ ──── │  /api/chart/[s]  │ ──── │  Yahoo Finance  │
│  PriceChart.tsx │      │  Chart Data API  │      │  Historical API │
└─────────────────┘      └──────────────────┘      └─────────────────┘
         │                        │
         │                        │
         ▼                        ▼
┌─────────────────┐      ┌──────────────────┐
│  Lightweight    │      │  Cache Layer     │
│  Charts Lib     │      │  (5 min TTL)     │
└─────────────────┘      └──────────────────┘
```

### Technical Stack
- **Frontend**: React, Lightweight Charts 4.2.0, TypeScript
- **Backend**: Next.js API Routes
- **Data Source**: Yahoo Finance Chart API
- **Caching**: In-memory cache with 5-min TTL

---

## Implementation Phases

### Phase 1: Infrastructure [Priority: HIGH]
**Timeline**: 45 min
**Dependencies**: None

#### Tasks
1. [x] Install lightweight-charts package
2. [ ] Create chart type definitions (`lib/types/chart.ts`)
3. [ ] Create chart utility functions (`lib/utils/chart-utils.ts`)
   - `calculateSMA(data, period)` - Simple Moving Average
   - `calculateEMA(data, period)` - Exponential Moving Average
   - `transformYahooData(response)` - Yahoo → Lightweight Charts format

#### Deliverables
- [ ] TypeScript types for chart data
- [ ] SMA/EMA calculation utilities
- [ ] Data transformation utilities

#### Code: `lib/types/chart.ts`
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
  time: string; // 'YYYY-MM-DD' or Unix timestamp
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

---

### Phase 2: Backend API [Priority: HIGH]
**Timeline**: 45 min
**Dependencies**: Phase 1

#### Tasks
1. [ ] Create chart data service (`lib/services/chart-data-service.ts`)
   - Fetch from Yahoo Finance
   - Transform data to chart format
   - Calculate indicators (SMA20, SMA50)
   - Cache responses
2. [ ] Create API endpoint (`app/api/chart/[symbol]/route.ts`)

#### Deliverables
- [ ] Chart data service with caching
- [ ] REST API endpoint for chart data

#### API Contract
```
GET /api/chart/[symbol]?range=1M&currency=TRY

Response:
{
  success: true,
  data: ChartData
}
```

---

### Phase 3: Chart Component [Priority: HIGH]
**Timeline**: 90 min
**Dependencies**: Phase 2

#### Tasks
1. [ ] Create `PriceChart` component (`components/charts/price-chart.tsx`)
   - Initialize Lightweight Charts
   - Candlestick series
   - Volume histogram
   - SMA line series
   - Dark/Light mode theming
   - Responsive resize handling
2. [ ] Create `ChartControls` component (`components/charts/chart-controls.tsx`)
   - Time range buttons
   - Active state styling
3. [ ] Create `useChartData` hook (`lib/hooks/use-chart-data.ts`)
   - Fetch chart data
   - Loading/error states
   - Range switching

#### Deliverables
- [ ] PriceChart component with full features
- [ ] ChartControls for time range selection
- [ ] useChartData hook for data fetching

#### Component API
```typescript
<PriceChart
  symbol="AGESA"
  currency="TRY"
  height={400}
  showVolume={true}
  showSMA20={true}
  showSMA50={true}
  defaultRange="1M"
/>
```

---

### Phase 4: Integration [Priority: HIGH]
**Timeline**: 30 min
**Dependencies**: Phase 3

#### Tasks
1. [ ] Integrate PriceChart into Asset detail page
2. [ ] Add loading skeleton for chart
3. [ ] Handle error states gracefully
4. [ ] Test with real BIST stocks

#### Deliverables
- [ ] Chart visible on asset detail page
- [ ] Smooth loading experience
- [ ] Error handling for unavailable data

---

### Phase 5: Polish [Priority: MEDIUM]
**Timeline**: 30 min
**Dependencies**: Phase 4

#### Tasks
1. [ ] Fine-tune chart colors/styling
2. [ ] Add crosshair tooltip customization
3. [ ] Optimize mobile experience
4. [ ] Add chart legend (optional)

#### Deliverables
- [ ] Polished visual appearance
- [ ] Mobile-friendly layout
- [ ] Professional crosshair/tooltip

---

## Risk Assessment

### Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Yahoo Finance rate limiting | Medium | High | In-memory cache with 5-min TTL |
| BIST symbol mapping issues | Low | Medium | Use existing symbol-mapper.ts |
| Lightweight Charts SSR issues | Medium | Medium | Dynamic import with ssr:false |
| Large data sets (5Y, MAX) | Low | Low | Data aggregation at API level |

### Dependencies
| Dependency | Risk | Contingency |
|------------|------|-------------|
| Yahoo Finance API | Medium | Cache aggressively, show stale data |
| lightweight-charts | Low | Well-maintained TradingView library |

---

## Resource Requirements

### Development
- **Developer**: 1 (solo implementation)
- **Estimated Time**: 4-5 hours

### Infrastructure
- No additional infrastructure required
- Uses existing Next.js API routes
- Client-side rendering for chart

---

## Success Metrics
- **Performance**: Chart renders in < 2 seconds
- **Functionality**: All 7 time ranges work correctly
- **Data Accuracy**: OHLCV values match Yahoo Finance
- **UX**: Smooth zoom/pan interactions

---

## File Checklist

```
[ ] lib/types/chart.ts              # Chart data types
[ ] lib/utils/chart-utils.ts        # SMA/EMA calculations
[ ] lib/services/chart-data-service.ts  # Yahoo data fetching
[ ] lib/hooks/use-chart-data.ts     # React hook
[ ] app/api/chart/[symbol]/route.ts # API endpoint
[ ] components/charts/price-chart.tsx   # Main chart
[ ] components/charts/chart-controls.tsx # Time buttons
[~] app/(protected)/assets/[id]/page.tsx # Integration
```

---

## Definition of Done
- [ ] Candlestick chart displays correctly
- [ ] Volume histogram shows below price
- [ ] SMA 20/50 lines render smoothly
- [ ] All time ranges (1D-MAX) functional
- [ ] Dark/Light mode works
- [ ] Mobile responsive
- [ ] No console errors
- [ ] TypeScript compiles without errors
