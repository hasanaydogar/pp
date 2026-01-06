# Task Breakdown: Nakit ve Temettü Modülü Geliştirmesi

## Metadata
- **Feature ID**: 015-cash-dividend-enhancement
- **Plan Reference**: plan-001.md
- **Total Tasks**: 26
- **Estimated Duration**: 14.5 saat
- **Created**: 2026-01-03

---

## 📊 Progress Tracking

```yaml
status:
  total: 26
  completed: 26
  in_progress: 0
  blocked: 0
  
metrics:
  completion_percentage: 100%
  completed_at: 2026-01-03
```

---

## 🔄 Dependency Graph

```
Phase 1 (Parallel): T001, T002 → T003, T004
         ↓
Phase 2: T005 → T006 → T007, T008 (Parallel) → T009
         ↓
Phase 3: T010 → T011 → T012 → T013
         ↓
Phase 4 (Parallel): T014, T015 → T016 → T017, T018 (Parallel)
         ↓
Phase 5 (Parallel): T019 → T020, T021 (Parallel) → T022
         ↓
Phase 6: T023 → T024 → T025 → T026
```

---

## 📋 Task List

### Phase 1: Temettü API & Servis (3 saat)

---

#### T001: Yahoo Finance Dividend Service
```yaml
id: T001
status: pending
type: service
priority: HIGH
estimate: 45 min
dependencies: []
parallel: true
```

**Dosya**: `lib/services/dividend-service.ts` (Yeni)

**Açıklama**: Yahoo Finance'den temettü bilgisi çeken servis.

**Kod**:
```typescript
interface DividendInfo {
  symbol: string;
  exDividendDate: string | null;
  paymentDate: string | null;
  dividendRate: number; // Yıllık temettü
  dividendYield: number; // Temettü verimi (%)
  forwardDividend: number; // Sonraki temettü
  lastDividend: number; // Son temettü
}

export async function fetchDividendInfo(
  symbol: string,
  currency: string
): Promise<DividendInfo | null>

// Yahoo Finance endpoint:
// GET /v10/finance/quoteSummary/{symbol}?modules=calendarEvents,summaryDetail
```

**Acceptance Criteria**:
- [ ] `fetchDividendInfo(symbol, currency)` fonksiyonu çalışıyor
- [ ] `calendarEvents` modülü parse ediliyor
- [ ] `summaryDetail` modülü parse ediliyor
- [ ] Cache mekanizması var (5 dk TTL)
- [ ] BIST hisseleri için `.IS` suffix ekleniyor

---

#### T002: Dividend Types Güncelleme
```yaml
id: T002
status: pending
type: types
priority: HIGH
estimate: 20 min
dependencies: []
parallel: true
```

**Dosya**: `lib/types/dividend.ts` (Güncelleme)

**Açıklama**: Temettü takvimi için yeni TypeScript tipleri.

**Yeni Tipler**:
```typescript
export interface UpcomingDividend {
  symbol: string;
  assetId: string;
  exDividendDate: string;
  paymentDate: string;
  dividendPerShare: number;
  quantity: number;
  expectedTotal: number; // quantity × dividendPerShare
  currency: string;
}

export interface DividendCalendarItem {
  date: string;
  dividends: UpcomingDividend[];
  totalExpected: number;
}

export interface DividendCalendarResponse {
  upcoming: UpcomingDividend[];
  byMonth: Record<string, DividendCalendarItem[]>;
  totalExpected90Days: number;
  totalExpectedYearly: number;
}
```

**Acceptance Criteria**:
- [ ] UpcomingDividend interface oluşturuldu
- [ ] DividendCalendarItem interface oluşturuldu
- [ ] DividendCalendarResponse interface oluşturuldu
- [ ] Export'lar düzgün

---

#### T003: Temettü Takvimi API
```yaml
id: T003
status: pending
type: api
priority: HIGH
estimate: 40 min
dependencies: [T001, T002]
parallel: false
```

**Dosya**: `app/api/dividends/calendar/route.ts` (Yeni)

**Açıklama**: Portföy bazlı temettü takvimi endpoint'i.

**Endpoint**: `GET /api/dividends/calendar?portfolioId={id}`

**Mantık**:
1. Portföydeki tüm hisseleri getir
2. Her hisse için `fetchDividendInfo()` çağır (Promise.allSettled)
3. Hisse adedi × temettü = beklenen tutar hesapla
4. Tarihe göre sırala ve grupla

**Response**:
```typescript
{
  upcoming: UpcomingDividend[],
  byMonth: { "2026-01": [...], "2026-02": [...] },
  totalExpected90Days: 1500,
  totalExpectedYearly: 6000
}
```

**Acceptance Criteria**:
- [ ] Endpoint çalışıyor
- [ ] Paralel fetch yapılıyor
- [ ] Beklenen temettü hesaplanıyor
- [ ] Tarihe göre gruplama yapılıyor

---

#### T004: Yaklaşan Temettüler API
```yaml
id: T004
status: pending
type: api
priority: MEDIUM
estimate: 25 min
dependencies: [T001, T002]
parallel: false
```

**Dosya**: `app/api/dividends/upcoming/route.ts` (Yeni)

**Açıklama**: Yaklaşan temettüleri listeleyen endpoint.

**Endpoint**: `GET /api/dividends/upcoming?portfolioId={id}&days=90`

**Response**:
```typescript
{
  dividends: UpcomingDividend[],
  count: number,
  totalExpected: number
}
```

**Acceptance Criteria**:
- [ ] Endpoint çalışıyor
- [ ] Tarih filtresi çalışıyor
- [ ] En yakın önce sıralı

---

### Phase 2: Database & Nakit-Transaction Entegrasyonu (2.5 saat)

---

#### T005: Database Migration
```yaml
id: T005
status: pending
type: database
priority: HIGH
estimate: 25 min
dependencies: []
parallel: false
```

**Dosya**: `supabase/migrations/20260103_cash_dividend_enhancement.sql`

**SQL**:
```sql
-- dividends tablosuna yeni alanlar
ALTER TABLE dividends 
  ADD COLUMN IF NOT EXISTS source VARCHAR(10) DEFAULT 'MANUAL',
  ADD COLUMN IF NOT EXISTS ex_dividend_date DATE,
  ADD COLUMN IF NOT EXISTS yahoo_event_id VARCHAR(50);

-- Unique constraint for duplicate prevention
CREATE UNIQUE INDEX IF NOT EXISTS idx_dividends_unique_event 
  ON dividends(asset_id, payment_date) 
  WHERE yahoo_event_id IS NULL;

-- cash_transactions tablosuna yeni alanlar
ALTER TABLE cash_transactions 
  ADD COLUMN IF NOT EXISTS related_transaction_id UUID REFERENCES transactions(id),
  ADD COLUMN IF NOT EXISTS related_asset_id UUID REFERENCES assets(id),
  ADD COLUMN IF NOT EXISTS related_symbol VARCHAR(20);

-- Index for cash flow queries
CREATE INDEX IF NOT EXISTS idx_cash_transactions_date 
  ON cash_transactions(cash_position_id, transaction_date DESC);
```

**Acceptance Criteria**:
- [ ] Migration dosyası oluşturuldu
- [ ] `dividends` tablosuna yeni alanlar eklendi
- [ ] `cash_transactions` tablosuna yeni alanlar eklendi
- [ ] Index'ler oluşturuldu

---

#### T006: Cash Service
```yaml
id: T006
status: pending
type: service
priority: HIGH
estimate: 35 min
dependencies: [T005]
parallel: false
```

**Dosya**: `lib/services/cash-service.ts` (Yeni)

**Fonksiyonlar**:
```typescript
export async function createCashTransactionForAsset(
  portfolioId: string,
  assetSymbol: string,
  transactionId: string,
  assetId: string,
  type: 'BUY' | 'SELL',
  amount: number,
  date: string,
  currency: string
): Promise<void>

export async function updateCashBalance(
  portfolioId: string,
  currency: string,
  amount: number // positive = add, negative = subtract
): Promise<void>

export async function getCashFlowData(
  portfolioId: string,
  period: string
): Promise<CashFlowData[]>
```

**Acceptance Criteria**:
- [ ] `createCashTransactionForAsset()` çalışıyor
- [ ] `updateCashBalance()` çalışıyor
- [ ] `getCashFlowData()` çalışıyor

---

#### T007: Transaction API - Hisse Alımında Nakit Düş
```yaml
id: T007
status: pending
type: api
priority: HIGH
estimate: 30 min
dependencies: [T006]
parallel: true
```

**Dosya**: `app/api/assets/[id]/transactions/route.ts` (Güncelleme)

**Değişiklik**: POST handler içinde BUY işlemi sonrası:

```typescript
// After successful transaction insert
if (type === 'BUY') {
  const totalCost = quantity * price;
  await createCashTransactionForAsset(
    portfolioId,
    symbol,
    transaction.id,
    assetId,
    'BUY',
    -totalCost, // Negative = cash outflow
    date,
    currency
  );
}
```

**Acceptance Criteria**:
- [ ] BUY işleminde `cash_transactions` kaydı oluşuyor
- [ ] `cash_positions` bakiyesi düşüyor
- [ ] Transaction ID ile ilişkilendiriliyor

---

#### T008: Transaction API - Hisse Satışında Nakit Ekle
```yaml
id: T008
status: pending
type: api
priority: HIGH
estimate: 25 min
dependencies: [T006]
parallel: true
```

**Dosya**: `app/api/assets/[id]/transactions/route.ts` (Güncelleme)

**Değişiklik**: POST handler içinde SELL işlemi sonrası:

```typescript
// After successful transaction insert
if (type === 'SELL') {
  const totalProceeds = quantity * price;
  await createCashTransactionForAsset(
    portfolioId,
    symbol,
    transaction.id,
    assetId,
    'SELL',
    totalProceeds, // Positive = cash inflow
    date,
    currency
  );
}
```

**Acceptance Criteria**:
- [ ] SELL işleminde `cash_transactions` kaydı oluşuyor
- [ ] `cash_positions` bakiyesi artıyor
- [ ] Transaction ID ile ilişkilendiriliyor

---

#### T009: Yetersiz Nakit Uyarısı
```yaml
id: T009
status: pending
type: component
priority: MEDIUM
estimate: 20 min
dependencies: [T007, T008]
parallel: false
```

**Dosya**: `components/transactions/transaction-form.tsx` (Güncelleme)

**Değişiklik**: BUY işleminde nakit bakiyesi kontrol et ve uyarı göster.

```tsx
{type === 'BUY' && totalCost > cashBalance && (
  <Alert color="amber">
    <ExclamationTriangleIcon className="h-5 w-5" />
    <span>Nakit bakiyesi yetersiz (₺{cashBalance}). İşlem yine de kaydedilecek.</span>
  </Alert>
)}
```

**Acceptance Criteria**:
- [ ] Yetersiz nakit durumunda uyarı gösteriliyor
- [ ] İşlem engellenmeden devam ediyor
- [ ] Uyarı UI'da görünür

---

### Phase 3: Otomatik Temettü Kaydı (2 saat)

---

#### T010: Auto-Dividend Service
```yaml
id: T010
status: pending
type: service
priority: HIGH
estimate: 40 min
dependencies: [T001, T006]
parallel: false
```

**Dosya**: `lib/services/auto-dividend-service.ts` (Yeni)

**Fonksiyonlar**:
```typescript
export async function checkAndRecordDividends(
  portfolioId: string
): Promise<{
  recorded: number;
  skipped: number;
  errors: string[];
}>

// Logic:
// 1. Portföydeki tüm hisseleri getir
// 2. Her hisse için Yahoo'dan temettü bilgisi al
// 3. Ex-dividend date <= bugün kontrolü
// 4. DB'de kayıt var mı kontrol et
// 5. Yoksa: dividend + cash_transaction oluştur
```

**Acceptance Criteria**:
- [ ] `checkAndRecordDividends()` çalışıyor
- [ ] Ex-dividend tarihi kontrolü yapılıyor
- [ ] Kayıt yoksa oluşturuluyor
- [ ] Sonuç raporu dönüyor

---

#### T011: Duplicate Kontrolü
```yaml
id: T011
status: pending
type: service
priority: HIGH
estimate: 20 min
dependencies: [T010]
parallel: false
```

**Dosya**: `lib/services/auto-dividend-service.ts` (Güncelleme)

**Mantık**:
```typescript
async function isDividendAlreadyRecorded(
  assetId: string,
  paymentDate: string,
  yahooEventId?: string
): Promise<boolean> {
  // Check by yahoo_event_id first (if available)
  // Otherwise check by (asset_id, payment_date)
}
```

**Acceptance Criteria**:
- [ ] `yahoo_event_id` ile kontrol yapılıyor
- [ ] `(asset_id, payment_date)` ile fallback kontrol
- [ ] Duplicate kayıt önleniyor

---

#### T012: Temettü → Nakit Entegrasyonu
```yaml
id: T012
status: pending
type: service
priority: HIGH
estimate: 25 min
dependencies: [T010, T011]
parallel: false
```

**Dosya**: `lib/services/auto-dividend-service.ts` (Güncelleme)

**Mantık**: Temettü kaydı oluşturulduğunda otomatik nakit hareketi.

```typescript
// Inside recordDividend function:
await supabase.from('dividends').insert({
  asset_id: assetId,
  portfolio_id: portfolioId,
  gross_amount: grossAmount,
  net_amount: netAmount,
  tax_amount: taxAmount,
  payment_date: paymentDate,
  source: 'AUTO',
  ex_dividend_date: exDividendDate,
  yahoo_event_id: yahooEventId
});

// Also create cash transaction
await createCashTransactionForDividend(
  portfolioId,
  assetId,
  symbol,
  netAmount,
  paymentDate,
  currency
);
```

**Acceptance Criteria**:
- [ ] Temettü kaydı ile birlikte nakit hareketi oluşuyor
- [ ] `source: 'AUTO'` olarak işaretleniyor
- [ ] Nakit bakiyesi artıyor

---

#### T013: Sayfa Yüklemesinde Otomatik Kontrol
```yaml
id: T013
status: pending
type: integration
priority: MEDIUM
estimate: 20 min
dependencies: [T010, T011, T012]
parallel: false
```

**Dosya**: `app/(protected)/p/[slug]/cash/page.tsx` (Güncelleme)

**Değişiklik**: useEffect içinde otomatik temettü kontrolü.

```typescript
const [autoRecordStatus, setAutoRecordStatus] = useState<{
  checking: boolean;
  recorded: number;
} | null>(null);

useEffect(() => {
  if (portfolioId) {
    setAutoRecordStatus({ checking: true, recorded: 0 });
    
    fetch(`/api/dividends/auto-record?portfolioId=${portfolioId}`, {
      method: 'POST'
    })
      .then(res => res.json())
      .then(data => {
        setAutoRecordStatus({ checking: false, recorded: data.recorded });
        if (data.recorded > 0) {
          // Refresh data
          refetchData();
        }
      });
  }
}, [portfolioId]);
```

**Acceptance Criteria**:
- [ ] Sayfa yüklendiğinde otomatik kontrol yapılıyor
- [ ] Loading state gösteriliyor
- [ ] Yeni kayıt varsa veriler yenileniyor

---

### Phase 4: Nakit Akış Grafiği & UI (3 saat)

---

#### T014: Cash Flow API
```yaml
id: T014
status: pending
type: api
priority: MEDIUM
estimate: 35 min
dependencies: [T005, T006]
parallel: true
```

**Dosya**: `app/api/portfolios/[id]/cash/flow/route.ts` (Yeni)

**Endpoint**: `GET /api/portfolios/[id]/cash/flow?period=30d`

**Response**:
```typescript
{
  data: CashFlowData[],
  summary: {
    startBalance: number,
    endBalance: number,
    totalDeposits: number,
    totalWithdrawals: number,
    totalDividends: number,
    totalPurchases: number,
    totalSales: number
  }
}
```

**Acceptance Criteria**:
- [ ] Endpoint çalışıyor
- [ ] Period filtresi çalışıyor
- [ ] Günlük kümülatif bakiye hesaplanıyor
- [ ] Kategori bazlı özet dönüyor

---

#### T015: useCashFlow Hook
```yaml
id: T015
status: pending
type: hook
priority: MEDIUM
estimate: 25 min
dependencies: [T014]
parallel: true
```

**Dosya**: `lib/hooks/use-cash-flow.ts` (Yeni)

**Interface**:
```typescript
interface CashFlowData {
  date: string;
  balance: number;
  change: number;
  deposits: number;
  withdrawals: number;
  dividends: number;
  purchases: number;
  sales: number;
}

export function useCashFlow(portfolioId: string | null, period: string) {
  return {
    data: CashFlowData[],
    summary: CashFlowSummary,
    loading: boolean,
    error: Error | null,
    refetch: () => void
  };
}
```

**Acceptance Criteria**:
- [ ] Hook çalışıyor
- [ ] Period değişince refetch yapılıyor
- [ ] Loading ve error states var

---

#### T016: Cash Flow Chart Component
```yaml
id: T016
status: pending
type: component
priority: MEDIUM
estimate: 45 min
dependencies: [T015]
parallel: false
```

**Dosya**: `components/cash/cash-flow-chart.tsx` (Yeni)

**Props**:
```typescript
interface CashFlowChartProps {
  data: CashFlowData[];
  period: Period;
  currency: string;
  onPeriodChange: (period: Period) => void;
}
```

**Özellikler**:
- Recharts AreaChart (bakiye çizgisi)
- Bar overlay (günlük değişim)
- Custom tooltip (o günün detayları)
- Period selector entegrasyonu
- Responsive tasarım

**Acceptance Criteria**:
- [ ] Grafik çiziliyor
- [ ] Tooltip detaylı
- [ ] Period seçimi çalışıyor
- [ ] Mobile responsive

---

#### T017: Transactions List Güncelleme
```yaml
id: T017
status: pending
type: component
priority: MEDIUM
estimate: 30 min
dependencies: [T014]
parallel: true
```

**Dosya**: `components/cash/cash-transactions-list.tsx` (Güncelleme)

**Yeni Özellikler**:
- Kategori badge'leri (renkli: yeşil=gelir, kırmızı=gider)
- İlgili hisse sembolü gösterimi
- Running balance kolonu
- Transaction ID ile linked işlem gösterimi

**Acceptance Criteria**:
- [ ] Kategori badge'leri renkli
- [ ] Hisse sembolü görünüyor
- [ ] Running balance hesaplanıyor

---

#### T018: Kategori Filtreleme
```yaml
id: T018
status: pending
type: component
priority: LOW
estimate: 25 min
dependencies: [T017]
parallel: true
```

**Dosya**: `components/cash/cash-transactions-list.tsx` (Güncelleme)

**Filter Butonları**:
- Tümü | Temettü | Alış | Satış | Deposit | Withdraw

```tsx
const CATEGORIES = [
  { key: 'ALL', label: 'Tümü' },
  { key: 'DIVIDEND', label: 'Temettü', color: 'green' },
  { key: 'ASSET_PURCHASE', label: 'Alış', color: 'red' },
  { key: 'ASSET_SALE', label: 'Satış', color: 'green' },
  { key: 'DEPOSIT', label: 'Deposit', color: 'blue' },
  { key: 'WITHDRAW', label: 'Çekim', color: 'amber' },
];
```

**Acceptance Criteria**:
- [ ] Filter butonları görünüyor
- [ ] Tıklanınca liste filtreleniyor
- [ ] Seçili buton vurgulu

---

### Phase 5: Temettü Takvimi UI (2.5 saat)

---

#### T019: useDividendCalendar Hook
```yaml
id: T019
status: pending
type: hook
priority: MEDIUM
estimate: 25 min
dependencies: [T003, T004]
parallel: false
```

**Dosya**: `lib/hooks/use-dividend-calendar.ts` (Yeni)

**Interface**:
```typescript
export function useDividendCalendar(portfolioId: string | null) {
  return {
    upcoming: UpcomingDividend[],
    byMonth: Record<string, DividendCalendarItem[]>,
    totalExpected90Days: number,
    loading: boolean,
    error: Error | null,
    refetch: () => void
  };
}
```

**Acceptance Criteria**:
- [ ] Hook çalışıyor
- [ ] Yaklaşan temettüler getiriliyor
- [ ] Loading state var

---

#### T020: Upcoming Dividends Component
```yaml
id: T020
status: pending
type: component
priority: MEDIUM
estimate: 35 min
dependencies: [T019]
parallel: true
```

**Dosya**: `components/dividends/upcoming-dividends.tsx` (Yeni)

**Props**:
```typescript
interface UpcomingDividendsProps {
  dividends: UpcomingDividend[];
  currency: string;
  maxItems?: number;
}
```

**Özellikler**:
- Liste görünümü
- Hisse, tarih, beklenen tutar
- En yakın önce sıralı
- "Tümünü Gör" butonu

**Acceptance Criteria**:
- [ ] Liste görünüyor
- [ ] Tarih formatı doğru
- [ ] Beklenen tutar hesaplanmış

---

#### T021: Calendar View Component
```yaml
id: T021
status: pending
type: component
priority: MEDIUM
estimate: 45 min
dependencies: [T019]
parallel: true
```

**Dosya**: `components/dividends/dividend-calendar-view.tsx` (Yeni)

**Props**:
```typescript
interface DividendCalendarViewProps {
  byMonth: Record<string, DividendCalendarItem[]>;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  currency: string;
}
```

**Özellikler**:
- Aylık takvim grid
- Temettü günleri işaretli (yeşil nokta)
- Tıklayınca o günün temettüleri popup
- Ay değiştirme butonları

**Acceptance Criteria**:
- [ ] Takvim grid görünüyor
- [ ] Temettü günleri işaretli
- [ ] Tıklama popup çalışıyor
- [ ] Ay navigasyonu çalışıyor

---

#### T022: Summary Card - Beklenen Temettü
```yaml
id: T022
status: pending
type: component
priority: MEDIUM
estimate: 20 min
dependencies: [T019]
parallel: false
```

**Dosya**: `components/cash/cash-summary-cards.tsx` (Güncelleme)

**Değişiklik**: "Beklenen Temettü" kartı ekle.

```tsx
<div className="...">
  <div className="flex items-center gap-2 text-sm text-zinc-500">
    <CalendarDaysIcon className="h-4 w-4" />
    <span>Beklenen (90 gün)</span>
  </div>
  <div className="text-2xl font-semibold text-green-600">
    {formatCurrency(expectedDividend90Days, currency)}
  </div>
</div>
```

**Acceptance Criteria**:
- [ ] Yeni kart görünüyor
- [ ] 90 günlük beklenen temettü hesaplanmış
- [ ] Renk ve ikon doğru

---

### Phase 6: Sayfa Entegrasyonu & Polish (1.5 saat)

---

#### T023: Cash Page Tam Entegrasyon
```yaml
id: T023
status: pending
type: integration
priority: HIGH
estimate: 35 min
dependencies: [T016, T020, T021, T022]
parallel: false
```

**Dosya**: `app/(protected)/p/[slug]/cash/page.tsx` (Güncelleme)

**Entegrasyon**:
1. `useCashFlow` hook ekle
2. `useDividendCalendar` hook ekle
3. `CashFlowChart` component ekle
4. `UpcomingDividends` component ekle
5. `DividendCalendarView` component ekle
6. Layout düzenle (spec'teki UI'a göre)

**Acceptance Criteria**:
- [ ] Tüm componentler entegre
- [ ] Layout spec'e uygun
- [ ] Responsive çalışıyor

---

#### T024: Error Handling
```yaml
id: T024
status: pending
type: enhancement
priority: MEDIUM
estimate: 20 min
dependencies: [T023]
parallel: false
```

**Dosya**: `app/(protected)/p/[slug]/cash/page.tsx` (Güncelleme)

**Error Handling**:
- Yahoo API fail durumu
- Fallback UI göster
- Retry mekanizması

```tsx
{dividendError && (
  <Alert color="amber">
    <ExclamationTriangleIcon />
    <span>Temettü verileri yüklenemedi.</span>
    <Button onClick={refetchDividends}>Tekrar Dene</Button>
  </Alert>
)}
```

**Acceptance Criteria**:
- [ ] API hatası durumunda uyarı gösteriliyor
- [ ] Retry butonu çalışıyor
- [ ] Fallback UI var

---

#### T025: Empty States
```yaml
id: T025
status: pending
type: ui
priority: LOW
estimate: 15 min
dependencies: [T023]
parallel: true
```

**Dosyalar**: Çeşitli component'ler

**Empty States**:
- Yaklaşan temettü yoksa: "Önümüzdeki 90 günde temettü beklenmemektedir"
- Nakit hareketi yoksa: "Henüz nakit hareketi yok"
- Takvimde temettü yoksa: "Bu ay temettü yok"

**Acceptance Criteria**:
- [ ] Empty state mesajları var
- [ ] İkonlar ve stiller uygun

---

#### T026: TypeScript Check
```yaml
id: T026
status: pending
type: testing
priority: HIGH
estimate: 15 min
dependencies: [T023, T024, T025]
parallel: false
```

**Komut**: `npx tsc --noEmit`

**Acceptance Criteria**:
- [ ] Sıfır TypeScript hatası
- [ ] Tüm tipler doğru

---

## 🤖 AI Execution Strategy

### Parallel Tasks (aynı anda çalışılabilir):
- **Grup 1**: T001, T002 (Bağımsız, service ve types)
- **Grup 2**: T007, T008 (T006'ya bağlı, paralel)
- **Grup 3**: T014, T015 (Bağımsız API ve hook)
- **Grup 4**: T017, T018 (T014'e bağlı, paralel)
- **Grup 5**: T020, T021 (T019'a bağlı, paralel)
- **Grup 6**: T024, T025 (T023'e bağlı, paralel)

### Sequential Tasks (sırayla tamamlanmalı):
- T001/T002 → T003 → T004
- T005 → T006 → T007/T008 → T009
- T010 → T011 → T012 → T013
- T014/T015 → T016 → T017/T018
- T019 → T020/T021 → T022
- T023 → T024/T025 → T026

---

## ✅ Definition of Done

- [ ] Tüm 26 task tamamlandı
- [ ] Yahoo Finance'den temettü takvimi çekiliyor
- [ ] Portföydeki hisse adedi ile beklenen temettü hesaplanıyor
- [ ] Temettü tarihi gelince otomatik kayıt oluşuyor
- [ ] Hisse alımında nakit otomatik düşüyor
- [ ] Hisse satışında nakit otomatik ekleniyor
- [ ] Nakit akış grafiği çalışıyor
- [ ] Kategori filtreleme çalışıyor
- [ ] Temettü takvimi takvim formatında gösteriliyor
- [ ] TypeScript hatasız
- [ ] Mobile responsive
