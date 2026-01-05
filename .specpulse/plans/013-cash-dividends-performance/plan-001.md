# Implementation Plan: Nakit Yönetimi, Temettü Takibi ve Performans Projeksiyonu

## Specification Reference
- **Spec ID**: SPEC-013
- **Spec Version**: 1.0
- **Plan Version**: 1.0
- **Generated**: 2026-01-03
- **Estimated Duration**: 14 saat

---

## 📋 Özet

Bu plan, 2 yeni menü komponenti oluşturmak için gerekli tüm adımları içerir:
1. **Nakit ve Temettü** (`/p/[slug]/cash`) - Nakit hareketleri, temettü takibi
2. **Projeksiyon** (`/p/[slug]/projection`) - Büyüme grafiği, gelir projeksiyonu

---

## 🏗️ Faz 1: Veritabanı ve Tipler (2 saat)

### Hedef
Yeni tablolar, enum güncellemeleri ve TypeScript tipleri.

### Tasks

#### T001: Cash Transaction Type Güncellemesi
**Dosya**: `lib/types/cash.ts`

Mevcut `CashTransactionType` enum'ına yeni tipler ekle:
```typescript
export enum CashTransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  BUY_ASSET = 'BUY_ASSET',
  SELL_ASSET = 'SELL_ASSET',
  DIVIDEND = 'DIVIDEND',
  FEE = 'FEE',
  INTEREST = 'INTEREST',       // Yeni
  TRANSFER_IN = 'TRANSFER_IN', // Yeni
  TRANSFER_OUT = 'TRANSFER_OUT', // Yeni
}
```

#### T002: Dividend Types
**Dosya**: `lib/types/dividend.ts` (Yeni)

```typescript
export enum ReinvestStrategy {
  CASH = 'CASH',
  REINVEST = 'REINVEST',
  CUSTOM = 'CUSTOM',
}

export interface Dividend {
  id: string;
  asset_id: string;
  portfolio_id: string;
  gross_amount: number;
  tax_amount: number;
  net_amount: number;
  currency: string;
  ex_dividend_date?: string | null;
  payment_date: string;
  reinvest_strategy: ReinvestStrategy;
  reinvested_to_asset_id?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface DividendSummary {
  total_yearly: number;
  monthly_average: number;
  dividend_yield: number;
  by_asset: { symbol: string; amount: number }[];
  by_month: { month: string; amount: number }[];
}
```

#### T003: Portfolio Settings Types
**Dosya**: `lib/types/portfolio-settings.ts` (Yeni)

```typescript
export interface PortfolioSettings {
  id: string;
  portfolio_id: string;
  monthly_investment: number;
  investment_day_of_month: number;
  expected_return_rate: number; // 0.10 = %10
  withdrawal_rate: number; // 0.04 = %4
  include_dividends_in_projection: boolean;
  created_at: string;
  updated_at?: string | null;
}

export interface ProjectionResult {
  years: number;
  future_value: number;
  total_invested: number;
  total_returns: number;
  monthly_income: number;
}

export interface ProjectionScenario {
  optimistic: ProjectionResult[];
  base: ProjectionResult[];
  pessimistic: ProjectionResult[];
}
```

#### T004: Database Migration
**Dosya**: `supabase/migrations/20260103_cash_dividends_projection.sql`

```sql
-- 1. Dividends tablosu
CREATE TABLE IF NOT EXISTS dividends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  gross_amount DECIMAL(18,4) NOT NULL,
  tax_amount DECIMAL(18,4) DEFAULT 0,
  net_amount DECIMAL(18,4) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'TRY',
  ex_dividend_date DATE,
  payment_date DATE NOT NULL,
  reinvest_strategy VARCHAR(20) DEFAULT 'CASH',
  reinvested_to_asset_id UUID REFERENCES assets(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Portfolio settings tablosu
CREATE TABLE IF NOT EXISTS portfolio_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL UNIQUE REFERENCES portfolios(id) ON DELETE CASCADE,
  monthly_investment DECIMAL(18,2) DEFAULT 0,
  investment_day_of_month INTEGER DEFAULT 1 CHECK (investment_day_of_month BETWEEN 1 AND 28),
  expected_return_rate DECIMAL(5,4) DEFAULT 0.10,
  withdrawal_rate DECIMAL(5,4) DEFAULT 0.04,
  include_dividends_in_projection BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexler
CREATE INDEX IF NOT EXISTS idx_dividends_asset ON dividends(asset_id);
CREATE INDEX IF NOT EXISTS idx_dividends_portfolio ON dividends(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_dividends_payment_date ON dividends(payment_date);

-- 4. RLS Policies
ALTER TABLE dividends ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their dividends" ON dividends
  FOR ALL USING (
    portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage their portfolio settings" ON portfolio_settings
  FOR ALL USING (
    portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid())
  );
```

### Deliverables
- [ ] `lib/types/cash.ts` güncellendi
- [ ] `lib/types/dividend.ts` oluşturuldu
- [ ] `lib/types/portfolio-settings.ts` oluşturuldu
- [ ] Migration dosyası hazır

---

## 🏗️ Faz 2: API Endpoints (2 saat)

### Hedef
Temettü ve projeksiyon API'leri.

### Tasks

#### T005: Dividends API
**Dosya**: `app/api/portfolios/[id]/dividends/route.ts`

```typescript
// GET - Temettü listesi (filtreleme ile)
// POST - Yeni temettü kaydı
```

#### T006: Dividends Summary API
**Dosya**: `app/api/portfolios/[id]/dividends/summary/route.ts`

```typescript
// GET - Temettü özeti (yıllık, aylık, varlık bazlı)
```

#### T007: Portfolio Settings API
**Dosya**: `app/api/portfolios/[id]/settings/route.ts`

```typescript
// GET - Ayarları getir (yoksa default döndür)
// PUT - Ayarları güncelle/oluştur (upsert)
```

#### T008: Projection API
**Dosya**: `app/api/portfolios/[id]/projection/route.ts`

```typescript
// GET - Projeksiyon hesapla
// Query params: years, include_scenarios
```

#### T009: Cash Transactions List API
**Dosya**: `app/api/portfolios/[id]/cash/transactions/route.ts`

```typescript
// GET - Tüm nakit hareketleri (pagination, filter)
// Mevcut API'yi genişlet
```

### Deliverables
- [ ] `/api/portfolios/[id]/dividends` çalışıyor
- [ ] `/api/portfolios/[id]/dividends/summary` çalışıyor
- [ ] `/api/portfolios/[id]/settings` çalışıyor
- [ ] `/api/portfolios/[id]/projection` çalışıyor

---

## 🏗️ Faz 3: Projeksiyon Hesaplama (1.5 saat)

### Hedef
Bileşik getiri ve senaryo hesaplama fonksiyonları.

### Tasks

#### T010: Projection Calculator
**Dosya**: `lib/utils/projection.ts`

```typescript
interface ProjectionParams {
  currentValue: number;
  monthlyInvestment: number;
  annualReturnRate: number;
  withdrawalRate: number;
  years: number;
}

/**
 * Bileşik getiri hesaplama
 * FV = PV × (1 + r)^n + PMT × [((1 + r)^n - 1) / r]
 */
export function calculateFutureValue(params: ProjectionParams): number;

/**
 * Aylık çekilebilir gelir
 * Monthly Income = (Portfolio Value × Withdrawal Rate) / 12
 */
export function calculateMonthlyIncome(
  portfolioValue: number, 
  withdrawalRate: number
): number;

/**
 * Çoklu periyot projeksiyon
 */
export function generateProjections(
  params: Omit<ProjectionParams, 'years'>,
  periods: number[] // [1, 5, 10, 15, 20, 25]
): ProjectionResult[];

/**
 * Senaryo analizi
 * İyimser: +2%, Baz: default, Kötümser: -2%
 */
export function generateScenarios(
  params: Omit<ProjectionParams, 'years'>,
  periods: number[]
): ProjectionScenario;
```

### Deliverables
- [ ] `lib/utils/projection.ts` oluşturuldu
- [ ] Bileşik getiri doğru hesaplanıyor
- [ ] 3 senaryo üretilebiliyor

---

## 🏗️ Faz 4: Nakit ve Temettü UI (3 saat)

### Hedef
Nakit ve Temettü sayfası komponentleri.

### Tasks

#### T011: Cash Summary Cards
**Dosya**: `components/cash/cash-summary-cards.tsx`

3 kart: Nakit Bakiyesi, Aylık Temettü, Yıllık Temettü

#### T012: Cash Transaction Form (Dialog)
**Dosya**: `components/cash/cash-transaction-dialog.tsx`

- Tip seçimi (DEPOSIT, WITHDRAW, vb.)
- Tutar girişi
- Tarih seçimi
- Not alanı

#### T013: Cash Transactions List
**Dosya**: `components/cash/cash-transactions-list.tsx`

- Filtreleme (tip, tarih aralığı)
- Pagination
- + / - renk kodlaması

#### T014: Dividend Form (Dialog)
**Dosya**: `components/dividends/dividend-dialog.tsx`

- Varlık seçimi (dropdown)
- Brüt tutar → otomatik net hesaplama
- Stopaj oranı
- Ödeme tarihi
- Reinvest stratejisi

#### T015: Dividend Calendar View
**Dosya**: `components/dividends/dividend-calendar.tsx`

- Aylık gruplandırılmış temettüler
- Toplam aylık tutarlar

#### T016: Cash Page Integration
**Dosya**: `app/(protected)/p/[slug]/cash/page.tsx`

Tüm komponentleri birleştir.

### Deliverables
- [ ] Summary kartları çalışıyor
- [ ] Nakit hareket formu çalışıyor
- [ ] Temettü formu çalışıyor
- [ ] Sayfa responsive

---

## 🏗️ Faz 5: Projeksiyon UI (3 saat)

### Hedef
Projeksiyon sayfası ve grafik.

### Tasks

#### T017: Install Recharts
```bash
npm install recharts
```

#### T018: Projection Chart
**Dosya**: `components/projection/projection-chart.tsx`

- Line chart (Area chart alternatifi)
- X: Yıllar (0, 5, 10, 15, 20, 25)
- Y: Portföy değeri
- 3 senaryo çizgisi (opsiyonel)
- Tooltip ile değer gösterimi

```typescript
interface ProjectionChartProps {
  data: ProjectionResult[];
  scenarios?: ProjectionScenario;
  showScenarios?: boolean;
}
```

#### T019: Projection Settings Panel
**Dosya**: `components/projection/projection-settings.tsx`

- Aylık yatırım input
- Beklenen getiri slider/input (%5-15 arası)
- Çekim oranı input (%2-6 arası)
- Temettü dahil toggle

#### T020: Projection Table
**Dosya**: `components/projection/projection-table.tsx`

| Süre | Tahmini Değer | Aylık Gelir | Toplam Yatırım |
|------|--------------|-------------|----------------|
| 5Y   | ₺25.450.000  | ₺84.833     | ₺600.000       |
| ...  | ...          | ...         | ...            |

#### T021: Scenario Comparison
**Dosya**: `components/projection/scenario-comparison.tsx`

- 3 senaryo karşılaştırma kartları
- Renk kodlu (🟢🟡🔴)

#### T022: Projection Page Integration
**Dosya**: `app/(protected)/p/[slug]/projection/page.tsx`

Tüm komponentleri birleştir.

### Deliverables
- [ ] Grafik çalışıyor
- [ ] Ayarlar değiştirilebiliyor
- [ ] Tablo doğru değerler gösteriyor
- [ ] Responsive tasarım

---

## 🏗️ Faz 6: Sidebar ve Hooks (1 saat)

### Hedef
Menü entegrasyonu ve custom hooks.

### Tasks

#### T023: Update Sidebar
**Dosya**: `app/(protected)/application-layout-client.tsx`

Portföy menüsüne 2 yeni item ekle:
```typescript
{ name: 'Nakit & Temettü', href: `/p/${slug}/cash`, icon: BanknotesIcon },
{ name: 'Projeksiyon', href: `/p/${slug}/projection`, icon: ChartBarIcon },
```

#### T024: useDividends Hook
**Dosya**: `lib/hooks/use-dividends.ts`

```typescript
export function useDividends(portfolioId: string) {
  // Fetch dividends, add, summary
}
```

#### T025: useProjection Hook
**Dosya**: `lib/hooks/use-projection.ts`

```typescript
export function useProjection(portfolioId: string) {
  // Fetch settings, projection data, update settings
}
```

### Deliverables
- [ ] Sidebar menü güncellendi
- [ ] Hooks çalışıyor

---

## 🏗️ Faz 7: Testing & Polish (1.5 saat)

### Tasks

#### T026: TypeScript Check
```bash
npx tsc --noEmit
```

#### T027: Visual Testing
- Desktop, tablet, mobile kontrol
- Dark mode kontrol
- Grafik responsive kontrol

#### T028: Functional Testing
- Nakit ekleme/çıkarma
- Temettü kaydetme
- Projeksiyon hesaplama
- Senaryo toggle

#### T029: Empty States
- Temettü yokken mesaj
- Nakit hareketi yokken mesaj

### Deliverables
- [ ] Sıfır TypeScript hatası
- [ ] Responsive çalışıyor
- [ ] Empty states var

---

## 📁 Dosya Listesi

### Yeni Dosyalar (15)
```
lib/types/dividend.ts
lib/types/portfolio-settings.ts
lib/utils/projection.ts
lib/hooks/use-dividends.ts
lib/hooks/use-projection.ts
app/api/portfolios/[id]/dividends/route.ts
app/api/portfolios/[id]/dividends/summary/route.ts
app/api/portfolios/[id]/settings/route.ts
app/api/portfolios/[id]/projection/route.ts
components/cash/cash-summary-cards.tsx
components/cash/cash-transaction-dialog.tsx
components/cash/cash-transactions-list.tsx
components/dividends/dividend-dialog.tsx
components/dividends/dividend-calendar.tsx
components/projection/projection-chart.tsx
components/projection/projection-settings.tsx
components/projection/projection-table.tsx
components/projection/scenario-comparison.tsx
app/(protected)/p/[slug]/cash/page.tsx
app/(protected)/p/[slug]/projection/page.tsx
supabase/migrations/20260103_cash_dividends_projection.sql
```

### Güncellenen Dosyalar (2)
```
lib/types/cash.ts
app/(protected)/application-layout-client.tsx
```

---

## 🔗 Bağımlılıklar

### Yeni NPM Paketleri
```json
{
  "recharts": "^2.12.0"
}
```

### Mevcut Kullanılacaklar
- `formatCurrency` - Para formatlama
- `Button`, `Dialog`, `Input` - UI komponentleri
- `useCashPositions` - Mevcut hook

---

## 📊 İlerleme Takibi

| Faz | Süre | Durum |
|-----|------|-------|
| Faz 1: Database & Types | 2 saat | ⬜ Pending |
| Faz 2: API Endpoints | 2 saat | ⬜ Pending |
| Faz 3: Projeksiyon Hesaplama | 1.5 saat | ⬜ Pending |
| Faz 4: Nakit & Temettü UI | 3 saat | ⬜ Pending |
| Faz 5: Projeksiyon UI | 3 saat | ⬜ Pending |
| Faz 6: Sidebar & Hooks | 1 saat | ⬜ Pending |
| Faz 7: Testing | 1.5 saat | ⬜ Pending |
| **Toplam** | **14 saat** | |

---

## ✅ SDD Compliance

- [x] Specification First: spec-001.md hazır
- [x] Incremental Planning: 7 faza bölündü
- [x] Task Decomposition: 29 task tanımlı
- [x] Quality Assurance: Test fazı dahil
- [x] Architecture Documentation: API ve DB şeması belgelendi
