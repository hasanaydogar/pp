# Implementation Plan: Günlük Performans Takibi ve Hisse Bazlı Değişimler

## Specification Reference
- **Spec ID**: SPEC-014
- **Spec Version**: 1.0
- **Plan Version**: 1.0
- **Generated**: 2026-01-03
- **Estimated Duration**: 12 saat

---

## 📋 Özet

Bu plan, portföy dashboard sayfasındaki varlık tablosuna hisse bazlı günlük değişim bilgilerini eklemek ve portföy performansını takip eden bir grafik alanı oluşturmak için gerekli tüm adımları içerir.

### Ana Bileşenler
1. **Asset Table Enhancement** - Günlük değişim sütunları
2. **Performance Chart** - Tarihsel performans grafiği
3. **Snapshot System** - Günlük portföy değeri kaydı

---

## 🏗️ Faz 1: Veritabanı ve Tipler (1 saat)

### Hedef
Yeni tablolar ve TypeScript tipleri oluşturma.

### Tasks

#### T001: Snapshot Types
**Dosya**: `lib/types/snapshot.ts` (Yeni)

```typescript
export interface PortfolioSnapshot {
  id: string;
  portfolio_id: string;
  snapshot_date: string; // YYYY-MM-DD
  total_value: number;
  assets_value: number;
  cash_value: number;
  daily_change: number;
  daily_change_percent: number;
  created_at: string;
}

export interface AssetDailyChange {
  symbol: string;
  currentPrice: number;
  previousClose: number;
  changeAmount: number;
  changePercent: number;
  positionChangeAmount: number; // quantity * changeAmount
}

export interface PerformanceSummary {
  startValue: number;
  endValue: number;
  totalChange: number;
  totalChangePercent: number;
  bestDay: { date: string; change: number } | null;
  worstDay: { date: string; change: number } | null;
}
```

#### T002: Database Migration
**Dosya**: `supabase/migrations/20260103_daily_performance.sql`

```sql
-- portfolio_snapshots tablosu
-- asset_price_history tablosu (opsiyonel, API'den geliyor)
-- RLS policies
```

### Deliverables
- [ ] `lib/types/snapshot.ts` oluşturuldu
- [ ] Migration dosyası hazır

---

## 🏗️ Faz 2: API Endpoints (2 saat)

### Hedef
Snapshot ve performans API'leri.

### Tasks

#### T003: Price API Enhancement
**Dosya**: `app/api/prices/[symbol]/route.ts` (Güncelleme)

Mevcut response'a ekle:
```typescript
{
  symbol: string,
  price: number,
  change: number,         // Yeni
  changePercent: number,  // Yeni
  previousClose: number,  // Yeni
  timestamp: string
}
```

#### T004: Snapshots API
**Dosya**: `app/api/portfolios/[id]/snapshots/route.ts` (Yeni)

```typescript
// GET - Tarihsel snapshot'ları getir
// POST - Manuel snapshot oluştur
```

#### T005: Performance API
**Dosya**: `app/api/portfolios/[id]/performance/route.ts` (Yeni)

```typescript
// GET - Performans verisi (period query param ile)
// Response: snapshots[], summary
```

### Deliverables
- [ ] Price API günlük değişim veriyor
- [ ] Snapshots API çalışıyor
- [ ] Performance API çalışıyor

---

## 🏗️ Faz 3: Asset Table Enhancement (2 saat)

### Hedef
Mevcut tabloya günlük değişim sütunları eklemek.

### Tasks

#### T006: Daily Change Column Component
**Dosya**: `components/portfolio/daily-change-column.tsx` (Yeni)

```typescript
interface DailyChangeColumnProps {
  changePercent: number;
  changeAmount: number;
  currency: string;
}
```

Özellikler:
- Yeşil/Kırmızı renk kodlaması
- Ok ikonları (yukarı/aşağı)
- Tooltip ile previousClose

#### T007: Update useLivePrices Hook
**Dosya**: `lib/hooks/use-live-prices.ts` (Güncelleme)

Dönüş değerine ekle:
```typescript
interface LivePriceData {
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
}
```

#### T008: Update SortableAssetsTable
**Dosya**: `components/portfolio/sortable-assets-table.tsx` (Güncelleme)

- Yeni sütunlar ekle: "Günlük Değ. (%)", "Günlük K/Z"
- Sorting desteği
- Responsive tasarım (mobile scroll)

#### T009: Asset Metrics Update
**Dosya**: `lib/utils/asset-sorting.ts` (Güncelleme)

`AssetWithMetrics` interface'ine ekle:
```typescript
dailyChangePercent: number;
dailyChangeAmount: number;
positionDailyChange: number;
```

### Deliverables
- [ ] DailyChangeColumn komponenti çalışıyor
- [ ] Tablo yeni sütunları gösteriyor
- [ ] Renk kodlaması doğru

---

## 🏗️ Faz 4: Performance Chart (3 saat)

### Hedef
Portföy performans grafiği oluşturma.

### Tasks

#### T010: Performance Chart Component
**Dosya**: `components/portfolio/performance-chart.tsx` (Yeni)

```typescript
interface PerformanceChartProps {
  snapshots: PortfolioSnapshot[];
  period: '7d' | '30d' | '90d' | '365d' | 'all';
  currency: string;
}
```

Özellikler:
- Area Chart (Recharts)
- Periyot seçim butonları
- Tooltip ile detay
- Responsive

#### T011: Period Selector
**Dosya**: `components/portfolio/period-selector.tsx` (Yeni)

```typescript
type Period = '7d' | '30d' | '90d' | '365d' | 'all';

interface PeriodSelectorProps {
  value: Period;
  onChange: (period: Period) => void;
}
```

#### T012: Performance Summary Card
**Dosya**: `components/portfolio/performance-summary.tsx` (Yeni)

- Bugünkü değişim
- Seçili periyot değişimi
- En iyi/kötü gün

#### T013: usePerformance Hook
**Dosya**: `lib/hooks/use-performance.ts` (Yeni)

```typescript
export function usePerformance(portfolioId: string, period: Period) {
  // Fetch snapshots
  // Calculate summary
  // Return loading, error, data
}
```

### Deliverables
- [ ] Grafik çalışıyor
- [ ] Periyot seçimi çalışıyor
- [ ] Özet kart gösteriliyor

---

## 🏗️ Faz 5: Snapshot Logic (2 saat)

### Hedef
Günlük snapshot kaydetme mekanizması.

### Tasks

#### T014: Snapshot Service
**Dosya**: `lib/services/snapshot-service.ts` (Yeni)

```typescript
export async function createSnapshot(
  portfolioId: string,
  assetsValue: number,
  cashValue: number,
  livePrices: Record<string, number>
): Promise<PortfolioSnapshot>;

export async function getLatestSnapshot(
  portfolioId: string
): Promise<PortfolioSnapshot | null>;
```

#### T015: Auto-Snapshot on Page Load
**Dosya**: `app/(protected)/p/[slug]/page.tsx` (Güncelleme)

- Sayfa yüklendiğinde bugünkü snapshot var mı kontrol et
- Yoksa oluştur
- Veriyi grafiğe aktar

#### T016: Snapshot Integration
Dashboard sayfasına entegrasyon:
- Grafik komponenti ekle
- Özet kartları ekle

### Deliverables
- [ ] Snapshot servisi çalışıyor
- [ ] Sayfa yüklendiğinde snapshot alınıyor
- [ ] Dashboard entegrasyonu tamamlandı

---

## 🏗️ Faz 6: Testing & Polish (2 saat)

### Tasks

#### T017: TypeScript Check
```bash
npx tsc --noEmit
```

#### T018: Visual Testing
- Desktop, tablet, mobile kontrol
- Dark mode kontrol
- Grafik responsive kontrol

#### T019: Functional Testing
- Günlük değişim hesaplama doğruluğu
- Snapshot oluşturma
- Periyot değişimi

#### T020: Empty States
- Snapshot yokken mesaj
- Grafik veri yokken placeholder

### Deliverables
- [ ] Sıfır TypeScript hatası
- [ ] Responsive çalışıyor
- [ ] Empty states var

---

## 📁 Dosya Listesi

### Yeni Dosyalar (11)
```
lib/types/snapshot.ts
lib/hooks/use-performance.ts
lib/services/snapshot-service.ts
app/api/portfolios/[id]/snapshots/route.ts
app/api/portfolios/[id]/performance/route.ts
components/portfolio/daily-change-column.tsx
components/portfolio/performance-chart.tsx
components/portfolio/period-selector.tsx
components/portfolio/performance-summary.tsx
supabase/migrations/20260103_daily_performance.sql
```

### Güncellenen Dosyalar (4)
```
app/api/prices/[symbol]/route.ts
lib/hooks/use-live-prices.ts
lib/utils/asset-sorting.ts
components/portfolio/sortable-assets-table.tsx
app/(protected)/p/[slug]/page.tsx
```

---

## 🔗 Bağımlılıklar

### Mevcut Kullanılacaklar
- `recharts` - Grafik
- `useLivePrices` - Fiyat verisi
- `formatCurrency` - Para formatlama
- `SortableAssetsTable` - Mevcut tablo

### Yeni Gereksinimler
- Fiyat API'nin `previousClose` dönmesi

---

## 📊 İlerleme Takibi

| Faz | Süre | Durum |
|-----|------|-------|
| Faz 1: Database & Types | 1 saat | ⬜ Pending |
| Faz 2: API Endpoints | 2 saat | ⬜ Pending |
| Faz 3: Asset Table Enhancement | 2 saat | ⬜ Pending |
| Faz 4: Performance Chart | 3 saat | ⬜ Pending |
| Faz 5: Snapshot Logic | 2 saat | ⬜ Pending |
| Faz 6: Testing | 2 saat | ⬜ Pending |
| **Toplam** | **12 saat** | |

---

## ✅ SDD Compliance

- [x] Specification First: spec-001.md hazır
- [x] Incremental Planning: 6 faza bölündü
- [x] Task Decomposition: 20 task tanımlı
- [x] Quality Assurance: Test fazı dahil
- [x] Architecture Documentation: API ve DB şeması belgelendi

---

## Risk Assessment

| Risk | Olasılık | Etki | Önlem |
|------|----------|------|-------|
| Fiyat API previousClose vermeyebilir | Orta | Yüksek | Fallback: Manuel hesaplama |
| Snapshot verisi büyüyebilir | Düşük | Orta | Eski verileri arşivle |
| Borsa tatil günleri | Orta | Düşük | Son işlem günü fiyatını kullan |

---

## Notlar

- İlk fazda snapshot sayfa yüklendiğinde alınacak
- İleride cron job ile otomatik günlük snapshot
- Yahoo Finance API `regularMarketPreviousClose` alanını destekliyor
