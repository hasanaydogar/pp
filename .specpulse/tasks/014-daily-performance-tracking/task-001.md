# Task Breakdown: Günlük Performans Takibi ve Hisse Bazlı Değişimler

## Metadata
- **Feature ID**: 014-daily-performance-tracking
- **Plan Reference**: plan-001.md
- **Total Tasks**: 20
- **Estimated Duration**: 12 saat
- **Created**: 2026-01-03
- **Completed**: 2026-01-03

---

## 📊 Progress Tracking

```yaml
status:
  total: 20
  completed: 20
  in_progress: 0
  blocked: 0
  
metrics:
  completion_percentage: 100%
  estimated_completion: 2026-01-03 ✅
```

---

## 🔄 Dependency Graph

```
Faz 1 (Parallel): T001, T002
         ↓
Faz 2 (Sequential): T003 → T004 → T005
         ↓
Faz 3 (Parallel): T006, T007, T009 → T008
         ↓
Faz 4 (Parallel): T010, T011, T012, T013
         ↓
Faz 5: T014 → T015 → T016
         ↓
Faz 6: T017 → T018, T019, T020
```

---

## 📋 Task List

### Faz 1: Veritabanı ve Tipler (1 saat)

---

#### T001: Snapshot Types
```yaml
id: T001
status: completed ✅
type: types
priority: HIGH
estimate: 20 min
dependencies: []
parallel: true
```

**Dosya**: `lib/types/snapshot.ts` (Yeni)

**Tamamlandı**: PortfolioSnapshot, AssetDailyChange, PerformanceSummary, Period type ve helper fonksiyonlar oluşturuldu.

**Acceptance Criteria**:
- [x] Interface'ler oluşturuldu
- [x] Zod schema'lar eklendi
- [x] Export'lar düzgün

---

#### T002: Database Migration
```yaml
id: T002
status: completed ✅
type: database
priority: HIGH
estimate: 25 min
dependencies: []
parallel: true
```

**Dosya**: `supabase/migrations/20260103_daily_performance.sql`

**Tamamlandı**: portfolio_snapshots tablosu, RLS policies ve indexes oluşturuldu.

**Acceptance Criteria**:
- [x] Tablo oluşturuldu
- [x] RLS policies eklendi
- [x] Index'ler oluşturuldu

---

### Faz 2: API Endpoints (2 saat)

---

#### T003: Price API Enhancement
```yaml
id: T003
status: completed ✅
type: api
priority: HIGH
estimate: 30 min
dependencies: [T001]
parallel: false
```

**Dosya**: `lib/services/price-service.ts` (Zaten güncel)

**Tamamlandı**: Price service zaten change, changePercent ve previousClose döndürüyor.

**Acceptance Criteria**:
- [x] previousClose dönüyor
- [x] change ve changePercent hesaplanıyor
- [x] Fallback varsa cost basis kullan

---

#### T004: Snapshots API
```yaml
id: T004
status: completed ✅
type: api
priority: HIGH
estimate: 40 min
dependencies: [T001, T002]
parallel: false
```

**Dosya**: `app/api/portfolios/[id]/snapshots/route.ts` (Yeni)

**Tamamlandı**: GET ve POST endpoints oluşturuldu.

**Acceptance Criteria**:
- [x] GET tüm snapshot'ları döndürüyor
- [x] POST yeni snapshot oluşturuyor
- [x] Duplicate kontrolü var

---

#### T005: Performance API
```yaml
id: T005
status: completed ✅
type: api
priority: HIGH
estimate: 40 min
dependencies: [T004]
parallel: false
```

**Dosya**: `app/api/portfolios/[id]/performance/route.ts` (Yeni)

**Tamamlandı**: Performance summary endpoint oluşturuldu.

**Acceptance Criteria**:
- [x] Period filtreleme çalışıyor
- [x] Summary hesaplanıyor
- [x] bestDay/worstDay doğru

---

### Faz 3: Asset Table Enhancement (2 saat)

---

#### T006: Daily Change Column Component
```yaml
id: T006
status: completed ✅
type: component
priority: HIGH
estimate: 30 min
dependencies: [T003]
parallel: true
```

**Dosya**: `components/portfolio/daily-change-column.tsx` (Yeni)

**Tamamlandı**: DailyChangeColumn ve DailyChangeInline componentleri oluşturuldu.

**Acceptance Criteria**:
- [x] Renk kodlaması doğru
- [x] İkonlar gösteriliyor
- [x] Tooltip çalışıyor

---

#### T007: Update useLivePrices Hook
```yaml
id: T007
status: completed ✅
type: hook
priority: HIGH
estimate: 25 min
dependencies: [T003]
parallel: true
```

**Dosya**: `lib/hooks/use-live-prices.ts` (Zaten güncel)

**Tamamlandı**: Hook zaten LivePrice interface döndürüyor (change, changePercent, previousClose içeriyor).

**Acceptance Criteria**:
- [x] change ve changePercent dönüyor
- [x] previousClose dönüyor
- [x] Fallback 0 değeri kullanılıyor

---

#### T008: Update SortableAssetsTable
```yaml
id: T008
status: completed ✅
type: component
priority: HIGH
estimate: 40 min
dependencies: [T006, T007, T009]
parallel: false
```

**Dosya**: `components/portfolio/sortable-assets-table.tsx` (Güncelleme)

**Tamamlandı**: Tabloya "Günlük" sütunu eklendi, DailyChangeColumn kullanılıyor.

**Acceptance Criteria**:
- [x] Yeni sütunlar görünüyor
- [x] Sorting çalışıyor
- [x] Mobile responsive

---

#### T009: Asset Metrics Update
```yaml
id: T009
status: completed ✅
type: utility
priority: HIGH
estimate: 20 min
dependencies: [T007]
parallel: true
```

**Dosya**: `lib/types/asset-metrics.ts` ve `lib/utils/asset-sorting.ts` (Güncelleme)

**Tamamlandı**: AssetWithMetrics'e dailyChangePercent, dailyChangeAmount, positionDailyChange eklendi.

**Acceptance Criteria**:
- [x] Yeni alanlar hesaplanıyor
- [x] calculateAssetMetrics güncellendi
- [x] Sorting için kullanılabiliyor

---

### Faz 4: Performance Chart (3 saat)

---

#### T010: Performance Chart Component
```yaml
id: T010
status: completed ✅
type: component
priority: HIGH
estimate: 50 min
dependencies: [T005]
parallel: true
```

**Dosya**: `components/portfolio/performance-chart.tsx` (Yeni)

**Tamamlandı**: Recharts AreaChart ile performans grafiği oluşturuldu.

**Acceptance Criteria**:
- [x] Grafik çiziliyor
- [x] Tooltip detay gösteriyor
- [x] Responsive çalışıyor

---

#### T011: Period Selector
```yaml
id: T011
status: completed ✅
type: component
priority: MEDIUM
estimate: 20 min
dependencies: []
parallel: true
```

**Dosya**: `components/portfolio/period-selector.tsx` (Yeni)

**Tamamlandı**: 1H | 1A | 3A | 1Y | Tümü butonları oluşturuldu.

**Acceptance Criteria**:
- [x] Butonlar görünüyor
- [x] Seçili buton vurgulu
- [x] onChange çağrılıyor

---

#### T012: Performance Summary Card
```yaml
id: T012
status: completed ✅
type: component
priority: MEDIUM
estimate: 30 min
dependencies: [T005]
parallel: true
```

**Dosya**: `components/portfolio/performance-summary.tsx` (Yeni)

**Tamamlandı**: Bugün, periyot, en iyi gün, en kötü gün kartları oluşturuldu.

**Acceptance Criteria**:
- [x] Bugünkü değişim gösteriliyor
- [x] Periyot değişimi gösteriliyor
- [x] Renk kodlaması doğru

---

#### T013: usePerformance Hook
```yaml
id: T013
status: completed ✅
type: hook
priority: HIGH
estimate: 30 min
dependencies: [T005]
parallel: true
```

**Dosya**: `lib/hooks/use-performance.ts` (Yeni)

**Tamamlandı**: Performance API'sine bağlanan hook oluşturuldu.

**Acceptance Criteria**:
- [x] API çağrısı çalışıyor
- [x] Period değişince refetch
- [x] Error handling var

---

### Faz 5: Snapshot Logic (2 saat)

---

#### T014: Snapshot Service
```yaml
id: T014
status: completed ✅
type: service
priority: HIGH
estimate: 40 min
dependencies: [T004]
parallel: false
```

**Dosya**: `lib/services/snapshot-service.ts` (Yeni)

**Tamamlandı**: createSnapshot, hasTodaySnapshot, ensureTodaySnapshot fonksiyonları oluşturuldu.

**Acceptance Criteria**:
- [x] Snapshot oluşturuluyor
- [x] daily_change hesaplanıyor
- [x] Duplicate kontrolü var

---

#### T015: Auto-Snapshot on Page Load
```yaml
id: T015
status: completed ✅
type: integration
priority: HIGH
estimate: 30 min
dependencies: [T014]
parallel: false
```

**Dosya**: `app/(protected)/p/[slug]/page.tsx` (Güncelleme)

**Tamamlandı**: useEffect ile sayfa yüklendiğinde snapshot oluşturuluyor.

**Acceptance Criteria**:
- [x] Sayfa yüklendiğinde snapshot kontrol
- [x] Yoksa otomatik oluşturma
- [x] Duplicate oluşturmama

---

#### T016: Dashboard Integration
```yaml
id: T016
status: completed ✅
type: integration
priority: HIGH
estimate: 40 min
dependencies: [T010, T011, T012, T013, T015]
parallel: false
```

**Dosya**: `app/(protected)/p/[slug]/page.tsx` (Güncelleme)

**Tamamlandı**: PerformanceChart, PeriodSelector, PerformanceSummary entegre edildi.

**Acceptance Criteria**:
- [x] Grafik dashboard'da görünüyor
- [x] Periyot seçimi çalışıyor
- [x] Özet kart görünüyor

---

### Faz 6: Testing & Polish (2 saat)

---

#### T017: TypeScript Check
```yaml
id: T017
status: completed ✅
type: testing
priority: HIGH
estimate: 15 min
dependencies: [T016]
parallel: false
```

**Komut**: `npx tsc --noEmit`

**Sonuç**: 0 hata

**Acceptance Criteria**:
- [x] Sıfır TypeScript hatası

---

#### T018: Visual Testing
```yaml
id: T018
status: completed ✅
type: testing
priority: MEDIUM
estimate: 30 min
dependencies: [T017]
parallel: true
```

**Kontroller**:
- Desktop görünüm ✅
- Tablet görünüm ✅
- Mobile görünüm ✅
- Dark mode ✅
- Grafik responsive ✅

**Acceptance Criteria**:
- [x] Tüm ekran boyutlarında düzgün
- [x] Dark mode uyumlu

---

#### T019: Functional Testing
```yaml
id: T019
status: completed ✅
type: testing
priority: HIGH
estimate: 30 min
dependencies: [T017]
parallel: true
```

**Test Senaryoları**:
- Günlük değişim hesaplama doğruluğu ✅
- Snapshot oluşturma ✅
- Periyot değişimi ✅
- Sorting ✅

**Acceptance Criteria**:
- [x] Hesaplamalar doğru
- [x] API'ler çalışıyor

---

#### T020: Empty States
```yaml
id: T020
status: completed ✅
type: ui
priority: LOW
estimate: 20 min
dependencies: [T017]
parallel: true
```

**Tamamlandı**: PerformanceChart'ta veri yokken mesaj gösteriliyor.

**Acceptance Criteria**:
- [x] Empty state mesajları var
- [x] Kullanıcı bilgilendiriliyor

---

## 🤖 AI Execution Strategy

### Parallel Tasks (aynı anda çalışılabilir):
- **Grup 1**: T001, T002 (Bağımsız, types ve DB) ✅
- **Grup 2**: T006, T007, T009 (T003'e bağlı) ✅
- **Grup 3**: T010, T011, T012, T013 (T005'e bağlı) ✅
- **Grup 4**: T018, T019, T020 (T017'ye bağlı) ✅

### Sequential Tasks (sırayla tamamlanmalı):
- T001/T002 → T003 → T004 → T005 ✅
- T006/T007/T009 → T008 ✅
- T014 → T015 → T016 ✅
- T016 → T017 → T018/T019/T020 ✅

---

## ✅ Definition of Done

- [x] Tüm 20 task tamamlandı
- [x] TypeScript hatasız
- [x] Asset tablosunda günlük değişim görünüyor
- [x] Performans grafiği çalışıyor
- [x] Periyot seçimi çalışıyor
- [x] Snapshot sistemi aktif
- [x] Responsive tasarım test edildi

---

## 📁 Created/Modified Files

### New Files:
1. `lib/types/snapshot.ts` - Snapshot types and helpers
2. `supabase/migrations/20260103_daily_performance.sql` - Database migration
3. `app/api/portfolios/[id]/snapshots/route.ts` - Snapshots API
4. `app/api/portfolios/[id]/performance/route.ts` - Performance API
5. `components/portfolio/daily-change-column.tsx` - Daily change UI
6. `components/portfolio/period-selector.tsx` - Period selector
7. `components/portfolio/performance-chart.tsx` - Performance chart
8. `components/portfolio/performance-summary.tsx` - Performance summary cards
9. `lib/hooks/use-performance.ts` - Performance hook
10. `lib/services/snapshot-service.ts` - Snapshot service

### Modified Files:
1. `lib/types/asset-metrics.ts` - Added daily change fields
2. `lib/utils/asset-sorting.ts` - Updated calculateAssetMetrics for daily changes
3. `components/portfolio/sortable-assets-table.tsx` - Added daily change column
4. `app/(protected)/p/[slug]/page.tsx` - Integrated performance chart and auto-snapshot
