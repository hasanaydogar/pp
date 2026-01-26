# Task Breakdown: Customizable Table Columns

<!-- FEATURE_DIR: 020-customizable-table-columns -->
<!-- FEATURE_ID: 020 -->
<!-- TASK_LIST_ID: 001 -->
<!-- STATUS: completed -->
<!-- CREATED: 2026-01-26 -->
<!-- LAST_UPDATED: 2026-01-26 -->

## Progress Overview
- **Total Tasks**: 25
- **Completed Tasks**: 25 (100%)
- **In Progress Tasks**: 0
- **Blocked Tasks**: 0

## Task Categories

### Phase 1: Foundation & Types [Priority: HIGH]

- [x] **T001**: [S] @dnd-kit paketlerini kur - 0.5h ✓
- [x] **T002**: [S] Kolon konfigürasyon type'larını oluştur - 1h ✓
- [x] **T003**: [S] Varsayılan kolon konfigürasyonunu tanımla - 1h ✓
- [x] **T004**: [M] useTablePreferences hook iskeletini oluştur - 2h ✓

### Phase 2: Hook & Persistence [Priority: HIGH]

- [x] **T005**: [S] localStorage helper fonksiyonları - 1h ✓
- [x] **T006**: [M] useTablePreferences hook implementasyonu - 3h ✓
- [x] **T007**: [M] Hook için unit testler - 2h ✓
- [x] **T008**: [S] Kolon sıralama utility fonksiyonları - 1h ✓

### Phase 3: Column Config Panel UI [Priority: HIGH]

- [x] **T009**: [M] ColumnConfigPanel bileşeni oluştur - 3h ✓
- [x] **T010**: [M] Drag-and-drop sortable list implementasyonu - 3h ✓
- [x] **T011**: [S] Checkbox toggle implementasyonu - 1h ✓
- [x] **T012**: [S] "Varsayılana Sıfırla" butonu - 0.5h ✓
- [x] **T013**: [M] Panel için Dropdown/Popover entegrasyonu - 2h ✓
- [x] **T014**: [S] Dark mode ve responsive styling - 1h ✓

### Phase 4: Table Integration [Priority: HIGH]

- [x] **T015**: [M] SortableAssetsTable props güncelleme - 2h ✓
- [x] **T016**: [L] Dinamik kolon render logic'i - 4h ✓
- [x] **T017**: [M] Kolon renderer map oluştur - 2h ✓
- [x] **T018**: [M] Portfolio dashboard entegrasyonu - 2h ✓
- [x] **T019**: [S] Tablo başlığına ayar ikonu ekle - 1h ✓

### Phase 5: Testing & Polish [Priority: MEDIUM]

- [x] **T020**: [M] Unit testler - ColumnConfigPanel - 2h ✓
- [x] **T021**: [M] Integration testler - tablo + panel - 2h ✓
- [x] **T022**: [M] E2E testler - tam kullanıcı akışı - 3h ✓
- [x] **T023**: [M] Accessibility (a11y) testleri ve iyileştirmeleri - 2h ✓
- [x] **T024**: [S] Performance optimizasyonu - 1h ✓
- [x] **T025**: [S] Edge case'ler ve error handling - 1h ✓

---

## Task Details

### Phase 1: Foundation & Types

#### T001: @dnd-kit Paketlerini Kur [P]
- **Description**: Sürükle-bırak özelliği için gerekli @dnd-kit paketlerini npm ile kur
- **Files**:
  - `package.json` (modify)
- **Commands**:
  ```bash
  npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
  ```
- **Acceptance Criteria**:
  - [ ] @dnd-kit/core kurulu
  - [ ] @dnd-kit/sortable kurulu
  - [ ] @dnd-kit/utilities kurulu
  - [ ] package-lock.json güncellenmiş
- **Dependencies**: None
- **Parallel**: [P] - Can run independently
- **Estimated Time**: 0.5h

---

#### T002: Kolon Konfigürasyon Type'ları [P]
- **Description**: TypeScript interface ve type tanımları oluştur
- **Files**:
  - `lib/types/table-columns.ts` (create)
- **Implementation**:
  ```typescript
  export interface ColumnConfig {
    id: string;
    label: string;
    visible: boolean;
    sortable: boolean;
    required: boolean;
    order: number;
    align: 'left' | 'right' | 'center';
    minWidth?: string;
    responsiveHide?: string;
  }

  export interface TablePreferences {
    version: number;
    portfolioId: string;
    columns: ColumnConfig[];
    lastUpdated: string;
  }

  export const COLUMN_IDS = {
    ROW_NUMBER: 'rowNumber',
    SYMBOL: 'symbol',
    CURRENT_PRICE: 'currentPrice',
    WEIGHT: 'weight',
    CURRENT_VALUE: 'currentValue',
    COST_BASIS: 'costBasis',
    GAIN_LOSS: 'gainLoss',
    GAIN_LOSS_PERCENT: 'gainLossPercent',
    DAILY_CHANGE: 'dailyChange',
    CATEGORY: 'category',
    ACTIONS: 'actions',
  } as const;

  export type ColumnId = typeof COLUMN_IDS[keyof typeof COLUMN_IDS];
  ```
- **Acceptance Criteria**:
  - [ ] ColumnConfig interface tanımlı
  - [ ] TablePreferences interface tanımlı
  - [ ] COLUMN_IDS const object tanımlı
  - [ ] TypeScript derlemesi hatasız
- **Dependencies**: None
- **Parallel**: [P] - Can run with T001
- **Estimated Time**: 1h

---

#### T003: Varsayılan Kolon Konfigürasyonu [P]
- **Description**: Mevcut tablo kolonlarına göre varsayılan konfigürasyonu tanımla
- **Files**:
  - `lib/config/default-columns.ts` (create)
- **Implementation**:
  ```typescript
  import { ColumnConfig, COLUMN_IDS } from '@/lib/types/table-columns';

  export const DEFAULT_COLUMNS: ColumnConfig[] = [
    { id: COLUMN_IDS.ROW_NUMBER, label: '#', visible: true, sortable: false, required: false, order: 0, align: 'center', responsiveHide: 'sm:table-cell' },
    { id: COLUMN_IDS.SYMBOL, label: 'Sembol', visible: true, sortable: true, required: true, order: 1, align: 'left' },
    { id: COLUMN_IDS.CURRENT_PRICE, label: 'Son Fiyat', visible: true, sortable: true, required: false, order: 2, align: 'right', responsiveHide: 'sm:table-cell' },
    { id: COLUMN_IDS.WEIGHT, label: 'Ağırlık', visible: true, sortable: true, required: false, order: 3, align: 'right' },
    { id: COLUMN_IDS.CURRENT_VALUE, label: 'Değer', visible: true, sortable: true, required: false, order: 4, align: 'right' },
    { id: COLUMN_IDS.COST_BASIS, label: 'Maliyet', visible: true, sortable: true, required: false, order: 5, align: 'right', responsiveHide: 'lg:table-cell' },
    { id: COLUMN_IDS.GAIN_LOSS, label: 'G/Z', visible: true, sortable: true, required: false, order: 6, align: 'right', responsiveHide: 'md:table-cell' },
    { id: COLUMN_IDS.GAIN_LOSS_PERCENT, label: 'G/Z %', visible: true, sortable: true, required: false, order: 7, align: 'right' },
    { id: COLUMN_IDS.DAILY_CHANGE, label: 'Günlük', visible: true, sortable: true, required: false, order: 8, align: 'right', responsiveHide: 'xl:table-cell' },
    { id: COLUMN_IDS.CATEGORY, label: 'Kategori', visible: true, sortable: true, required: false, order: 9, align: 'left', responsiveHide: 'lg:table-cell' },
    { id: COLUMN_IDS.ACTIONS, label: 'Aksiyon', visible: true, sortable: false, required: true, order: 10, align: 'right' },
  ];

  export const PREFERENCES_VERSION = 1;
  ```
- **Acceptance Criteria**:
  - [ ] 11 kolon tanımlı (mevcut tablodaki tüm kolonlar)
  - [ ] Symbol ve Actions kolonları required: true
  - [ ] Responsive hide class'ları doğru
  - [ ] Kolon sırası mevcut tabloyla uyumlu
- **Dependencies**: T002
- **Parallel**: [P] - Can run after T002
- **Estimated Time**: 1h

---

#### T004: useTablePreferences Hook İskeleti
- **Description**: Hook'un temel yapısını ve interface'ini oluştur
- **Files**:
  - `lib/hooks/use-table-preferences.ts` (create)
- **Implementation**:
  ```typescript
  import { useState, useEffect, useCallback } from 'react';
  import { ColumnConfig, TablePreferences } from '@/lib/types/table-columns';
  import { DEFAULT_COLUMNS } from '@/lib/config/default-columns';

  export interface UseTablePreferencesReturn {
    columns: ColumnConfig[];
    visibleColumns: ColumnConfig[];
    setColumnOrder: (columns: ColumnConfig[]) => void;
    toggleColumnVisibility: (columnId: string) => void;
    resetToDefault: () => void;
    isLoading: boolean;
  }

  export function useTablePreferences(portfolioId: string): UseTablePreferencesReturn {
    const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
    const [isLoading, setIsLoading] = useState(true);

    // TODO: Implement in T006
    const visibleColumns = columns.filter(c => c.visible).sort((a, b) => a.order - b.order);

    return {
      columns,
      visibleColumns,
      setColumnOrder: () => {},
      toggleColumnVisibility: () => {},
      resetToDefault: () => {},
      isLoading,
    };
  }
  ```
- **Acceptance Criteria**:
  - [ ] Hook export edilmiş
  - [ ] Return type interface tanımlı
  - [ ] Default columns ile initialize
  - [ ] TypeScript derlemesi hatasız
- **Dependencies**: T002, T003
- **Parallel**: Sequential after T002, T003
- **Estimated Time**: 2h

---

### Phase 2: Hook & Persistence

#### T005: localStorage Helper Fonksiyonları
- **Description**: localStorage okuma/yazma utility fonksiyonları
- **Files**:
  - `lib/utils/table-storage.ts` (create)
- **Implementation**:
  ```typescript
  import { TablePreferences, ColumnConfig } from '@/lib/types/table-columns';
  import { DEFAULT_COLUMNS, PREFERENCES_VERSION } from '@/lib/config/default-columns';

  const STORAGE_KEY_PREFIX = 'table-prefs-';

  export function getStorageKey(portfolioId: string): string {
    return `${STORAGE_KEY_PREFIX}${portfolioId}`;
  }

  export function loadPreferences(portfolioId: string): TablePreferences | null {
    if (typeof window === 'undefined') return null;
    try {
      const key = getStorageKey(portfolioId);
      const stored = localStorage.getItem(key);
      if (!stored) return null;
      const prefs = JSON.parse(stored) as TablePreferences;
      // Version check for migration
      if (prefs.version !== PREFERENCES_VERSION) {
        return null; // Will trigger migration in future
      }
      return prefs;
    } catch {
      return null;
    }
  }

  export function savePreferences(portfolioId: string, columns: ColumnConfig[]): void {
    if (typeof window === 'undefined') return;
    try {
      const prefs: TablePreferences = {
        version: PREFERENCES_VERSION,
        portfolioId,
        columns,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(getStorageKey(portfolioId), JSON.stringify(prefs));
    } catch (e) {
      console.error('Failed to save table preferences:', e);
    }
  }

  export function clearPreferences(portfolioId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(getStorageKey(portfolioId));
  }
  ```
- **Acceptance Criteria**:
  - [ ] loadPreferences fonksiyonu çalışıyor
  - [ ] savePreferences fonksiyonu çalışıyor
  - [ ] clearPreferences fonksiyonu çalışıyor
  - [ ] SSR-safe (typeof window check)
  - [ ] Error handling mevcut
- **Dependencies**: T002, T003
- **Parallel**: [P] - Can run with T004
- **Estimated Time**: 1h

---

#### T006: useTablePreferences Hook Implementasyonu
- **Description**: Hook'un tam implementasyonu
- **Files**:
  - `lib/hooks/use-table-preferences.ts` (modify)
- **Implementation**: Full hook with localStorage integration
- **Acceptance Criteria**:
  - [ ] localStorage'dan tercih yükleme çalışıyor
  - [ ] setColumnOrder kolon sırasını değiştiriyor
  - [ ] toggleColumnVisibility kolonu gizliyor/gösteriyor
  - [ ] resetToDefault varsayılana dönüyor
  - [ ] Değişiklikler localStorage'a kaydediliyor
  - [ ] SSR hydration mismatch yok
- **Dependencies**: T004, T005
- **Parallel**: Sequential
- **Estimated Time**: 3h

---

#### T007: Hook Unit Testleri
- **Description**: useTablePreferences hook'u için kapsamlı unit testler
- **Files**:
  - `__tests__/unit/hooks/use-table-preferences.test.ts` (create)
- **Test Cases**:
  - [ ] Default columns ile initialize
  - [ ] localStorage'dan yükleme
  - [ ] Kolon sıralama değişikliği
  - [ ] Kolon görünürlük toggle
  - [ ] Varsayılana sıfırlama
  - [ ] Farklı portfolioId'ler için ayrı tercihler
  - [ ] SSR/hydration senaryoları
- **Acceptance Criteria**:
  - [ ] Tüm test case'leri yazıldı
  - [ ] Tüm testler geçiyor
  - [ ] Coverage >90%
- **Dependencies**: T006
- **Parallel**: Sequential after T006
- **Estimated Time**: 2h

---

#### T008: Kolon Sıralama Utility Fonksiyonları
- **Description**: Kolon manipulation utility fonksiyonları
- **Files**:
  - `lib/utils/column-utils.ts` (create)
- **Implementation**:
  ```typescript
  import { ColumnConfig } from '@/lib/types/table-columns';

  export function reorderColumns(
    columns: ColumnConfig[],
    fromIndex: number,
    toIndex: number
  ): ColumnConfig[] {
    const result = [...columns];
    const [moved] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, moved);
    return result.map((col, index) => ({ ...col, order: index }));
  }

  export function toggleColumn(
    columns: ColumnConfig[],
    columnId: string
  ): ColumnConfig[] {
    return columns.map(col =>
      col.id === columnId && !col.required
        ? { ...col, visible: !col.visible }
        : col
    );
  }

  export function getVisibleColumns(columns: ColumnConfig[]): ColumnConfig[] {
    return columns
      .filter(col => col.visible)
      .sort((a, b) => a.order - b.order);
  }
  ```
- **Acceptance Criteria**:
  - [ ] reorderColumns fonksiyonu çalışıyor
  - [ ] toggleColumn required kolonları değiştirmiyor
  - [ ] getVisibleColumns sıralı döndürüyor
  - [ ] Immutable operations (no mutation)
- **Dependencies**: T002
- **Parallel**: [P] - Can run with T005, T006
- **Estimated Time**: 1h

---

### Phase 3: Column Config Panel UI

#### T009: ColumnConfigPanel Bileşeni
- **Description**: Kolon yönetim paneli ana bileşeni
- **Files**:
  - `components/portfolio/column-config-panel.tsx` (create)
- **Props Interface**:
  ```typescript
  interface ColumnConfigPanelProps {
    columns: ColumnConfig[];
    onReorder: (columns: ColumnConfig[]) => void;
    onToggleVisibility: (columnId: string) => void;
    onReset: () => void;
  }
  ```
- **Acceptance Criteria**:
  - [ ] Bileşen render ediliyor
  - [ ] Tüm kolonlar listeleniyor
  - [ ] Required kolonlar disabled gösteriliyor
  - [ ] Props callback'leri çalışıyor
- **Dependencies**: T002, T003
- **Parallel**: [P] - Can start after Phase 1
- **Estimated Time**: 3h

---

#### T010: Drag-and-Drop Sortable List
- **Description**: @dnd-kit ile sürükle-bırak kolon sıralama
- **Files**:
  - `components/portfolio/column-config-panel.tsx` (modify)
  - `components/portfolio/sortable-column-item.tsx` (create)
- **Implementation**: DndContext, SortableContext, useSortable
- **Acceptance Criteria**:
  - [ ] Kolonlar sürüklenebiliyor
  - [ ] Drop işlemi yeni sırayı uyguluyor
  - [ ] Visual feedback (drag overlay)
  - [ ] Smooth animasyon
- **Dependencies**: T001, T009
- **Parallel**: Sequential after T009
- **Estimated Time**: 3h

---

#### T011: Checkbox Toggle
- **Description**: Kolon göster/gizle checkbox'ları
- **Files**:
  - `components/portfolio/sortable-column-item.tsx` (modify)
- **Acceptance Criteria**:
  - [ ] Checkbox tıklanabilir
  - [ ] Required kolonlar disabled
  - [ ] Toggle callback çağırılıyor
  - [ ] Visual state doğru
- **Dependencies**: T009, T010
- **Parallel**: Sequential
- **Estimated Time**: 1h

---

#### T012: Varsayılana Sıfırla Butonu
- **Description**: Reset to default button
- **Files**:
  - `components/portfolio/column-config-panel.tsx` (modify)
- **Acceptance Criteria**:
  - [ ] Buton görünür
  - [ ] Tıklandığında onReset çağırılıyor
  - [ ] Uygun styling
- **Dependencies**: T009
- **Parallel**: [P] - Can run with T010, T011
- **Estimated Time**: 0.5h

---

#### T013: Dropdown/Popover Entegrasyonu
- **Description**: Panel için Headless UI Popover entegrasyonu
- **Files**:
  - `components/portfolio/column-config-panel.tsx` (modify)
- **Acceptance Criteria**:
  - [ ] Ayar ikonuna tıklayınca panel açılıyor
  - [ ] Panel dışına tıklayınca kapanıyor
  - [ ] Keyboard navigation çalışıyor
  - [ ] Focus trap çalışıyor
- **Dependencies**: T009, T010, T011, T012
- **Parallel**: Sequential
- **Estimated Time**: 2h

---

#### T014: Dark Mode ve Responsive Styling
- **Description**: Tailwind dark mode ve responsive stiller
- **Files**:
  - `components/portfolio/column-config-panel.tsx` (modify)
  - `components/portfolio/sortable-column-item.tsx` (modify)
- **Acceptance Criteria**:
  - [ ] Dark mode tam uyumlu
  - [ ] Mobil görünüm düzgün
  - [ ] Mevcut design system ile tutarlı
- **Dependencies**: T013
- **Parallel**: Sequential
- **Estimated Time**: 1h

---

### Phase 4: Table Integration

#### T015: SortableAssetsTable Props Güncelleme
- **Description**: Tablo bileşenine yeni props ekle
- **Files**:
  - `components/portfolio/sortable-assets-table.tsx` (modify)
- **New Props**:
  ```typescript
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
  onResetColumns: () => void;
  ```
- **Acceptance Criteria**:
  - [ ] Yeni props tanımlı
  - [ ] TypeScript hatasız
  - [ ] Backward compatible (opsiyonel props)
- **Dependencies**: T002
- **Parallel**: [P] - Can start after Phase 1
- **Estimated Time**: 2h

---

#### T016: Dinamik Kolon Render Logic
- **Description**: Kolonları dinamik olarak render et
- **Files**:
  - `components/portfolio/sortable-assets-table.tsx` (modify)
- **Implementation**: visibleColumns.map() ile header ve body render
- **Acceptance Criteria**:
  - [ ] Sadece visible kolonlar render ediliyor
  - [ ] Kolon sırası columns array'e göre
  - [ ] Mevcut fonksiyonalite korunuyor
- **Dependencies**: T015
- **Parallel**: Sequential
- **Estimated Time**: 4h

---

#### T017: Kolon Renderer Map
- **Description**: Her kolon için header ve cell renderer fonksiyonları
- **Files**:
  - `components/portfolio/sortable-assets-table.tsx` (modify)
  - `lib/config/column-renderers.ts` (create - optional)
- **Implementation**:
  ```typescript
  const columnRenderers: Record<ColumnId, {
    header: (props) => ReactNode;
    cell: (asset, props) => ReactNode;
  }> = {
    [COLUMN_IDS.SYMBOL]: {
      header: () => <SortableTableHeader column="symbol">Sembol</SortableTableHeader>,
      cell: (asset) => <td>...</td>
    },
    // ... other columns
  };
  ```
- **Acceptance Criteria**:
  - [ ] Tüm kolonlar için renderer mevcut
  - [ ] Header renderer sorting destekliyor
  - [ ] Cell renderer mevcut styling koruyor
- **Dependencies**: T016
- **Parallel**: Sequential
- **Estimated Time**: 2h

---

#### T018: Portfolio Dashboard Entegrasyonu
- **Description**: Dashboard sayfasında hook ve panel kullanımı
- **Files**:
  - `app/(protected)/p/[slug]/page.tsx` (modify)
- **Implementation**:
  ```typescript
  const { columns, visibleColumns, setColumnOrder, toggleColumnVisibility, resetToDefault } =
    useTablePreferences(portfolio.id);

  <SortableAssetsTable
    columns={visibleColumns}
    onColumnsChange={setColumnOrder}
    onResetColumns={resetToDefault}
    // ... other props
  />
  ```
- **Acceptance Criteria**:
  - [ ] Hook entegre
  - [ ] Panel görünür
  - [ ] Tercihler kaydediliyor
  - [ ] Sayfa yenilenince tercihler korunuyor
- **Dependencies**: T006, T016, T017
- **Parallel**: Sequential
- **Estimated Time**: 2h

---

#### T019: Tablo Başlığına Ayar İkonu
- **Description**: Tablo üstüne kolon ayar butonu ekle
- **Files**:
  - `app/(protected)/p/[slug]/page.tsx` (modify)
- **Acceptance Criteria**:
  - [ ] Ayar ikonu görünür
  - [ ] Tıklandığında ColumnConfigPanel açılıyor
  - [ ] İkon konumu uygun
- **Dependencies**: T009, T013, T018
- **Parallel**: Sequential
- **Estimated Time**: 1h

---

### Phase 5: Testing & Polish

#### T020: ColumnConfigPanel Unit Testleri
- **Description**: Panel bileşeni için unit testler
- **Files**:
  - `__tests__/unit/components/column-config-panel.test.tsx` (create)
- **Test Cases**:
  - [ ] Render testi
  - [ ] Checkbox toggle testi
  - [ ] Reset butonu testi
  - [ ] Callback prop testleri
- **Dependencies**: T014
- **Parallel**: [P] - Can run with T015-T19
- **Estimated Time**: 2h

---

#### T021: Integration Testler
- **Description**: Tablo + Panel entegrasyon testleri
- **Files**:
  - `__tests__/integration/table-columns.test.tsx` (create)
- **Test Cases**:
  - [ ] Panel açma/kapama
  - [ ] Kolon gizleme -> tablo güncelleme
  - [ ] Kolon sıralama -> tablo güncelleme
  - [ ] localStorage persistence
- **Dependencies**: T019
- **Parallel**: Sequential after T019
- **Estimated Time**: 2h

---

#### T022: E2E Testler
- **Description**: Playwright ile tam kullanıcı akışı
- **Files**:
  - `e2e/table-customization.spec.ts` (create)
- **Test Scenarios**:
  - [ ] Ayar panelini aç
  - [ ] Kolon gizle, sayfa yenile, kolon hala gizli
  - [ ] Kolon sırala, sayfa yenile, sıra korunmuş
  - [ ] Varsayılana sıfırla
  - [ ] Farklı portföyler farklı tercihler
- **Dependencies**: T019
- **Parallel**: Sequential after T019
- **Estimated Time**: 3h

---

#### T023: Accessibility Testleri ve İyileştirmeleri
- **Description**: a11y standartlarına uygunluk
- **Files**:
  - `components/portfolio/column-config-panel.tsx` (modify)
  - `components/portfolio/sortable-column-item.tsx` (modify)
- **Checks**:
  - [ ] Keyboard navigation
  - [ ] Screen reader labels
  - [ ] Focus management
  - [ ] ARIA attributes
- **Dependencies**: T014
- **Parallel**: [P] - Can run with T020, T021
- **Estimated Time**: 2h

---

#### T024: Performance Optimizasyonu
- **Description**: useMemo, useCallback optimizasyonları
- **Files**:
  - `components/portfolio/sortable-assets-table.tsx` (modify)
  - `components/portfolio/column-config-panel.tsx` (modify)
- **Acceptance Criteria**:
  - [ ] Gereksiz re-render yok
  - [ ] Drag 60fps
  - [ ] React DevTools profiler clean
- **Dependencies**: T019
- **Parallel**: Sequential
- **Estimated Time**: 1h

---

#### T025: Edge Case'ler ve Error Handling
- **Description**: Hata durumları ve edge case'ler
- **Files**:
  - Multiple files (modify)
- **Cases**:
  - [ ] localStorage disabled
  - [ ] Corrupted localStorage data
  - [ ] Empty columns array
  - [ ] All optional columns hidden
  - [ ] Invalid column ID
- **Dependencies**: T019
- **Parallel**: [P] - Can run with T024
- **Estimated Time**: 1h

---

## Dependencies Graph

```
Phase 1 (Foundation):
T001 ──┬── T002 ──┬── T003 ──── T004
       │          │
       │          └── T005 ──┐
       │                     │
       │          T008 ──────┼─────┐
       │                     │     │
Phase 2 (Hook):              │     │
       └────────── T006 ◄────┘     │
                     │             │
                   T007            │
                                   │
Phase 3 (UI):                      │
T009 ◄─────────────────────────────┘
  │
  ├── T010 ── T011
  │
  ├── T012
  │
  └── T013 ── T014

Phase 4 (Integration):
T015 ── T016 ── T017 ── T018 ── T019
                          │
Phase 5 (Testing):        │
T020 ◄────────────────────┤
T021 ◄────────────────────┤
T022 ◄────────────────────┤
T023 ◄────────────────────┤
T024 ◄────────────────────┘
T025 ◄────────────────────┘
```

## Parallel Execution Opportunities

### Can Be Done In Parallel
- **Group A**: T001, T002 (both independent)
- **Group B**: T005, T008 (after T002, T003)
- **Group C**: T010, T011, T012 (within Phase 3, after T009)
- **Group D**: T020, T023, T025 (testing phase)

### Must Be Sequential
- T002 → T003 → T004 → T006 → T007 (core hook chain)
- T009 → T010 → T013 → T014 (UI chain)
- T015 → T016 → T017 → T018 → T019 (table integration chain)

## Progress Tracking

```yaml
status:
  total: 25
  completed: 25
  in_progress: 0
  blocked: 0
  completion_percentage: 100%

phases:
  phase_1_foundation:
    total: 4
    completed: 0
  phase_2_persistence:
    total: 4
    completed: 0
  phase_3_ui:
    total: 6
    completed: 0
  phase_4_integration:
    total: 5
    completed: 0
  phase_5_testing:
    total: 6
    completed: 0

estimated_total_hours: 40h
```

## Definition of Done (Per Task)

- [ ] Code implemented
- [ ] TypeScript hatasız
- [ ] Lint hatasız
- [ ] Birim testler yazıldı (varsa)
- [ ] Acceptance criteria karşılandı
- [ ] Dark mode test edildi (UI tasks)

## Notes & Decisions

- **Decision**: @dnd-kit seçildi (react-beautiful-dnd yerine) - daha hafif, React 18 uyumlu
- **Decision**: localStorage kullanılacak (server-side değil) - backend değişikliği gerektirmez
- **Decision**: Kolon ID'leri string olacak (sayı yerine) - type safety için
- **Note**: Symbol ve Actions kolonları her zaman görünür olacak (required: true)

---
**Legend:**
- [S] = Small (< 4 hours), [M] = Medium (4-8 hours), [L] = Large (> 8 hours)
- [P] = Parallel execution possible
- **Status**: [ ] Pending, [>] In Progress, [x] Completed, [!] Blocked
