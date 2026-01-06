# Task Breakdown: Nakit Yönetimi, Temettü Takibi ve Performans Projeksiyonu

## Metadata
- **Feature ID**: 013-cash-dividends-performance
- **Plan Reference**: plan-001.md
- **Total Tasks**: 29
- **Estimated Duration**: 14 saat
- **Created**: 2026-01-03

---

## 📊 Progress Tracking

```yaml
status:
  total: 29
  completed: 29
  in_progress: 0
  blocked: 0
  
metrics:
  completion_percentage: 100%
  actual_completion: 2026-01-03
```

---

## 🔄 Dependency Graph

```
Faz 1 (Parallel): T001, T002, T003, T004
         ↓
Faz 2 (Sequential): T005 → T006 → T007 → T008 → T009
         ↓
Faz 3: T010
         ↓
Faz 4 (Parallel): T011, T012, T013, T014, T015 → T016
         ↓
Faz 5: T017 → T018, T019, T020, T021 → T022
         ↓
Faz 6: T023, T024, T025
         ↓
Faz 7: T026 → T027, T028, T029
```

---

## 📋 Task List

### Faz 1: Veritabanı ve Tipler (2 saat)

---

#### T001: Cash Transaction Type Güncellemesi
```yaml
id: T001
status: pending
type: types
priority: HIGH
estimate: 15 min
dependencies: []
parallel: true
```

**Dosya**: `lib/types/cash.ts`

**Açıklama**: Mevcut enum'a INTEREST, TRANSFER_IN, TRANSFER_OUT tiplerini ekle.

**Acceptance Criteria**:
- [ ] Yeni enum değerleri eklendi
- [ ] getCashTransactionSign güncellendi
- [ ] getCashTransactionLabel güncellendi

---

#### T002: Dividend Types
```yaml
id: T002
status: pending
type: types
priority: HIGH
estimate: 20 min
dependencies: []
parallel: true
```

**Dosya**: `lib/types/dividend.ts` (Yeni)

**Açıklama**: Temettü için interface ve Zod schema.

**Kod**:
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
```

**Acceptance Criteria**:
- [ ] Dividend interface tanımlı
- [ ] DividendSummary interface tanımlı
- [ ] Zod validation schema'ları tanımlı

---

#### T003: Portfolio Settings Types
```yaml
id: T003
status: pending
type: types
priority: HIGH
estimate: 15 min
dependencies: []
parallel: true
```

**Dosya**: `lib/types/portfolio-settings.ts` (Yeni)

**Açıklama**: Projeksiyon ayarları ve sonuç tipleri.

**Acceptance Criteria**:
- [ ] PortfolioSettings interface tanımlı
- [ ] ProjectionResult interface tanımlı
- [ ] ProjectionScenario interface tanımlı
- [ ] Default değerler export edildi

---

#### T004: Database Migration
```yaml
id: T004
status: pending
type: database
priority: CRITICAL
estimate: 30 min
dependencies: []
parallel: true
```

**Dosya**: `supabase/migrations/20260103_cash_dividends_projection.sql`

**Açıklama**: dividends ve portfolio_settings tabloları, RLS policies.

**Acceptance Criteria**:
- [ ] dividends tablosu oluşturuldu
- [ ] portfolio_settings tablosu oluşturuldu
- [ ] İndexler oluşturuldu
- [ ] RLS policies eklendi

---

### Faz 2: API Endpoints (2 saat)

---

#### T005: Dividends API
```yaml
id: T005
status: pending
type: api
priority: HIGH
estimate: 30 min
dependencies: [T002, T004]
parallel: false
```

**Dosya**: `app/api/portfolios/[id]/dividends/route.ts`

**Methods**:
- GET: Temettü listesi (pagination, tarih filtresi)
- POST: Yeni temettü kaydı

**Acceptance Criteria**:
- [ ] GET endpoint çalışıyor
- [ ] POST endpoint çalışıyor
- [ ] Validation mevcut
- [ ] Ownership check mevcut

---

#### T006: Dividends Summary API
```yaml
id: T006
status: pending
type: api
priority: MEDIUM
estimate: 20 min
dependencies: [T005]
parallel: false
```

**Dosya**: `app/api/portfolios/[id]/dividends/summary/route.ts`

**Açıklama**: Yıllık, aylık, varlık bazlı temettü özeti.

**Acceptance Criteria**:
- [ ] Yıllık toplam hesaplanıyor
- [ ] Aylık ortalama hesaplanıyor
- [ ] Varlık bazlı gruplandırma çalışıyor

---

#### T007: Portfolio Settings API
```yaml
id: T007
status: pending
type: api
priority: HIGH
estimate: 25 min
dependencies: [T003, T004]
parallel: false
```

**Dosya**: `app/api/portfolios/[id]/settings/route.ts`

**Methods**:
- GET: Ayarları getir (yoksa default)
- PUT: Ayarları güncelle (upsert)

**Acceptance Criteria**:
- [ ] Default değerler döndürülüyor
- [ ] Upsert çalışıyor
- [ ] Validation mevcut

---

#### T008: Projection API
```yaml
id: T008
status: pending
type: api
priority: HIGH
estimate: 25 min
dependencies: [T007, T010]
parallel: false
```

**Dosya**: `app/api/portfolios/[id]/projection/route.ts`

**Query Params**: years, include_scenarios

**Acceptance Criteria**:
- [ ] Projeksiyon hesaplanıyor
- [ ] 3 senaryo döndürülüyor (opsiyonel)
- [ ] Portföy değeri ve ayarlar kullanılıyor

---

#### T009: Cash Transactions List API
```yaml
id: T009
status: pending
type: api
priority: MEDIUM
estimate: 20 min
dependencies: [T001]
parallel: false
```

**Dosya**: `app/api/portfolios/[id]/cash/transactions/route.ts`

**Açıklama**: Mevcut API'yi genişlet - tüm para birimlerinden hareketler.

**Acceptance Criteria**:
- [ ] Pagination çalışıyor
- [ ] Tip filtresi çalışıyor
- [ ] Tarih filtresi çalışıyor

---

### Faz 3: Projeksiyon Hesaplama (1.5 saat)

---

#### T010: Projection Calculator
```yaml
id: T010
status: pending
type: utility
priority: HIGH
estimate: 60 min
dependencies: [T003]
parallel: false
```

**Dosya**: `lib/utils/projection.ts`

**Fonksiyonlar**:
- `calculateFutureValue`: Bileşik getiri
- `calculateMonthlyIncome`: %4 kuralı
- `generateProjections`: Çoklu periyot
- `generateScenarios`: 3 senaryo

**Formül**:
```
FV = PV × (1 + r)^n + PMT × [((1 + r)^n - 1) / r]
```

**Acceptance Criteria**:
- [ ] Bileşik getiri doğru hesaplanıyor
- [ ] Aylık yatırım dahil ediliyor
- [ ] 3 senaryo üretilebiliyor
- [ ] Unit test yazıldı (opsiyonel)

---

### Faz 4: Nakit ve Temettü UI (3 saat)

---

#### T011: Cash Summary Cards
```yaml
id: T011
status: pending
type: component
priority: HIGH
estimate: 30 min
dependencies: [T001]
parallel: true
```

**Dosya**: `components/cash/cash-summary-cards.tsx`

**Kartlar**:
1. Nakit Bakiyesi
2. Aylık Temettü
3. Yıllık Temettü

**Acceptance Criteria**:
- [ ] 3 kart görüntüleniyor
- [ ] formatCurrency kullanılıyor
- [ ] Responsive grid

---

#### T012: Cash Transaction Dialog
```yaml
id: T012
status: pending
type: component
priority: HIGH
estimate: 40 min
dependencies: [T001]
parallel: true
```

**Dosya**: `components/cash/cash-transaction-dialog.tsx`

**Form Alanları**:
- Tip (select)
- Tutar (input)
- Tarih (input date)
- Not (textarea)

**Acceptance Criteria**:
- [ ] Dialog açılıp kapanıyor
- [ ] Form validation çalışıyor
- [ ] Submit işlemi yapılıyor

---

#### T013: Cash Transactions List
```yaml
id: T013
status: pending
type: component
priority: MEDIUM
estimate: 35 min
dependencies: [T009]
parallel: true
```

**Dosya**: `components/cash/cash-transactions-list.tsx`

**Özellikler**:
- Tip filtresi
- Renk kodlaması (+yeşil, -kırmızı)
- Tarih formatı

**Acceptance Criteria**:
- [ ] Liste görüntüleniyor
- [ ] Filtreleme çalışıyor
- [ ] Empty state mevcut

---

#### T014: Dividend Dialog
```yaml
id: T014
status: pending
type: component
priority: HIGH
estimate: 45 min
dependencies: [T002, T005]
parallel: true
```

**Dosya**: `components/dividends/dividend-dialog.tsx`

**Form Alanları**:
- Varlık (combobox)
- Brüt tutar
- Stopaj oranı → Net otomatik hesaplama
- Ödeme tarihi
- Reinvest stratejisi

**Acceptance Criteria**:
- [ ] Varlık listesi yükleniyor
- [ ] Net tutar otomatik hesaplanıyor
- [ ] Form submit çalışıyor

---

#### T015: Dividend Calendar View
```yaml
id: T015
status: pending
type: component
priority: MEDIUM
estimate: 30 min
dependencies: [T006]
parallel: true
```

**Dosya**: `components/dividends/dividend-calendar.tsx`

**Yapı**:
- Aylara göre gruplandırma
- Her ay için toplam ve varlık listesi

**Acceptance Criteria**:
- [ ] Aylık gruplandırma çalışıyor
- [ ] Toplam tutar hesaplanıyor
- [ ] Geçmiş/gelecek gösterimi

---

#### T016: Cash Page Integration
```yaml
id: T016
status: pending
type: integration
priority: CRITICAL
estimate: 40 min
dependencies: [T011, T012, T013, T014, T015]
parallel: false
```

**Dosya**: `app/(protected)/p/[slug]/cash/page.tsx`

**Yapı**:
- Summary Cards
- Action Buttons (Nakit Ekle, Temettü Kaydet)
- Transactions List
- Dividend Calendar

**Acceptance Criteria**:
- [ ] Tüm komponentler entegre
- [ ] Data fetching çalışıyor
- [ ] Responsive layout

---

### Faz 5: Projeksiyon UI (3 saat)

---

#### T017: Install Recharts
```yaml
id: T017
status: pending
type: setup
priority: HIGH
estimate: 5 min
dependencies: []
parallel: true
```

**Komut**: `npm install recharts`

**Acceptance Criteria**:
- [ ] recharts yüklendi
- [ ] Import çalışıyor

---

#### T018: Projection Chart
```yaml
id: T018
status: pending
type: component
priority: HIGH
estimate: 50 min
dependencies: [T010, T017]
parallel: false
```

**Dosya**: `components/projection/projection-chart.tsx`

**Özellikler**:
- Area/Line chart
- X: Yıllar (0-25)
- Y: Portföy değeri
- 3 senaryo çizgisi (toggle)
- Tooltip

**Acceptance Criteria**:
- [ ] Grafik render ediliyor
- [ ] Senaryo toggle çalışıyor
- [ ] Responsive
- [ ] Dark mode uyumlu

---

#### T019: Projection Settings Panel
```yaml
id: T019
status: pending
type: component
priority: HIGH
estimate: 35 min
dependencies: [T007]
parallel: true
```

**Dosya**: `components/projection/projection-settings.tsx`

**Alanlar**:
- Aylık Yatırım (input)
- Beklenen Getiri (%5-15 slider/input)
- Çekim Oranı (%2-6 input)
- Temettü Dahil (toggle)

**Acceptance Criteria**:
- [ ] Ayarlar değiştirilebiliyor
- [ ] Değişiklikler kaydediliyor
- [ ] Validation mevcut

---

#### T020: Projection Table
```yaml
id: T020
status: pending
type: component
priority: HIGH
estimate: 25 min
dependencies: [T010]
parallel: true
```

**Dosya**: `components/projection/projection-table.tsx`

**Kolonlar**: Süre | Tahmini Değer | Aylık Gelir | Toplam Yatırım

**Acceptance Criteria**:
- [ ] 6 satır (1, 5, 10, 15, 20, 25 yıl)
- [ ] formatCurrency kullanılıyor
- [ ] Responsive

---

#### T021: Scenario Comparison
```yaml
id: T021
status: pending
type: component
priority: MEDIUM
estimate: 25 min
dependencies: [T010]
parallel: true
```

**Dosya**: `components/projection/scenario-comparison.tsx`

**Kartlar**:
- 🟢 İyimser (+2%)
- 🟡 Baz (default)
- 🔴 Kötümser (-2%)

**Acceptance Criteria**:
- [ ] 3 kart görüntüleniyor
- [ ] Renk kodlaması doğru
- [ ] 20 yıl değerleri gösteriliyor

---

#### T022: Projection Page Integration
```yaml
id: T022
status: pending
type: integration
priority: CRITICAL
estimate: 40 min
dependencies: [T018, T019, T020, T021]
parallel: false
```

**Dosya**: `app/(protected)/p/[slug]/projection/page.tsx`

**Yapı**:
- Current Value display
- Settings Panel
- Chart
- Table
- Scenario Comparison

**Acceptance Criteria**:
- [ ] Tüm komponentler entegre
- [ ] Ayar değişince hesaplama güncelleniyor
- [ ] Responsive layout

---

### Faz 6: Sidebar ve Hooks (1 saat)

---

#### T023: Update Sidebar
```yaml
id: T023
status: pending
type: integration
priority: HIGH
estimate: 15 min
dependencies: [T016, T022]
parallel: false
```

**Dosya**: `app/(protected)/application-layout-client.tsx`

**Yeni Menüler**:
- 💰 Nakit & Temettü → `/p/${slug}/cash`
- 📈 Projeksiyon → `/p/${slug}/projection`

**Acceptance Criteria**:
- [ ] Menü itemları eklendi
- [ ] Icon'lar görünüyor
- [ ] Active state çalışıyor

---

#### T024: useDividends Hook
```yaml
id: T024
status: pending
type: hook
priority: MEDIUM
estimate: 25 min
dependencies: [T005, T006]
parallel: true
```

**Dosya**: `lib/hooks/use-dividends.ts`

**Fonksiyonlar**:
- fetchDividends
- addDividend
- fetchSummary

**Acceptance Criteria**:
- [ ] CRUD işlemleri çalışıyor
- [ ] Loading/error state
- [ ] Refetch function

---

#### T025: useProjection Hook
```yaml
id: T025
status: pending
type: hook
priority: MEDIUM
estimate: 20 min
dependencies: [T007, T008]
parallel: true
```

**Dosya**: `lib/hooks/use-projection.ts`

**Fonksiyonlar**:
- fetchSettings
- updateSettings
- fetchProjection

**Acceptance Criteria**:
- [ ] Settings fetch/update çalışıyor
- [ ] Projection data fetch çalışıyor
- [ ] Refetch on settings change

---

### Faz 7: Testing & Polish (1.5 saat)

---

#### T026: TypeScript Check
```yaml
id: T026
status: pending
type: testing
priority: HIGH
estimate: 15 min
dependencies: [T023]
parallel: false
```

**Komut**: `npx tsc --noEmit`

**Acceptance Criteria**:
- [ ] Sıfır TypeScript hatası

---

#### T027: Visual Testing
```yaml
id: T027
status: pending
type: testing
priority: MEDIUM
estimate: 25 min
dependencies: [T026]
parallel: true
```

**Kontrol Listesi**:
- Desktop görünümü
- Tablet görünümü
- Mobile görünümü
- Dark mode
- Grafik responsive

**Acceptance Criteria**:
- [ ] Tüm breakpoint'ler test edildi
- [ ] Dark mode çalışıyor

---

#### T028: Functional Testing
```yaml
id: T028
status: pending
type: testing
priority: HIGH
estimate: 30 min
dependencies: [T026]
parallel: true
```

**Test Senaryoları**:
- Nakit ekleme/çıkarma
- Temettü kaydetme
- Projeksiyon hesaplama
- Ayar değiştirme
- Senaryo toggle

**Acceptance Criteria**:
- [ ] Tüm CRUD işlemleri çalışıyor
- [ ] Hesaplamalar doğru
- [ ] Error handling çalışıyor

---

#### T029: Empty States
```yaml
id: T029
status: pending
type: polish
priority: LOW
estimate: 15 min
dependencies: [T026]
parallel: true
```

**Empty States**:
- Temettü listesi boş
- Nakit hareketi yok
- İlk projeksiyon

**Acceptance Criteria**:
- [ ] Anlamlı mesajlar var
- [ ] CTA butonları mevcut

---

## 🚀 AI Execution Strategy

### Parallel Batch 1 (Faz 1)
```
T001, T002, T003, T004
```

### Sequential Batch 2 (Faz 2)
```
T005 → T006 → T007 → T008 → T009
```

### Sequential + Parallel Batch 3 (Faz 3)
```
T010 (after T003)
```

### Parallel Batch 4 (Faz 4)
```
T011, T012, T013, T014, T015 (parallel)
→ T016 (integration)
```

### Mixed Batch 5 (Faz 5)
```
T017 (setup)
→ T018, T019, T020, T021 (parallel)
→ T022 (integration)
```

### Parallel Batch 6 (Faz 6)
```
T023, T024, T025
```

### Final Batch 7 (Faz 7)
```
T026 → T027, T028, T029 (parallel)
```

---

## 📁 Files to Create/Modify

### New Files (21)
```
lib/types/dividend.ts
lib/types/portfolio-settings.ts
lib/utils/projection.ts
lib/hooks/use-dividends.ts
lib/hooks/use-projection.ts
supabase/migrations/20260103_cash_dividends_projection.sql
app/api/portfolios/[id]/dividends/route.ts
app/api/portfolios/[id]/dividends/summary/route.ts
app/api/portfolios/[id]/settings/route.ts
app/api/portfolios/[id]/projection/route.ts
app/api/portfolios/[id]/cash/transactions/route.ts
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
```

### Modified Files (2)
```
lib/types/cash.ts
app/(protected)/application-layout-client.tsx
```

---

## ✅ Execution Command

```
/sp-execute
```
