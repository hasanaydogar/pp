# Specification: Asset Detail Page with Live Market Prices

<!-- FEATURE_DIR: 008-asset-live-prices -->
<!-- FEATURE_ID: 008 -->
<!-- SPEC_NUMBER: 001 -->
<!-- STATUS: draft -->
<!-- CREATED: 2026-01-03 -->

## Description

Asset detay sayfasını canlı piyasa verileriyle zenginleştirme. Şu an "Total Value" alanı sadece alış maliyetini (quantity × average_buy_price) gösteriyor. Bu feature ile:

1. **Güncel piyasa fiyatı** gösterilecek (Yahoo Finance API)
2. **Gerçek piyasa değeri** hesaplanacak (quantity × current_price)
3. **Maliyet vs Değer karşılaştırması** yapılacak
4. **Unrealized Gain/Loss** doğru hesaplanacak
5. BIST hisseleri için **.IS** suffix'i otomatik eklenecek (örn: THYAO → THYAO.IS)

## Current State Analysis

Mevcut asset sayfasında:
- `Quantity`: 18 adet
- `Average Buy Price`: $153.06 (alış fiyatı ortalaması)
- `Total Value`: $2,755.00 → **BU ASLINDA MALİYET, DEĞER DEĞİL**
- `Unrealized Gain/Loss`: +$1,500.00 → **Bu değer nereden geliyor?** (Muhtemelen mock veya yanlış hesap)

## Requirements

### Functional Requirements

#### Must Have (P0)
- [x] Yahoo Finance API entegrasyonu ile güncel fiyat çekme
- [x] BIST hisseleri için otomatik `.IS` suffix ekleme (THYAO → THYAO.IS)
- [x] US hisseleri direkt sembol kullanma (AAPL → AAPL)
- [x] Asset sayfasında **Current Price** alanı ekleme
- [x] Asset sayfasında **Market Value** alanı ekleme (quantity × current_price)
- [x] **Cost Basis** alanını "Total Value" yerine gösterme
- [x] Doğru **Unrealized Gain/Loss** hesaplama: (current_price - avg_buy_price) × quantity
- [x] Fiyat verisi yokken graceful fallback (sadece maliyet göster)
- [x] Loading state gösterimi (fiyat yüklenirken)

#### Should Have (P1)
- [ ] Fiyat cache mekanizması (Redis veya in-memory, 5dk TTL)
- [ ] Günlük değişim gösterimi (daily change %, daily change amount)
- [ ] Son güncelleme zamanı gösterimi
- [ ] Fiyat yenileme butonu (manual refresh)

#### Could Have (P2)
- [ ] Mini sparkline chart (son 7 gün)
- [ ] 52-week high/low gösterimi
- [ ] Market status (open/closed) gösterimi
- [ ] Crypto desteği (BTC-USD, ETH-USD formatı)

#### Won't Have (This Release)
- [ ] Real-time WebSocket fiyat akışı
- [ ] Push notifications for price alerts
- [ ] InvestingPro entegrasyonu (API yok)

### Non-Functional Requirements

- **Performance**: Fiyat API çağrısı < 2 saniye, cache hit < 50ms
- **Reliability**: API failure durumunda sayfa çalışmaya devam etmeli (graceful degradation)
- **Rate Limiting**: Yahoo Finance rate limit'e uyum (2000 req/saat)
- **Security**: API key'ler environment variable'da saklanmalı

## User Stories

### US-001: Güncel Fiyat Görüntüleme
**As a** portfolio owner  
**I want to** see the current market price of my assets  
**So that** I can understand their real-time value  

**Acceptance Criteria:**
- [x] Given I am on the asset detail page
- [x] When the page loads
- [x] Then I see the current market price with currency symbol
- [x] And I see a loading indicator while price is being fetched
- [x] And if price fetch fails, I see the cost basis with a "price unavailable" note

### US-002: Gerçek Piyasa Değeri Görme
**As a** portfolio owner  
**I want to** see the actual market value of my holdings  
**So that** I can track my portfolio's real worth  

**Acceptance Criteria:**
- [x] Given I have 18 shares of AAPL at avg price $153.06
- [x] When current AAPL price is $236.00
- [x] Then Market Value shows $4,248.00 (18 × $236)
- [x] And Cost Basis shows $2,755.08 (18 × $153.06)
- [x] And Unrealized Gain shows +$1,492.92 (+54.2%)

### US-003: BIST Hisse Fiyatları
**As a** Turkish investor  
**I want to** see live prices for BIST stocks  
**So that** I can track my Turkish portfolio  

**Acceptance Criteria:**
- [x] Given I have THYAO in my portfolio
- [x] When fetching price from Yahoo Finance
- [x] Then the system uses THYAO.IS as the ticker symbol
- [x] And displays price in TRY currency

## Technical Specifications

### API Integration

**Yahoo Finance API (yfinance alternative for JS):**
```
Endpoint: https://query1.finance.yahoo.com/v8/finance/chart/{symbol}
Method: GET
Parameters:
  - interval: 1d
  - range: 1d
Response: JSON with regularMarketPrice, previousClose, currency
```

**Symbol Mapping:**
| Asset Currency | Symbol Format | Example |
|---------------|---------------|---------|
| TRY | {symbol}.IS | THYAO.IS |
| USD | {symbol} | AAPL |
| EUR | {symbol}.DE or {symbol}.PA | SAP.DE |

### Database Changes

**Option A: No DB changes (recommended for now)**
- Fiyatlar sadece runtime'da fetch edilir
- Cache için Redis veya in-memory Map kullanılır

**Option B: Price history table (future)**
```sql
CREATE TABLE price_history (
  id UUID PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL,
  price DECIMAL(20, 8) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source VARCHAR(50) DEFAULT 'yahoo_finance'
);
```

### New Files

```
lib/
├── services/
│   └── price-service.ts        # Yahoo Finance API client
├── hooks/
│   └── use-live-price.ts       # React hook for live prices
├── utils/
│   └── symbol-mapper.ts        # BIST → .IS suffix logic
└── types/
    └── price.ts                # Price-related types

app/api/
└── prices/
    └── [symbol]/
        └── route.ts            # Price API endpoint with caching
```

### Component Changes

**Asset Detail Page Updates:**
```
Current Layout:
┌─────────────┬─────────────────┬─────────────┐
│ Quantity    │ Avg Buy Price   │ Total Value │ ← WRONG: Shows cost, not value
└─────────────┴─────────────────┴─────────────┘

New Layout:
┌─────────────┬─────────────────┬─────────────┬─────────────┐
│ Quantity    │ Avg Buy Price   │ Current     │ Market      │
│ 18          │ $153.06         │ Price       │ Value       │
│             │                 │ $236.00     │ $4,248.00   │
│             │                 │ +5.2% today │             │
└─────────────┴─────────────────┴─────────────┴─────────────┘

┌─────────────┬─────────────────┬─────────────────┬─────────────┐
│ Cost Basis  │ Realized G/L    │ Unrealized G/L  │ Total G/L   │
│ $2,755.08   │ +$0.00          │ +$1,492.92      │ +$1,492.92  │
│             │                 │ (+54.2%)        │ (+54.2%)    │
└─────────────┴─────────────────┴─────────────────┴─────────────┘
```

## Testing Strategy

### Unit Tests
- Symbol mapper tests (THYAO → THYAO.IS, AAPL → AAPL)
- Price calculation tests (market value, unrealized gain/loss)
- Cache TTL logic tests

### Integration Tests
- Price API endpoint tests (mock Yahoo Finance responses)
- Error handling tests (API timeout, rate limit, invalid symbol)

### E2E Tests
- Asset page with live prices (use test symbols)
- Fallback behavior when API unavailable

## Dependencies

### External APIs
- Yahoo Finance API (free, no API key required for basic quotes)

### Third-party Libraries
- None required (native fetch is sufficient)
- Optional: `node-cache` for in-memory caching

## Implementation Phases

### Phase 1: Core Price Fetching (4 hours)
- Price service with Yahoo Finance integration
- Symbol mapper for BIST stocks
- Basic caching (in-memory Map)

### Phase 2: UI Updates (4 hours)
- Add Current Price and Market Value cards
- Rename "Total Value" to "Cost Basis"
- Update gain/loss calculations

### Phase 3: Polish & Error Handling (4 hours)
- Loading states
- Error states with retry
- Last updated timestamp
- Tests

## Definition of Done

- [x] All P0 requirements implemented
- [x] BIST stocks work with .IS suffix
- [x] US stocks work without suffix
- [x] Unrealized gain/loss calculated correctly
- [x] Loading and error states handled
- [x] Unit tests for price service
- [x] Integration tests for API endpoint
- [x] Code reviewed and approved
- [x] Documentation updated

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Yahoo Finance rate limiting | High | Implement caching with 5-min TTL |
| API structure changes | Medium | Abstract API behind service layer |
| Weekend/holiday no trading | Low | Show last known price with timestamp |
| Invalid symbols | Low | Graceful fallback to cost-only view |

## Additional Notes

- Yahoo Finance API is unofficial but stable and widely used
- For production, consider paid alternatives: Alpha Vantage, Twelve Data
- BIST market hours: 10:00-18:00 Istanbul time (weekdays)
- US market hours: 09:30-16:00 ET (weekdays)
