# Task Breakdown: Asset Detail Page with Live Market Prices

<!-- FEATURE_DIR: 008-asset-live-prices -->
<!-- FEATURE_ID: 008 -->
<!-- TASK_LIST_ID: 001 -->
<!-- STATUS: completed -->
<!-- CREATED: 2026-01-03 -->
<!-- LAST_UPDATED: 2026-01-03 -->

## Progress Overview
- **Total Tasks**: 12
- **Completed Tasks**: 12 (100%)
- **In Progress Tasks**: 0
- **Blocked Tasks**: 0
- **Estimated Total Time**: 8 hours
- **Actual Completion**: 2026-01-03

## Task Summary

| ID | Task | Size | Phase | Dependencies | Status |
|----|------|------|-------|--------------|--------|
| T001 | Create price types | S | 1 | - | [x] |
| T002 | Create symbol mapper utility | S | 1 | - | [x] |
| T003 | Create price service with cache | M | 1 | T001, T002 | [x] |
| T004 | Add unit tests for price service | S | 1 | T003 | [x] |
| T005 | Create price API endpoint | M | 2 | T003 | [x] |
| T006 | Add integration tests for API | S | 2 | T005 | [x] |
| T007 | Create useLivePrice hook | M | 3 | T005 | [x] |
| T008 | Update asset detail page UI | L | 4 | T007 | [x] |
| T009 | Add loading states | S | 5 | T008 | [x] |
| T010 | Add error handling & fallback | S | 5 | T008 | [x] |
| T011 | Add refresh button & timestamp | S | 5 | T008 | [x] |
| T012 | Final testing & polish | M | 5 | All | [x] |

---

## Detailed Task Breakdown

### Phase 1: Core Infrastructure [Priority: HIGH]

---

#### T001: Create Price Types
**Size**: S (15 min) | **Priority**: HIGH | **Status**: [ ] Pending

**Description**: Create TypeScript interfaces for live price data.

**Files to Create**:
- `lib/types/price.ts`

**Implementation**:
```typescript
// lib/types/price.ts

export interface LivePrice {
  symbol: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  currency: string;
  marketState: 'PRE' | 'REGULAR' | 'POST' | 'CLOSED';
  lastUpdated: string;
}

export interface PriceError {
  symbol: string;
  error: string;
  code: 'NOT_FOUND' | 'API_ERROR' | 'RATE_LIMITED' | 'TIMEOUT';
}

export type PriceResult = 
  | { success: true; data: LivePrice }
  | { success: false; error: PriceError };
```

**Acceptance Criteria**:
- [ ] All interfaces exported
- [ ] Types compile without errors

---

#### T002: Create Symbol Mapper Utility
**Size**: S (30 min) | **Priority**: HIGH | **Status**: [ ] Pending

**Description**: Map asset currency to Yahoo Finance symbol suffix.

**Files to Create**:
- `lib/utils/symbol-mapper.ts`
- `lib/utils/__tests__/symbol-mapper.test.ts`

**Implementation**:
```typescript
// lib/utils/symbol-mapper.ts

const CURRENCY_SUFFIX_MAP: Record<string, string> = {
  TRY: '.IS',   // Borsa Istanbul
  EUR: '.DE',   // Frankfurt
  GBP: '.L',    // London
  JPY: '.T',    // Tokyo
  HKD: '.HK',   // Hong Kong
  // USD: no suffix
};

export function mapSymbolForYahoo(symbol: string, currency: string): string {
  const suffix = CURRENCY_SUFFIX_MAP[currency] || '';
  return `${symbol.toUpperCase().trim()}${suffix}`;
}

export function isBISTStock(currency: string): boolean {
  return currency === 'TRY';
}
```

**Acceptance Criteria**:
- [ ] THYAO + TRY → THYAO.IS
- [ ] AAPL + USD → AAPL
- [ ] SAP + EUR → SAP.DE
- [ ] Unit tests pass

---

#### T003: Create Price Service with Cache
**Size**: M (45 min) | **Priority**: HIGH | **Status**: [ ] Pending
**Dependencies**: T001, T002

**Description**: Create Yahoo Finance API client with in-memory caching.

**Files to Create**:
- `lib/services/price-service.ts`

**Implementation**:
```typescript
// lib/services/price-service.ts

import { LivePrice, PriceResult } from '@/lib/types/price';
import { mapSymbolForYahoo } from '@/lib/utils/symbol-mapper';

// In-memory cache
const priceCache = new Map<string, { data: LivePrice; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function fetchLivePrice(
  symbol: string,
  currency: string
): Promise<PriceResult> {
  const yahooSymbol = mapSymbolForYahoo(symbol, currency);
  const cacheKey = yahooSymbol;

  // Check cache
  const cached = priceCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { success: true, data: cached.data };
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      next: { revalidate: 300 }, // Next.js cache
    });

    if (!response.ok) {
      return {
        success: false,
        error: {
          symbol: yahooSymbol,
          error: `HTTP ${response.status}`,
          code: response.status === 404 ? 'NOT_FOUND' : 'API_ERROR',
        },
      };
    }

    const data = await response.json();
    const meta = data?.chart?.result?.[0]?.meta;

    if (!meta) {
      return {
        success: false,
        error: { symbol: yahooSymbol, error: 'Invalid response', code: 'API_ERROR' },
      };
    }

    const livePrice: LivePrice = {
      symbol: yahooSymbol,
      price: meta.regularMarketPrice ?? 0,
      previousClose: meta.previousClose ?? meta.chartPreviousClose ?? 0,
      change: (meta.regularMarketPrice ?? 0) - (meta.previousClose ?? 0),
      changePercent: meta.previousClose
        ? ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100
        : 0,
      currency: meta.currency ?? currency,
      marketState: meta.marketState ?? 'CLOSED',
      lastUpdated: new Date().toISOString(),
    };

    // Update cache
    priceCache.set(cacheKey, { data: livePrice, timestamp: Date.now() });

    return { success: true, data: livePrice };
  } catch (error) {
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

export function clearPriceCache(): void {
  priceCache.clear();
}
```

**Acceptance Criteria**:
- [ ] Fetches price from Yahoo Finance
- [ ] Returns cached data within 5 min TTL
- [ ] Handles errors gracefully
- [ ] Maps BIST symbols correctly

---

#### T004: Add Unit Tests for Price Service
**Size**: S (30 min) | **Priority**: HIGH | **Status**: [ ] Pending
**Dependencies**: T003

**Description**: Unit tests for symbol mapper and price service.

**Files to Create**:
- `lib/services/__tests__/price-service.test.ts`

**Acceptance Criteria**:
- [ ] Symbol mapper tests pass
- [ ] Cache behavior tested
- [ ] Error handling tested
- [ ] All tests green

---

### Phase 2: API Endpoint [Priority: HIGH]

---

#### T005: Create Price API Endpoint
**Size**: M (45 min) | **Priority**: HIGH | **Status**: [ ] Pending
**Dependencies**: T003

**Description**: Create GET /api/prices/[symbol] endpoint.

**Files to Create**:
- `app/api/prices/[symbol]/route.ts`

**Implementation**:
```typescript
// app/api/prices/[symbol]/route.ts

import { NextResponse } from 'next/server';
import { fetchLivePrice } from '@/lib/services/price-service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const { searchParams } = new URL(request.url);
  const currency = searchParams.get('currency') || 'USD';

  if (!symbol || symbol.length < 1 || symbol.length > 10) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_SYMBOL', error: 'Invalid symbol' } },
      { status: 400 }
    );
  }

  const result = await fetchLivePrice(symbol, currency);

  if (!result.success) {
    const status = result.error.code === 'NOT_FOUND' ? 404 : 500;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}
```

**Acceptance Criteria**:
- [ ] GET /api/prices/AAPL returns live price
- [ ] GET /api/prices/THYAO?currency=TRY returns BIST price
- [ ] Invalid symbol returns 400
- [ ] Not found returns 404

---

#### T006: Add Integration Tests for API
**Size**: S (15 min) | **Priority**: MEDIUM | **Status**: [ ] Pending
**Dependencies**: T005

**Description**: Integration tests for price API endpoint.

**Files to Create**:
- `__tests__/integration/api/prices.test.ts`

**Acceptance Criteria**:
- [ ] Success case tested
- [ ] Error cases tested
- [ ] All tests pass

---

### Phase 3: React Hook [Priority: HIGH]

---

#### T007: Create useLivePrice Hook
**Size**: M (45 min) | **Priority**: HIGH | **Status**: [ ] Pending
**Dependencies**: T005

**Description**: React hook to fetch and manage live price state.

**Files to Create**:
- `lib/hooks/use-live-price.ts`

**Implementation**:
```typescript
// lib/hooks/use-live-price.ts

import { useState, useEffect, useCallback } from 'react';
import { LivePrice, PriceError } from '@/lib/types/price';

interface UseLivePriceOptions {
  enabled?: boolean;
  refreshInterval?: number; // ms
}

interface UseLivePriceResult {
  price: LivePrice | null;
  loading: boolean;
  error: PriceError | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useLivePrice(
  symbol: string | null,
  currency: string,
  options: UseLivePriceOptions = {}
): UseLivePriceResult {
  const { enabled = true, refreshInterval } = options;
  
  const [price, setPrice] = useState<LivePrice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PriceError | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrice = useCallback(async () => {
    if (!symbol || !enabled) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/prices/${encodeURIComponent(symbol)}?currency=${currency}`
      );
      const result = await response.json();

      if (result.success) {
        setPrice(result.data);
        setLastUpdated(new Date());
      } else {
        setError(result.error);
      }
    } catch (e) {
      setError({
        symbol: symbol,
        error: 'Network error',
        code: 'API_ERROR',
      });
    } finally {
      setLoading(false);
    }
  }, [symbol, currency, enabled]);

  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  useEffect(() => {
    if (!refreshInterval || !enabled) return;

    const interval = setInterval(fetchPrice, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, enabled, fetchPrice]);

  return {
    price,
    loading,
    error,
    refetch: fetchPrice,
    lastUpdated,
  };
}
```

**Acceptance Criteria**:
- [ ] Hook fetches price on mount
- [ ] Loading state works
- [ ] Error state works
- [ ] Refetch function works
- [ ] Optional auto-refresh works

---

### Phase 4: UI Updates [Priority: HIGH]

---

#### T008: Update Asset Detail Page UI
**Size**: L (1 hour) | **Priority**: HIGH | **Status**: [ ] Pending
**Dependencies**: T007

**Description**: Update asset detail page to show live prices and correct calculations.

**Files to Modify**:
- `app/(protected)/assets/[id]/page.tsx`

**Changes**:
1. Add `useLivePrice` hook call
2. Add "Current Price" card with daily change
3. Add "Market Value" card (quantity × current price)
4. Rename "Total Value" to "Cost Basis"
5. Update "Unrealized G/L" calculation: (current - avg) × quantity
6. Show market state badge (OPEN/CLOSED)

**New UI Layout**:
```
Row 1:
┌───────────┬──────────────┬──────────────────┬──────────────┐
│ Quantity  │ Cost Basis   │ Current Price    │ Market Value │
│ 18        │ $2,755.08    │ $236.00          │ $4,248.00    │
│           │ ($153/share) │ ▲ +$5.50 (+2.3%) │              │
└───────────┴──────────────┴──────────────────┴──────────────┘

Row 2:
┌──────────────┬──────────────┬──────────────────┬──────────────┐
│ Total        │ Realized     │ Unrealized G/L   │ Total G/L    │
│ Invested     │ G/L          │ +$1,492.92       │ +$1,492.92   │
│ $2,755.08    │ +$0.00       │ (+54.2%)         │ (+54.2%)     │
└──────────────┴──────────────┴──────────────────┴──────────────┘
```

**Acceptance Criteria**:
- [ ] Current Price displays live data
- [ ] Market Value calculated from live price
- [ ] Cost Basis shows purchase cost
- [ ] Unrealized G/L correctly calculated
- [ ] Daily change shown with color (green/red)

---

### Phase 5: Polish & Error Handling [Priority: MEDIUM]

---

#### T009: Add Loading States
**Size**: S (20 min) | **Priority**: MEDIUM | **Status**: [ ] Pending
**Dependencies**: T008

**Description**: Add skeleton loaders for price cards while loading.

**Acceptance Criteria**:
- [ ] Price cards show skeleton while loading
- [ ] Smooth transition to data

---

#### T010: Add Error Handling & Fallback
**Size**: S (20 min) | **Priority**: MEDIUM | **Status**: [ ] Pending
**Dependencies**: T008

**Description**: Graceful fallback when price API fails.

**Behavior**:
- If API fails: Show cost-only view with "Price unavailable" note
- Add subtle badge: "Live prices unavailable"
- Unrealized G/L hidden when no live price

**Acceptance Criteria**:
- [ ] Page works without live prices
- [ ] Error message is subtle, not alarming
- [ ] User can still see cost basis

---

#### T011: Add Refresh Button & Timestamp
**Size**: S (20 min) | **Priority**: MEDIUM | **Status**: [ ] Pending
**Dependencies**: T008

**Description**: Add manual refresh and "last updated" display.

**UI**:
- Small "↻" refresh icon button
- "Last updated: 2 min ago" text
- Button disabled while loading

**Acceptance Criteria**:
- [ ] Refresh button fetches new price
- [ ] Last updated time shown
- [ ] Button shows loading state

---

#### T012: Final Testing & Polish
**Size**: M (30 min) | **Priority**: MEDIUM | **Status**: [ ] Pending
**Dependencies**: All

**Description**: End-to-end testing and final polish.

**Tasks**:
- Test with real BIST stocks (THYAO, BIMAS, ARCLK)
- Test with US stocks (AAPL, MSFT, GOOGL)
- Test error scenarios (invalid symbol, network error)
- Verify calculations are correct
- Run all unit/integration tests

**Acceptance Criteria**:
- [ ] All tests pass
- [ ] BIST stocks work correctly
- [ ] US stocks work correctly
- [ ] TypeScript compiles without errors
- [ ] No console errors

---

## Dependencies Graph

```
T001 ─┬─→ T003 ──→ T004
T002 ─┘      │
             ↓
         T005 ──→ T006
             │
             ↓
         T007
             │
             ↓
         T008 ──┬──→ T009
                ├──→ T010
                ├──→ T011
                ↓
              T012
```

## Parallel Execution Opportunities

### Can Be Done In Parallel
- **T001 + T002**: No dependencies, can start together
- **T004 + T005**: After T003, can be parallel
- **T009 + T010 + T011**: After T008, all independent

### Must Be Sequential
- T003 → T005 → T007 → T008 (critical path)

## Execution Order (Recommended)

```
1. T001, T002    (parallel, 30min)
2. T003          (45min)
3. T004, T005    (parallel, 45min)
4. T006, T007    (parallel, 45min)
5. T008          (1h)
6. T009, T010, T011 (parallel, 30min)
7. T012          (30min)
```

**Estimated Total Time: ~4.5 hours** (with parallelization)

---

## Definition of Done

### Per Task
- [ ] Code implemented
- [ ] Types correct
- [ ] No linter errors
- [ ] Tests pass (if applicable)

### Feature Complete
- [x] Yahoo Finance integration working
- [x] BIST stocks (.IS suffix) working
- [x] US stocks working
- [x] Cache with 5-min TTL
- [x] Current Price & Market Value displayed
- [x] Unrealized G/L correctly calculated
- [x] Loading & error states handled
- [x] All tests passing
- [x] TypeScript compiles

---

**Legend:**
- [S] = Small (< 30 min), [M] = Medium (30-60 min), [L] = Large (> 60 min)
- **Status**: [ ] Pending, [>] In Progress, [x] Completed, [!] Blocked
