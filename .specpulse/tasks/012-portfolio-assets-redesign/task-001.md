# Task Breakdown: Portföy Varlıkları Sayfası Redesign

## Metadata
- **Feature ID**: 012-portfolio-assets-redesign
- **Plan Reference**: plan-001.md
- **Total Tasks**: 16
- **Estimated Duration**: 7.5 saat
- **Created**: 2026-01-03

---

## 📊 Progress Tracking

```yaml
status:
  total: 16
  completed: 16
  in_progress: 0
  blocked: 0
  
metrics:
  completion_percentage: 100%
  completed_at: 2026-01-03
```

---

## 🔄 Dependency Graph

```
T001 ──┬──→ T003
       │
T002 ──┴──→ T004, T005, T006
              │
              ├──→ T008, T009
              │
              └──→ T010 ──→ T011 ──→ T012 ──→ T013-T016
```

---

## 📋 Task List

### Faz 1: Temel Tipler ve Utilities (30 dk)

---

#### T001: AssetWithMetrics Interface
```yaml
id: T001
status: pending
type: types
priority: HIGH
estimate: 15 min
dependencies: []
parallel: true
```

**Dosya**: `lib/types/asset-metrics.ts`

**Açıklama**: Asset metriklerini içeren extended interface ve sorting tipleri.

**Kod**:
```typescript
import { Asset } from './portfolio';
import { PositionCategory } from './sector';

export interface AssetWithMetrics extends Asset {
  currentValue: number;
  costBasis: number;
  gainLoss: number;
  gainLossPercent: number;
  weight: number;
  category: PositionCategory;
  isOverWeight: boolean;
}

export type SortColumn = 
  | 'symbol' 
  | 'weight' 
  | 'currentValue' 
  | 'costBasis' 
  | 'gainLoss' 
  | 'gainLossPercent'
  | 'category';

export type SortDirection = 'asc' | 'desc';
```

**Acceptance Criteria**:
- [ ] Interface doğru şekilde export ediliyor
- [ ] Tüm gerekli alanlar mevcut
- [ ] TypeScript hata vermiyor

---

#### T002: Sorting ve Metrics Utility
```yaml
id: T002
status: pending
type: utility
priority: HIGH
estimate: 15 min
dependencies: [T001]
parallel: false
```

**Dosya**: `lib/utils/asset-sorting.ts`

**Açıklama**: Asset sıralama ve metrik hesaplama fonksiyonları.

**Kod**:
```typescript
import { Asset } from '@/lib/types/portfolio';
import { AssetWithMetrics, SortColumn, SortDirection } from '@/lib/types/asset-metrics';
import { PositionCategory } from '@/lib/types/sector';
import { PortfolioPolicy, DEFAULT_POLICY } from '@/lib/types/policy';

export function sortAssets(
  assets: AssetWithMetrics[], 
  column: SortColumn, 
  direction: SortDirection
): AssetWithMetrics[] {
  return [...assets].sort((a, b) => {
    let aVal: string | number;
    let bVal: string | number;
    
    switch (column) {
      case 'symbol':
        aVal = a.symbol;
        bVal = b.symbol;
        break;
      case 'category':
        aVal = a.category;
        bVal = b.category;
        break;
      default:
        aVal = a[column] as number;
        bVal = b[column] as number;
    }
    
    const modifier = direction === 'asc' ? 1 : -1;
    
    if (typeof aVal === 'string') {
      return aVal.localeCompare(bVal as string) * modifier;
    }
    return ((aVal as number) - (bVal as number)) * modifier;
  });
}

export function calculateAssetMetrics(
  assets: Asset[],
  totalPortfolioValue: number,
  policy: PortfolioPolicy | null
): AssetWithMetrics[] {
  const p = policy || DEFAULT_POLICY;
  
  return assets.map(asset => {
    const costBasis = asset.quantity * asset.average_buy_price;
    const currentValue = costBasis; // TODO: Use live price when available
    const gainLoss = currentValue - costBasis;
    const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;
    const weight = totalPortfolioValue > 0 ? currentValue / totalPortfolioValue : 0;
    
    // Determine category based on weight
    let category: PositionCategory;
    if (weight >= p.core_min_weight) {
      category = PositionCategory.CORE;
    } else if (weight >= p.satellite_min_weight) {
      category = PositionCategory.SATELLITE;
    } else {
      category = PositionCategory.NEW;
    }
    
    const isOverWeight = weight > p.max_weight_per_stock;
    
    return {
      ...asset,
      currentValue,
      costBasis,
      gainLoss,
      gainLossPercent,
      weight,
      category,
      isOverWeight,
    };
  });
}
```

**Acceptance Criteria**:
- [ ] sortAssets tüm kolonlar için çalışıyor
- [ ] calculateAssetMetrics doğru hesaplama yapıyor
- [ ] Category otomatik belirleniyor

---

### Faz 2: Özet Kartları (1 saat)

---

#### T003: PortfolioSummaryCards Component
```yaml
id: T003
status: pending
type: component
priority: HIGH
estimate: 60 min
dependencies: [T001]
parallel: true
```

**Dosya**: `components/portfolio/portfolio-summary-cards.tsx`

**Açıklama**: 4 adet özet kartı: Toplam Değer, Günlük Değişim, Nakit Durumu, Policy Uyumu.

**UI Yapısı**:
- Grid: 4 col (lg), 2x2 (md), 1 col (sm)
- Her kart: Icon, başlık, değer, alt bilgi
- Renk kodları: Yeşil/Kırmızı değişim

**Acceptance Criteria**:
- [ ] 4 kart görüntüleniyor
- [ ] Responsive grid çalışıyor
- [ ] Currency formatting doğru
- [ ] Renk kodlaması doğru

---

### Faz 3: Dağılım Barı (1 saat)

---

#### T004: AssetDistributionBar Component
```yaml
id: T004
status: pending
type: component
priority: MEDIUM
estimate: 60 min
dependencies: [T002]
parallel: true
```

**Dosya**: `components/portfolio/asset-distribution-bar.tsx`

**Açıklama**: Top varlıkların yüzdesel dağılımını gösteren horizontal bar.

**UI Yapısı**:
- Horizontal bar with colored segments
- Top 6 varlık
- "Diğer" kategorisi
- Hover tooltip

**Acceptance Criteria**:
- [ ] Bar doğru yüzdeleri gösteriyor
- [ ] Renkler unique
- [ ] Tooltip çalışıyor
- [ ] "Diğer" hesaplaması doğru

---

### Faz 4: Sortable Tablo (2 saat)

---

#### T005: SortableTableHeader Component
```yaml
id: T005
status: pending
type: component
priority: HIGH
estimate: 30 min
dependencies: [T001]
parallel: true
```

**Dosya**: `components/portfolio/sortable-table-header.tsx`

**Açıklama**: Tıklanabilir, sort indicator gösteren tablo başlığı.

**Acceptance Criteria**:
- [ ] Click ile sort tetikleniyor
- [ ] Asc/Desc indicator görünüyor
- [ ] Active column vurgulanıyor

---

#### T006: SortableAssetsTable Component
```yaml
id: T006
status: pending
type: component
priority: HIGH
estimate: 60 min
dependencies: [T002, T005, T008, T009]
parallel: false
```

**Dosya**: `components/portfolio/sortable-assets-table.tsx`

**Açıklama**: Condensed, sortable, responsive varlık tablosu.

**Kolonlar**:
| Kolon | Sortable | Mobile |
|-------|----------|--------|
| # | ✗ | ✗ |
| Sembol | ✓ | ✓ |
| Ağırlık | ✓ | ✓ |
| Değer | ✓ | ✓ |
| Maliyet | ✓ | ✗ |
| G/Z | ✓ | ✗ |
| G/Z % | ✓ | ✓ |
| Kategori | ✓ | ✗ |
| Aksiyon | ✗ | ✓ |

**Acceptance Criteria**:
- [ ] Tüm kolonlar render ediliyor
- [ ] Sorting çalışıyor
- [ ] Condensed stili uygulanmış
- [ ] Mobile'da gizli kolonlar

---

#### T007: Table Actions (Al/Sat Butonları)
```yaml
id: T007
status: pending
type: component
priority: MEDIUM
estimate: 30 min
dependencies: [T006]
parallel: false
```

**Açıklama**: Satır içi Al/Sat butonları.

**Acceptance Criteria**:
- [ ] Butonlar görünüyor
- [ ] Link'ler doğru URL'e gidiyor
- [ ] Hover state çalışıyor

---

### Faz 5: Policy Status Badges (1 saat)

---

#### T008: PositionCategoryBadge Component
```yaml
id: T008
status: pending
type: component
priority: MEDIUM
estimate: 30 min
dependencies: [T001]
parallel: true
```

**Dosya**: `components/portfolio/position-category-badge.tsx`

**Açıklama**: CORE/SATELLITE/NEW kategori badge'i.

**Renk Mapping**:
- CORE → Yeşil
- SATELLITE → Mavi
- NEW → Sarı
- OVER → Kırmızı uyarı

**Acceptance Criteria**:
- [ ] Renk mapping doğru
- [ ] Dark mode uyumlu
- [ ] OverWeight uyarısı gösteriyor

---

#### T009: WeightIndicator Component
```yaml
id: T009
status: pending
type: component
priority: MEDIUM
estimate: 30 min
dependencies: [T001]
parallel: true
```

**Dosya**: `components/portfolio/weight-indicator.tsx`

**Açıklama**: Ağırlık yüzdesi ve aşım göstergesi.

**Acceptance Criteria**:
- [ ] Yüzde formatı doğru
- [ ] Aşım durumunda uyarı
- [ ] Top position arrow

---

### Faz 6: Ana Sayfa Entegrasyonu (1 saat)

---

#### T010: Update Portfolio Dashboard Page
```yaml
id: T010
status: pending
type: integration
priority: CRITICAL
estimate: 30 min
dependencies: [T003, T004, T006]
parallel: false
```

**Dosya**: `app/(protected)/p/[slug]/page.tsx`

**Açıklama**: Tüm komponentleri birleştir.

**Acceptance Criteria**:
- [ ] Tüm komponentler render ediliyor
- [ ] Layout doğru
- [ ] Varlık Ekle butonu çalışıyor

---

#### T011: Data Fetching Updates
```yaml
id: T011
status: pending
type: integration
priority: HIGH
estimate: 20 min
dependencies: [T010]
parallel: false
```

**Açıklama**: Policy ve cash API çağrıları ekle.

**Acceptance Criteria**:
- [ ] Policy fetch çalışıyor
- [ ] Cash positions fetch çalışıyor
- [ ] Error handling mevcut

---

#### T012: Sort State Management
```yaml
id: T012
status: pending
type: integration
priority: HIGH
estimate: 10 min
dependencies: [T010]
parallel: false
```

**Açıklama**: Sorting state ve handler.

**Acceptance Criteria**:
- [ ] Default sort: weight desc
- [ ] Toggle çalışıyor
- [ ] State persist

---

### Faz 7: Testing & Polish (1 saat)

---

#### T013: TypeScript Check
```yaml
id: T013
status: pending
type: testing
priority: HIGH
estimate: 10 min
dependencies: [T012]
parallel: false
```

**Komut**: `npx tsc --noEmit`

**Acceptance Criteria**:
- [ ] Sıfır TypeScript hatası

---

#### T014: Visual Testing
```yaml
id: T014
status: pending
type: testing
priority: MEDIUM
estimate: 20 min
dependencies: [T013]
parallel: true
```

**Açıklama**: Desktop, Tablet, Mobile, Dark mode test.

**Acceptance Criteria**:
- [ ] Desktop görünümü OK
- [ ] Tablet görünümü OK
- [ ] Mobile görünümü OK
- [ ] Dark mode OK

---

#### T015: Functional Testing
```yaml
id: T015
status: pending
type: testing
priority: MEDIUM
estimate: 20 min
dependencies: [T013]
parallel: true
```

**Açıklama**: Sorting, navigation, button test.

**Acceptance Criteria**:
- [ ] Tüm kolonlar sortable
- [ ] Link navigation çalışıyor
- [ ] Al/Sat butonları çalışıyor
- [ ] Empty state görünüyor

---

#### T016: Polish
```yaml
id: T016
status: pending
type: polish
priority: LOW
estimate: 10 min
dependencies: [T014, T015]
parallel: false
```

**Açıklama**: Loading states, tooltip'ler, error handling.

**Acceptance Criteria**:
- [ ] Loading spinner
- [ ] Error mesajları
- [ ] Tooltip'ler çalışıyor

---

## 🚀 AI Execution Strategy

### Parallel Batch 1 (Bağımsız)
```
T001, T003, T005, T008, T009
```
Bu tasklar birlikte çalıştırılabilir, dependency yok.

### Sequential Batch 2
```
T002 (depends on T001)
T004 (depends on T002)
T006 (depends on T002, T005, T008, T009)
T007 (depends on T006)
```

### Integration Batch 3
```
T010 → T011 → T012 → T013
```
Sıralı çalışmalı.

### Testing Batch 4 (Parallel)
```
T014, T015 (parallel)
T016 (after both)
```

---

## 📁 Files to Create/Modify

### New Files (8)
```
lib/types/asset-metrics.ts
lib/utils/asset-sorting.ts
components/portfolio/portfolio-summary-cards.tsx
components/portfolio/asset-distribution-bar.tsx
components/portfolio/sortable-table-header.tsx
components/portfolio/sortable-assets-table.tsx
components/portfolio/position-category-badge.tsx
components/portfolio/weight-indicator.tsx
```

### Modified Files (1)
```
app/(protected)/p/[slug]/page.tsx
```

---

## ✅ Execution Command

```
/sp-execute T001
```

veya tümünü çalıştırmak için:

```
/sp-execute all
```
