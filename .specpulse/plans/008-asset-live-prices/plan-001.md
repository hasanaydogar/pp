# Implementation Plan: Asset Detail Page with Live Market Prices

<!-- FEATURE_DIR: 008-asset-live-prices -->
<!-- FEATURE_ID: 008 -->
<!-- PLAN_NUMBER: 001 -->
<!-- STATUS: approved -->
<!-- CREATED: 2026-01-03 -->

## Specification Reference
- **Spec ID**: SPEC-008
- **Spec Version**: 1.0
- **Plan Version**: 1.0
- **Generated**: 2026-01-03

## Architecture Overview

### High-Level Design

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
│  ┌─────────────────┐    ┌─────────────────┐                     │
│  │ Asset Detail    │───▶│ useLivePrice    │                     │
│  │ Page            │    │ Hook            │                     │
│  └─────────────────┘    └────────┬────────┘                     │
└──────────────────────────────────┼──────────────────────────────┘
                                   │ fetch
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Backend (Next.js API)                        │
│  ┌─────────────────┐    ┌─────────────────┐                     │
│  │ /api/prices/    │───▶│ Price Service   │                     │
│  │ [symbol]/route  │    │ + Cache         │                     │
│  └─────────────────┘    └────────┬────────┘                     │
│                                  │                               │
│  ┌─────────────────┐             │                               │
│  │ Symbol Mapper   │◀────────────┘                               │
│  │ THYAO → .IS     │                                            │
│  └─────────────────┘                                            │
└──────────────────────────────────┼──────────────────────────────┘
                                   │ fetch
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Yahoo Finance API                             │
│  query1.finance.yahoo.com/v8/finance/chart/{symbol}              │
└─────────────────────────────────────────────────────────────────┘
```

### Technical Stack
- **Frontend**: React, Next.js 14, Tailwind CSS, Catalyst UI
- **Backend**: Next.js API Routes, TypeScript
- **Cache**: In-memory Map (5 minute TTL)
- **External API**: Yahoo Finance (unofficial, free)

### File Structure

```
lib/
├── services/
│   └── price-service.ts         # Yahoo Finance client + cache
├── hooks/
│   └── use-live-price.ts        # React hook for components
├── utils/
│   └── symbol-mapper.ts         # Currency → suffix mapping
└── types/
    └── price.ts                 # LivePrice, PriceError types

app/api/
└── prices/
    └── [symbol]/
        └── route.ts             # GET /api/prices/AAPL

app/(protected)/assets/[id]/
└── page.tsx                     # Updated with live prices
```

## Implementation Phases

### Phase 1: Core Price Infrastructure [Priority: HIGH]
**Timeline**: 2 hours
**Dependencies**: None

#### Tasks
| ID | Task | Est. | Description |
|----|------|------|-------------|
| P1-T1 | Create price types | 15m | `LivePrice`, `PriceError`, `PriceResponse` interfaces |
| P1-T2 | Create symbol mapper | 30m | Map currency to Yahoo suffix (.IS, .DE, etc.) |
| P1-T3 | Create price service | 45m | Yahoo Finance fetch + in-memory cache |
| P1-T4 | Add unit tests | 30m | Tests for mapper and service |

#### Deliverables
- [ ] `lib/types/price.ts` - Type definitions
- [ ] `lib/utils/symbol-mapper.ts` - Symbol mapping logic
- [ ] `lib/services/price-service.ts` - Yahoo Finance client
- [ ] `lib/services/__tests__/price-service.test.ts` - Unit tests

#### Code Snippets

**lib/types/price.ts**
```typescript
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
  code: 'NOT_FOUND' | 'API_ERROR' | 'RATE_LIMITED';
}

export type PriceResult = 
  | { success: true; data: LivePrice }
  | { success: false; error: PriceError };
```

**lib/utils/symbol-mapper.ts**
```typescript
const CURRENCY_SUFFIX_MAP: Record<string, string> = {
  TRY: '.IS',   // Borsa Istanbul
  EUR: '.DE',   // Frankfurt (default for EUR)
  GBP: '.L',    // London
  JPY: '.T',    // Tokyo
  // USD has no suffix
};

export function mapSymbolForYahoo(symbol: string, currency: string): string {
  const suffix = CURRENCY_SUFFIX_MAP[currency] || '';
  return `${symbol.toUpperCase()}${suffix}`;
}

export function isBISTStock(currency: string): boolean {
  return currency === 'TRY';
}
```

---

### Phase 2: API Endpoint [Priority: HIGH]
**Timeline**: 1.5 hours
**Dependencies**: Phase 1 complete

#### Tasks
| ID | Task | Est. | Description |
|----|------|------|-------------|
| P2-T1 | Create price API route | 45m | GET /api/prices/[symbol] with cache |
| P2-T2 | Add error handling | 30m | Timeout, rate limit, invalid symbol |
| P2-T3 | Add integration tests | 15m | Mock Yahoo responses |

#### Deliverables
- [ ] `app/api/prices/[symbol]/route.ts` - Price endpoint
- [ ] `__tests__/integration/api/prices.test.ts` - Tests

#### API Specification

```
GET /api/prices/{symbol}?currency={currency}

Request:
  - symbol: Asset symbol (AAPL, THYAO)
  - currency: Asset currency (USD, TRY) - for suffix mapping

Response (200):
{
  "success": true,
  "data": {
    "symbol": "THYAO.IS",
    "price": 285.50,
    "previousClose": 280.00,
    "change": 5.50,
    "changePercent": 1.96,
    "currency": "TRY",
    "marketState": "REGULAR",
    "lastUpdated": "2026-01-03T14:30:00Z"
  }
}

Response (404):
{
  "success": false,
  "error": {
    "symbol": "INVALID",
    "error": "Symbol not found",
    "code": "NOT_FOUND"
  }
}
```

---

### Phase 3: React Hook [Priority: HIGH]
**Timeline**: 1 hour
**Dependencies**: Phase 2 complete

#### Tasks
| ID | Task | Est. | Description |
|----|------|------|-------------|
| P3-T1 | Create useLivePrice hook | 45m | Fetch, loading, error states |
| P3-T2 | Add auto-refresh option | 15m | Optional polling interval |

#### Deliverables
- [ ] `lib/hooks/use-live-price.ts` - React hook

#### Hook Interface

```typescript
interface UseLivePriceOptions {
  refreshInterval?: number; // ms, default: no auto-refresh
  enabled?: boolean;        // default: true
}

interface UseLivePriceResult {
  price: LivePrice | null;
  loading: boolean;
  error: PriceError | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

function useLivePrice(
  symbol: string,
  currency: string,
  options?: UseLivePriceOptions
): UseLivePriceResult;
```

---

### Phase 4: UI Updates [Priority: HIGH]
**Timeline**: 2 hours
**Dependencies**: Phase 3 complete

#### Tasks
| ID | Task | Est. | Description |
|----|------|------|-------------|
| P4-T1 | Update asset detail page | 1h | Add new price cards |
| P4-T2 | Create PriceCard component | 30m | Reusable price display |
| P4-T3 | Update metrics calculations | 30m | Use live price for unrealized G/L |

#### UI Changes

**Before:**
```
┌─────────────┬─────────────────┬─────────────┐
│ Quantity    │ Avg Buy Price   │ Total Value │  ← Confusing
└─────────────┴─────────────────┴─────────────┘
```

**After:**
```
┌─────────────┬─────────────────┬──────────────────┬──────────────────┐
│ Quantity    │ Cost Basis      │ Current Price    │ Market Value     │
│ 18          │ $2,755.08       │ $236.00          │ $4,248.00        │
│             │ ($153.06/share) │ ▲ +$5.50 (+2.3%) │                  │
└─────────────┴─────────────────┴──────────────────┴──────────────────┘

┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│ Total Invested   │ Realized G/L     │ Unrealized G/L   │ Total G/L        │
│ $2,755.08        │ +$0.00           │ +$1,492.92       │ +$1,492.92       │
│                  │                  │ (+54.2%)         │ (+54.2%)         │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘
```

---

### Phase 5: Polish & Error Handling [Priority: MEDIUM]
**Timeline**: 1.5 hours
**Dependencies**: Phase 4 complete

#### Tasks
| ID | Task | Est. | Description |
|----|------|------|-------------|
| P5-T1 | Loading states | 20m | Skeleton loaders for price cards |
| P5-T2 | Error states | 20m | Graceful fallback when API fails |
| P5-T3 | Refresh button | 20m | Manual price refresh |
| P5-T4 | Last updated time | 15m | Show when price was fetched |
| P5-T5 | Final testing | 15m | E2E and manual tests |

#### Deliverables
- [ ] Loading skeletons for price cards
- [ ] Error state with retry button
- [ ] "Last updated: X minutes ago" display
- [ ] Manual refresh button

---

## Risk Assessment

### Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Yahoo Finance API changes | Low | High | Abstract behind service layer, easy to swap |
| Rate limiting (2000/hr) | Medium | Medium | 5-min cache, batch requests future |
| Invalid BIST symbols | Low | Low | Graceful fallback to cost-only view |
| Weekend/holiday data | Low | Low | Show "Market Closed" badge |

### Dependencies
| Dependency | Risk | Contingency |
|------------|------|-------------|
| Yahoo Finance API | Medium | Alpha Vantage (500 req/day free) |
| Network connectivity | Low | Show cached price with timestamp |

## Resource Requirements

### Development Team
- **Full-Stack Developer**: 1 developer (solo project)
- **Estimated Time**: 8-10 hours total

### Infrastructure
- **Development**: Local Next.js dev server
- **Production**: Existing Vercel/hosting
- **No additional infrastructure needed**

## Success Metrics
| Metric | Target |
|--------|--------|
| Price fetch latency | < 2 seconds |
| Cache hit rate | > 80% |
| API error rate | < 1% |
| Test coverage | > 85% |

## Task Summary

| Phase | Tasks | Est. Time | Priority |
|-------|-------|-----------|----------|
| Phase 1 | Core Infrastructure | 2h | HIGH |
| Phase 2 | API Endpoint | 1.5h | HIGH |
| Phase 3 | React Hook | 1h | HIGH |
| Phase 4 | UI Updates | 2h | HIGH |
| Phase 5 | Polish & Errors | 1.5h | MEDIUM |
| **Total** | **12 tasks** | **8 hours** | |

## Definition of Done
- [x] Yahoo Finance integration working
- [x] BIST stocks using .IS suffix
- [x] US stocks working without suffix
- [x] Price caching with 5-min TTL
- [x] Asset page shows Current Price & Market Value
- [x] Unrealized G/L calculated from live price
- [x] Loading and error states handled
- [x] Unit tests for price service
- [x] Integration tests for API endpoint
- [x] Documentation updated

## Additional Notes

### Yahoo Finance API Details
```
Endpoint: https://query1.finance.yahoo.com/v8/finance/chart/{symbol}
Parameters:
  - interval: 1d (daily)
  - range: 1d (last day)
  
Response structure:
{
  "chart": {
    "result": [{
      "meta": {
        "regularMarketPrice": 236.00,
        "previousClose": 230.50,
        "currency": "USD",
        "marketState": "REGULAR"
      }
    }]
  }
}
```

### Symbol Examples
| Asset | Currency | Yahoo Symbol |
|-------|----------|--------------|
| AAPL | USD | AAPL |
| THYAO | TRY | THYAO.IS |
| BIMAS | TRY | BIMAS.IS |
| SAP | EUR | SAP.DE |
