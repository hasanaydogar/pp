# Implementation Plan: Customizable Table Columns

<!-- FEATURE_DIR: 020-customizable-table-columns -->
<!-- FEATURE_ID: 020 -->
<!-- PLAN_NUMBER: 001 -->
<!-- STATUS: pending -->
<!-- CREATED: 2026-01-26 -->

## Specification Reference
- **Spec ID**: SPEC-020
- **Spec Version**: 1.0
- **Plan Version**: 1.0
- **Generated**: 2026-01-26

## Architecture Overview

### High-Level Design

Bu özellik, mevcut `SortableAssetsTable` bileşenini genişleterek kullanıcıların tablo kolonlarını özelleştirmesine olanak tanıyacak. Mimari 3 ana katmandan oluşacak:

1. **Persistence Layer**: `useTablePreferences` hook - localStorage ile tercih saklama
2. **UI Layer**: `ColumnConfigPanel` bileşeni - kolon yönetim arayüzü
3. **Table Layer**: Güncellenmiş `SortableAssetsTable` - dinamik kolon render

```
┌─────────────────────────────────────────────────────────────┐
│                    Portfolio Dashboard                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  SortableAssetsTable                                   │ │
│  │  ┌──────────────────────────────────┐ ┌─────────────┐ │ │
│  │  │ Table Headers (Draggable)        │ │ ColumnConfig│ │ │
│  │  │ [Symbol][Price][Weight][Value]...│ │ Panel       │ │ │
│  │  └──────────────────────────────────┘ │ ☐ Symbol    │ │ │
│  │  ┌──────────────────────────────────┐ │ ☐ Price     │ │ │
│  │  │ Table Body (Dynamic Columns)     │ │ ☐ Weight    │ │ │
│  │  └──────────────────────────────────┘ │ [Reset]     │ │ │
│  │                                       └─────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│           ↓                    ↓                            │
│  ┌─────────────────┐  ┌──────────────────┐                 │
│  │useTablePrefs    │  │ @dnd-kit/sortable│                 │
│  │ localStorage    │  │ drag-and-drop    │                 │
│  └─────────────────┘  └──────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

### Technical Stack
- **Frontend**: React 18, TypeScript, Next.js 16
- **Drag-and-Drop**: @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
- **State Management**: React hooks + localStorage
- **Styling**: Tailwind CSS (mevcut sistem)
- **Testing**: Jest, React Testing Library, Playwright

## Implementation Phases

### Phase 1: Foundation & Types [Priority: HIGH]
**Dependencies**: None

#### Tasks
1. [ ] **T001**: @dnd-kit paketlerini kur (`npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`)
2. [ ] **T002**: Kolon konfigürasyon type'larını oluştur (`lib/types/table-columns.ts`)
3. [ ] **T003**: Varsayılan kolon konfigürasyonunu tanımla (`lib/config/default-columns.ts`)
4. [ ] **T004**: `useTablePreferences` hook'unu oluştur (`lib/hooks/use-table-preferences.ts`)

#### Deliverables
- [ ] @dnd-kit paketleri kurulu
- [ ] TypeScript interface'leri tanımlı
- [ ] Varsayılan kolon sırası ve görünürlük ayarları
- [ ] localStorage ile tercih okuma/yazma hook'u

#### Type Definitions (T002)
```typescript
// lib/types/table-columns.ts
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
  version: number;  // For migration support
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
```

### Phase 2: Hook & Persistence [Priority: HIGH]
**Dependencies**: Phase 1 complete

#### Tasks
5. [ ] **T005**: localStorage helper fonksiyonları (`lib/utils/table-storage.ts`)
6. [ ] **T006**: `useTablePreferences` hook implementasyonu
7. [ ] **T007**: Hook için unit testler (`__tests__/unit/hooks/use-table-preferences.test.ts`)
8. [ ] **T008**: Kolon sıralama utility fonksiyonları (`lib/utils/column-utils.ts`)

#### Deliverables
- [ ] localStorage read/write utility'leri
- [ ] Tam fonksiyonel useTablePreferences hook
- [ ] %100 test coverage
- [ ] Kolon reorder/toggle utility fonksiyonları

#### Hook API (T006)
```typescript
// lib/hooks/use-table-preferences.ts
export function useTablePreferences(portfolioId: string) {
  return {
    columns: ColumnConfig[],
    visibleColumns: ColumnConfig[],
    setColumnOrder: (columns: ColumnConfig[]) => void,
    toggleColumnVisibility: (columnId: string) => void,
    resetToDefault: () => void,
    isLoading: boolean,
  };
}
```

### Phase 3: Column Config Panel UI [Priority: HIGH]
**Dependencies**: Phase 2 complete

#### Tasks
9. [ ] **T009**: `ColumnConfigPanel` bileşeni oluştur (`components/portfolio/column-config-panel.tsx`)
10. [ ] **T010**: Drag-and-drop sortable list implementasyonu
11. [ ] **T011**: Checkbox toggle implementasyonu
12. [ ] **T012**: "Varsayılana Sıfırla" butonu
13. [ ] **T013**: Panel için Dropdown/Popover entegrasyonu
14. [ ] **T014**: Dark mode ve responsive styling

#### Deliverables
- [ ] Çalışan ColumnConfigPanel bileşeni
- [ ] Sürükle-bırak ile kolon sıralama
- [ ] Checkbox ile göster/gizle
- [ ] Varsayılana sıfırlama özelliği
- [ ] Tam dark mode desteği

#### Component Structure (T009)
```tsx
// components/portfolio/column-config-panel.tsx
interface ColumnConfigPanelProps {
  columns: ColumnConfig[];
  onReorder: (columns: ColumnConfig[]) => void;
  onToggleVisibility: (columnId: string) => void;
  onReset: () => void;
}

export function ColumnConfigPanel({...}: ColumnConfigPanelProps) {
  return (
    <Popover>
      <PopoverButton>
        <AdjustmentsHorizontalIcon />
      </PopoverButton>
      <PopoverPanel>
        <DndContext>
          <SortableContext items={columns}>
            {columns.map(col => (
              <SortableColumnItem key={col.id} column={col} />
            ))}
          </SortableContext>
        </DndContext>
        <Button onClick={onReset}>Varsayılana Sıfırla</Button>
      </PopoverPanel>
    </Popover>
  );
}
```

### Phase 4: Table Integration [Priority: HIGH]
**Dependencies**: Phase 3 complete

#### Tasks
15. [ ] **T015**: `SortableAssetsTable` bileşenini güncelle - props ekle
16. [ ] **T016**: Dinamik kolon render logic'i implementasyonu
17. [ ] **T017**: Kolon renderer map oluştur (her kolon için render fonksiyonu)
18. [ ] **T018**: Portfolio dashboard sayfasına entegrasyon (`app/(protected)/p/[slug]/page.tsx`)
19. [ ] **T019**: Tablo başlığına ayar ikonu ekle

#### Deliverables
- [ ] Güncellenmiş SortableAssetsTable
- [ ] Dinamik kolon sıralaması çalışıyor
- [ ] Kolon gizleme/gösterme çalışıyor
- [ ] Dashboard entegrasyonu tamamlandı

#### Updated Table Props (T015)
```typescript
interface SortableAssetsTableProps {
  assets: AssetWithMetrics[];
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
  policy?: PortfolioPolicy | null;
  slug: string;
  displayCurrency: string;
  // New props
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
  onResetColumns: () => void;
}
```

### Phase 5: Testing & Polish [Priority: MEDIUM]
**Dependencies**: Phase 4 complete

#### Tasks
20. [ ] **T020**: Unit testler - ColumnConfigPanel
21. [ ] **T021**: Integration testler - tablo + panel
22. [ ] **T022**: E2E testler - tam kullanıcı akışı
23. [ ] **T023**: Accessibility (a11y) testleri ve iyileştirmeleri
24. [ ] **T024**: Performance optimizasyonu (memoization, useMemo)
25. [ ] **T025**: Edge case'ler ve error handling

#### Deliverables
- [ ] Kapsamlı test coverage (>80%)
- [ ] a11y standartlarına uygunluk
- [ ] 60fps sürükle-bırak performansı
- [ ] Robust error handling

## File Structure

```
lib/
├── types/
│   └── table-columns.ts          # Type definitions (T002)
├── config/
│   └── default-columns.ts        # Default column config (T003)
├── hooks/
│   └── use-table-preferences.ts  # Preferences hook (T004, T006)
└── utils/
    ├── table-storage.ts          # localStorage helpers (T005)
    └── column-utils.ts           # Column manipulation utils (T008)

components/portfolio/
├── column-config-panel.tsx       # Config panel UI (T009)
├── sortable-column-item.tsx      # Draggable column item (T010)
└── sortable-assets-table.tsx     # Updated table (T015-T17)

__tests__/
├── unit/
│   ├── hooks/
│   │   └── use-table-preferences.test.ts  # Hook tests (T007)
│   └── components/
│       └── column-config-panel.test.ts    # Panel tests (T020)
├── integration/
│   └── table-columns.test.ts              # Integration tests (T021)
└── e2e/
    └── table-customization.spec.ts        # E2E tests (T022)
```

## Risk Assessment

### Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| @dnd-kit React 18 uyumsuzluğu | Low | High | Versiyon pinleme, alternatif olarak react-beautiful-dnd |
| localStorage quota aşımı | Low | Medium | Sadece kolon ID'leri sakla, tam config değil |
| Hydration mismatch (SSR) | Medium | Medium | useEffect ile client-side initialization |
| Sürükle-bırak mobil sorunları | Medium | Medium | Touch event handling, @dnd-kit/modifiers |

### Dependencies
| Dependency | Risk | Contingency |
|------------|------|-------------|
| @dnd-kit/core | Low | Well-maintained, 50k+ weekly downloads |
| @dnd-kit/sortable | Low | Same maintainer, stable API |
| localStorage | Low | Tüm modern browser'larda mevcut |

## Success Metrics
- **Performance**: Sürükle-bırak 60fps, <50ms interaction latency
- **Persistence**: Tercihler %100 korunmalı (page reload sonrası)
- **Accessibility**: WCAG 2.1 AA uyumlu
- **Test Coverage**: >80% unit, >70% integration

## Rollout Plan

### Testing Strategy
1. **Unit Tests**: Her hook ve utility fonksiyonu
2. **Integration Tests**: Panel + Table etkileşimi
3. **E2E Tests**: Tam kullanıcı senaryoları

### Feature Flag
Gerekli değil - localStorage kullanan client-side feature, backend değişikliği yok.

## Definition of Done
- [ ] Tüm 25 task tamamlandı
- [ ] Tüm acceptance criteria karşılandı
- [ ] Unit testler yazıldı ve geçiyor
- [ ] Integration testler yazıldı ve geçiyor
- [ ] E2E testler yazıldı ve geçiyor
- [ ] Dark mode test edildi
- [ ] Mobile responsive test edildi
- [ ] Code review tamamlandı

## Additional Notes

### Migration Considerations
- Mevcut kullanıcılar için varsayılan kolon düzeni korunacak
- localStorage'da tercih yoksa, mevcut responsive hide class'ları kullanılacak
- `version` field ile gelecekte migration desteği

### Future Enhancements (Out of Scope)
- Sunucu taraflı tercih saklama (user preferences API)
- Kolon genişliği resize
- Özel kolon ekleme
- Tablo export (CSV/Excel)
