# Implementation Plan: Portföy Varlıkları Sayfası Redesign

## Specification Reference
- **Spec ID**: SPEC-012
- **Spec Version**: 1.0
- **Plan Version**: 1.0
- **Generated**: 2026-01-03
- **Estimated Duration**: 7 saat

---

## 📋 Özet

Bu plan, Portföy Varlıkları sayfasını profesyonel bir tasarıma dönüştürmek için gerekli tüm adımları içerir. Tailwind UI "With condensed content" stili, sortable tablo, özet kartlar ve policy göstergeleri implementasyonu yapılacaktır.

---

## 🏗️ Faz 1: Temel Tipler ve Utilities (30 dk)

### Hedef
Yeni komponentler için gerekli TypeScript tiplerini ve utility fonksiyonlarını oluştur.

### Tasks

#### T001: AssetWithMetrics Interface
**Dosya**: `lib/types/asset-metrics.ts`

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
  | 'value' 
  | 'costBasis' 
  | 'gainLoss' 
  | 'gainLossPercent'
  | 'category';

export type SortDirection = 'asc' | 'desc';
```

#### T002: Sorting Utility
**Dosya**: `lib/utils/asset-sorting.ts`

```typescript
export function sortAssets(
  assets: AssetWithMetrics[], 
  column: SortColumn, 
  direction: SortDirection
): AssetWithMetrics[];

export function calculateAssetMetrics(
  assets: Asset[],
  totalPortfolioValue: number,
  policy: PortfolioPolicy | null
): AssetWithMetrics[];
```

### Deliverables
- [ ] `lib/types/asset-metrics.ts`
- [ ] `lib/utils/asset-sorting.ts`

---

## 🏗️ Faz 2: Özet Kartları (1 saat)

### Hedef
4 adet özet kartı komponenti oluştur: Toplam Değer, Günlük Değişim, Nakit Durumu, Policy Uyumu.

### Tasks

#### T003: PortfolioSummaryCards Component
**Dosya**: `components/portfolio/portfolio-summary-cards.tsx`

```typescript
interface PortfolioSummaryCardsProps {
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  cashAmount: number;
  cashPercent: number;
  cashTarget: number;
  policyViolations: PolicyViolation[];
  assetCount: number;
  displayCurrency: string;
}
```

**UI Yapısı**:
- 4 kolonlu grid (lg), 2x2 (md), 1 kolon (sm)
- Her kart: Başlık, ana değer, alt bilgi
- Renk kodlaması: Yeşil/Kırmızı değişim, Sarı/Yeşil nakit durumu

### Deliverables
- [ ] `components/portfolio/portfolio-summary-cards.tsx`

---

## 🏗️ Faz 3: Dağılım Barı (1 saat)

### Hedef
Top varlıkların yüzdesel dağılımını gösteren horizontal bar komponenti.

### Tasks

#### T004: AssetDistributionBar Component
**Dosya**: `components/portfolio/asset-distribution-bar.tsx`

```typescript
interface AssetDistributionBarProps {
  assets: AssetWithMetrics[];
  totalValue: number;
  maxItems?: number; // default 6
}
```

**UI Yapısı**:
- Horizontal bar with colored segments
- Top 6 varlık gösterilir
- Kalan varlıklar "Diğer" olarak gruplandırılır
- Hover tooltip: Sembol, değer, yüzde
- Her sembol için unique renk (index-based)

### Deliverables
- [ ] `components/portfolio/asset-distribution-bar.tsx`

---

## 🏗️ Faz 4: Sortable Tablo (2 saat)

### Hedef
Condensed, sortable, responsive varlık tablosu.

### Tasks

#### T005: SortableTableHeader Component
**Dosya**: `components/portfolio/sortable-table-header.tsx`

```typescript
interface SortableTableHeaderProps {
  column: SortColumn;
  currentSort: SortColumn;
  direction: SortDirection;
  onSort: (column: SortColumn) => void;
  children: React.ReactNode;
  className?: string;
}
```

#### T006: SortableAssetsTable Component
**Dosya**: `components/portfolio/sortable-assets-table.tsx`

**Kolonlar**:
| Kolon | Sortable | Mobile | Açıklama |
|-------|----------|--------|----------|
| # | ✗ | ✗ | Sıra numarası |
| Sembol | ✓ | ✓ | Link to detail |
| Ağırlık | ✓ | ✓ | Weight % + indicator |
| Değer | ✓ | ✓ | Current value |
| Maliyet | ✓ | ✗ | Cost basis |
| G/Z | ✓ | ✗ | Gain/Loss amount |
| G/Z % | ✓ | ✓ | Gain/Loss percent |
| Kategori | ✓ | ✗ | Position category badge |
| Aksiyon | ✗ | ✓ | Buy/Sell buttons |

**Condensed Stili**:
```css
.condensed-row {
  @apply py-2 px-3 text-sm;
}
.condensed-header {
  @apply py-2 px-3 text-xs font-medium uppercase tracking-wider;
}
```

#### T007: Table Actions (Al/Sat Butonları)
**Dosya**: İçeride

```typescript
<div className="flex gap-1">
  <Button size="xs" color="green" href={buyUrl}>Al</Button>
  <Button size="xs" color="red" href={sellUrl}>Sat</Button>
</div>
```

### Deliverables
- [ ] `components/portfolio/sortable-table-header.tsx`
- [ ] `components/portfolio/sortable-assets-table.tsx`

---

## 🏗️ Faz 5: Policy Status Badges (1 saat)

### Hedef
Kategori ve aşım durumu gösteren badge komponentleri.

### Tasks

#### T008: PositionCategoryBadge Component
**Dosya**: `components/portfolio/position-category-badge.tsx`

```typescript
interface PositionCategoryBadgeProps {
  category: PositionCategory;
  isOverWeight?: boolean;
  showLabel?: boolean;
}
```

**Renk Mapping**:
- CORE → `bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`
- SATELLITE → `bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400`
- NEW → `bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`
- OVER → `bg-red-100 text-red-800` (additional warning badge)

#### T009: WeightIndicator Component
**Dosya**: `components/portfolio/weight-indicator.tsx`

```typescript
interface WeightIndicatorProps {
  weight: number;
  maxWeight: number;
  showWarning?: boolean;
}
```

**Gösterim**:
- Normal: `12.5%`
- Over: `12.5% ⚠️` (kırmızı renk)
- Arrow indicator if top position

### Deliverables
- [ ] `components/portfolio/position-category-badge.tsx`
- [ ] `components/portfolio/weight-indicator.tsx`

---

## 🏗️ Faz 6: Ana Sayfa Entegrasyonu (1 saat)

### Hedef
Tüm komponentleri birleştirip mevcut sayfayı güncelle.

### Tasks

#### T010: Update Portfolio Dashboard Page
**Dosya**: `app/(protected)/p/[slug]/page.tsx`

**Yeni Yapı**:
```tsx
<div className="space-y-6">
  {/* Özet Kartları */}
  <PortfolioSummaryCards {...summaryProps} />
  
  {/* Dağılım Barı */}
  <AssetDistributionBar assets={sortedAssets} totalValue={totalValue} />
  
  {/* Tablo Header + Buton */}
  <div className="flex items-center justify-between">
    <Heading level={2}>Varlıklar ({assets.length})</Heading>
    <Button href={`/p/${slug}/assets/new`}>
      <PlusIcon /> Varlık Ekle
    </Button>
  </div>
  
  {/* Sortable Tablo */}
  <SortableAssetsTable 
    assets={sortedAssets}
    sortColumn={sortColumn}
    sortDirection={sortDirection}
    onSort={handleSort}
    policy={policy}
    slug={slug}
  />
</div>
```

#### T011: Data Fetching Updates
- Policy API çağrısı ekle
- Cash positions API çağrısı ekle
- Violations hesaplaması ekle

#### T012: Sort State Management
```typescript
const [sortColumn, setSortColumn] = useState<SortColumn>('weight');
const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

const handleSort = (column: SortColumn) => {
  if (sortColumn === column) {
    setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
  } else {
    setSortColumn(column);
    setSortDirection('desc');
  }
};
```

### Deliverables
- [ ] Updated `app/(protected)/p/[slug]/page.tsx`

---

## 🏗️ Faz 7: Testing & Polish (1 saat)

### Tasks

#### T013: TypeScript Check
```bash
npx tsc --noEmit
```

#### T014: Visual Testing
- Desktop görünümü kontrol
- Tablet görünümü kontrol
- Mobile görünümü kontrol
- Dark mode kontrol

#### T015: Functional Testing
- Sorting test (tüm kolonlar)
- Link navigation test
- Al/Sat button test
- Empty state test

#### T016: Polish
- Loading states
- Error handling
- Empty state mesajları
- Tooltip'ler

### Deliverables
- [ ] Tüm testler geçiyor
- [ ] Responsive tasarım çalışıyor
- [ ] Dark mode uyumlu

---

## 📁 Dosya Değişiklikleri

### Yeni Dosyalar
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

### Güncellenen Dosyalar
```
app/(protected)/p/[slug]/page.tsx
```

---

## 🔗 Bağımlılıklar

### Mevcut Kullanılacak Komponentler
- `components/ui/table.tsx`
- `components/ui/badge.tsx`
- `components/ui/button.tsx`
- `components/ui/heading.tsx`

### Mevcut Kullanılacak Hooks
- `useCashPositions` (lib/hooks/use-cash-positions.ts)
- `useCurrency` (lib/context/currency-context.tsx)
- `usePortfolio` (lib/context/portfolio-context.tsx)

### Mevcut Kullanılacak API'ler
- `/api/portfolios/[id]/policy`
- `/api/portfolios/[id]/cash`
- `/api/portfolios/[id]/violations`

---

## ✅ SDD Compliance Gates

### Principle 1: Specification First ✓
- [x] Clear requirements documented in spec-001.md
- [x] UI mockups provided
- [x] Acceptance criteria defined

### Principle 2: Incremental Planning ✓
- [x] Work broken into 7 phases
- [x] Each phase delivers working component
- [x] Dependencies clearly identified

### Principle 3: Task Decomposition ✓
- [x] 16 specific tasks defined
- [x] Effort estimates provided (30min-2hr per task)
- [x] Clear deliverables for each task

### Principle 6: Quality Assurance ✓
- [x] Testing phase included
- [x] TypeScript validation
- [x] Visual and functional testing defined

### Principle 7: Architecture Documentation ✓
- [x] Component interfaces documented
- [x] File structure defined
- [x] Integration points identified

---

## 📊 İlerleme Takibi

| Faz | Süre | Durum |
|-----|------|-------|
| Faz 1: Tipler & Utils | 30 dk | ⬜ Pending |
| Faz 2: Özet Kartları | 1 saat | ⬜ Pending |
| Faz 3: Dağılım Barı | 1 saat | ⬜ Pending |
| Faz 4: Sortable Tablo | 2 saat | ⬜ Pending |
| Faz 5: Policy Badges | 1 saat | ⬜ Pending |
| Faz 6: Entegrasyon | 1 saat | ⬜ Pending |
| Faz 7: Testing | 1 saat | ⬜ Pending |
| **Toplam** | **7.5 saat** | |
