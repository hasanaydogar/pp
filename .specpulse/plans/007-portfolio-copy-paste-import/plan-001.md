# Implementation Plan: Portfolio Copy-Paste Import

<!-- FEATURE_DIR: 007-portfolio-copy-paste-import -->
<!-- FEATURE_ID: 007 -->
<!-- PLAN_NUMBER: 001 -->
<!-- STATUS: approved -->
<!-- CREATED: 2026-01-03 -->

## Specification Reference
- **Spec ID**: SPEC-007
- **Spec Version**: 1.0
- **Plan Version**: 1.0
- **Generated**: 2026-01-03
- **Estimated Time**: 8-12 hours

## Architecture Overview

### High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                    Portfolio Detail Page                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  [Add Asset]  [Import Assets]                        │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   ImportAssetsDialog                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Textarea (paste area)                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                              │                               │
│                    parseClipboardData()                      │
│                              │                               │
│                              ▼                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            ImportPreviewTable                        │    │
│  │   - Parsed rows with validation status               │    │
│  │   - Color-coded status (valid/error/duplicate)       │    │
│  └─────────────────────────────────────────────────────┘    │
│                              │                               │
│                      [Import Button]                         │
│                              │                               │
└──────────────────────────────┼───────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              POST /api/portfolios/[id]/assets/import         │
│                              │                               │
│    ┌─────────────────────────┼─────────────────────────┐    │
│    │                         ▼                         │    │
│    │   For each asset:                                 │    │
│    │   1. Create asset (POST /assets)                  │    │
│    │   2. Create BUY transaction (POST /transactions)  │    │
│    │                         │                         │    │
│    └─────────────────────────┼─────────────────────────┘    │
│                              ▼                               │
│              Return: { imported, failed, errors }            │
└─────────────────────────────────────────────────────────────┘
```

### Technical Stack
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL) - mevcut tablolar
- **UI Components**: Mevcut UI kit (Dialog, Table, Button, Textarea)

### File Structure

```
lib/
  utils/
    clipboard-parser.ts        # Parsing logic (NEW)
    
components/
  portfolios/
    import-assets-dialog.tsx   # Main dialog component (NEW)
    import-preview-table.tsx   # Preview table component (NEW)

app/
  api/
    portfolios/
      [id]/
        assets/
          import/
            route.ts           # Batch import endpoint (NEW)

  (protected)/
    portfolios/
      [id]/
        page.tsx               # Add Import button (MODIFY)
```

## Implementation Phases

### Phase 1: Core Utilities [Priority: HIGH]
**Timeline**: 2 hours
**Dependencies**: None

#### Tasks

##### Task 1.1: Create Clipboard Parser Utility
**File**: `lib/utils/clipboard-parser.ts`
**Estimated**: 1 hour

```typescript
// Types to implement
export type ColumnType = 'symbol' | 'quantity' | 'averagePrice' | 'sector' | 'ignored';

export interface ColumnMapping {
  index: number;
  type: ColumnType;
  header: string;
}

export interface ParsedRow {
  rowIndex: number;
  symbol: string;
  quantity: number;
  averagePrice: number;
  sector?: string;
  isValid: boolean;
  errors: string[];
  rawData: string[];
}

export interface ParseResult {
  headers: string[];
  columnMappings: ColumnMapping[];
  rows: ParsedRow[];
  validCount: number;
  errorCount: number;
}

// Functions to implement
export function parseClipboardData(text: string): ParseResult;
export function detectColumnType(header: string): ColumnType;
export function parseNumber(value: string): number | null;
export function validateRow(row: ParsedRow): ParsedRow;
```

**Implementation Details**:
1. `parseNumber()`: TR format (1.000,50) ve US format (1,000.50) destekle
2. `detectColumnType()`: Fuzzy matching ile kolon algılama
3. `parseClipboardData()`: Tab-separated data parse etme
4. `validateRow()`: Zorunlu alanları kontrol etme

##### Task 1.2: Add Unit Tests for Parser
**File**: `lib/utils/__tests__/clipboard-parser.test.ts`
**Estimated**: 1 hour

```typescript
describe('clipboard-parser', () => {
  describe('parseNumber', () => {
    it('should parse Turkish format (1.000,50)', () => {});
    it('should parse US format (1,000.50)', () => {});
    it('should remove TRY suffix', () => {});
    it('should return null for invalid input', () => {});
  });

  describe('detectColumnType', () => {
    it('should detect STOCK as symbol', () => {});
    it('should detect TOPLAM_ADET as quantity', () => {});
    it('should detect HISSE_BASI_ORTALAMA_MALIYET as averagePrice', () => {});
    it('should return ignored for unknown columns', () => {});
  });

  describe('parseClipboardData', () => {
    it('should parse valid tab-separated data', () => {});
    it('should mark invalid rows', () => {});
    it('should handle empty input', () => {});
  });
});
```

#### Deliverables
- [ ] `clipboard-parser.ts` created with all functions
- [ ] Unit tests written and passing
- [ ] TR/US number format support working

---

### Phase 2: UI Components [Priority: HIGH]
**Timeline**: 3 hours
**Dependencies**: Phase 1 complete

#### Tasks

##### Task 2.1: Create Import Preview Table Component
**File**: `components/portfolios/import-preview-table.tsx`
**Estimated**: 1 hour

```typescript
interface ImportPreviewTableProps {
  parsedData: ParseResult;
  existingSymbols: string[];
  onRowToggle?: (rowIndex: number, include: boolean) => void;
}

export function ImportPreviewTable({ 
  parsedData, 
  existingSymbols,
  onRowToggle 
}: ImportPreviewTableProps) {
  // Render table with:
  // - Symbol, Quantity, Avg Price, Status columns
  // - Color-coded rows (green/yellow/red)
  // - Error messages on hover/inline
  // - Summary row (total valid, errors, duplicates)
}
```

**UI Requirements**:
- Mevcut `Table` component'ını kullan
- Status badge'leri için `Badge` component
- Renk kodlaması:
  - `bg-green-50` / `border-green-200`: Geçerli
  - `bg-yellow-50` / `border-yellow-200`: Duplicate uyarısı
  - `bg-red-50` / `border-red-200`: Hata

##### Task 2.2: Create Import Assets Dialog Component
**File**: `components/portfolios/import-assets-dialog.tsx`
**Estimated**: 1.5 hours

```typescript
interface ImportAssetsDialogProps {
  portfolioId: string;
  existingAssets: Asset[];
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportAssetsDialog({
  portfolioId,
  existingAssets,
  open,
  onClose,
  onSuccess
}: ImportAssetsDialogProps) {
  const [rawText, setRawText] = useState('');
  const [parsedData, setParsedData] = useState<ParseResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  
  // Parse on text change
  useEffect(() => {
    if (rawText.trim()) {
      const result = parseClipboardData(rawText);
      // Check duplicates against existingAssets
      setParsedData(result);
    }
  }, [rawText]);
  
  // Import handler
  const handleImport = async () => {
    // Call batch import API
    // Show progress
    // Handle success/error
  };
}
```

**UI Layout**:
1. Dialog header: "Import Assets from Spreadsheet"
2. Textarea with placeholder instructions
3. Preview table (conditionally shown when data parsed)
4. Summary stats bar
5. Footer: Cancel + Import buttons

##### Task 2.3: Integrate Dialog into Portfolio Page
**File**: `app/(protected)/portfolios/[id]/page.tsx`
**Estimated**: 0.5 hours

- "Import" button yanına ekleme
- Dialog state yönetimi
- Assets refetch on success

#### Deliverables
- [ ] `ImportPreviewTable` component working
- [ ] `ImportAssetsDialog` component working
- [ ] Dialog integrated into portfolio page
- [ ] UI responsive and accessible

---

### Phase 3: Backend API [Priority: HIGH]
**Timeline**: 2 hours
**Dependencies**: Phase 1 complete

#### Tasks

##### Task 3.1: Create Batch Import Endpoint
**File**: `app/api/portfolios/[id]/assets/import/route.ts`
**Estimated**: 1.5 hours

```typescript
// POST /api/portfolios/[id]/assets/import
interface ImportRequest {
  assets: {
    symbol: string;
    quantity: number;
    averageBuyPrice: number;
    type?: AssetType;
  }[];
}

interface ImportResponse {
  success: boolean;
  imported: number;
  failed: number;
  results: {
    symbol: string;
    success: boolean;
    assetId?: string;
    error?: string;
  }[];
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Authenticate user
  // 2. Validate portfolio access
  // 3. For each asset:
  //    a. Create asset
  //    b. Create initial BUY transaction
  // 4. Return results summary
}
```

**Implementation Notes**:
- Sequential processing (not Promise.all) for better error handling
- Continue on individual failures
- Track success/failure per row
- Create BUY transaction with today's date

##### Task 3.2: Add Integration Tests
**File**: `__tests__/integration/api/import.test.ts`
**Estimated**: 0.5 hours

```typescript
describe('POST /api/portfolios/[id]/assets/import', () => {
  it('should import multiple assets successfully', async () => {});
  it('should handle partial failures', async () => {});
  it('should create BUY transactions for each asset', async () => {});
  it('should return 401 for unauthenticated user', async () => {});
  it('should return 400 for invalid data', async () => {});
});
```

#### Deliverables
- [ ] Batch import endpoint functional
- [ ] BUY transactions created automatically
- [ ] Error handling for partial failures
- [ ] Integration tests passing

---

### Phase 4: Duplicate Detection & UX [Priority: MEDIUM]
**Timeline**: 2 hours
**Dependencies**: Phase 2, Phase 3 complete

#### Tasks

##### Task 4.1: Implement Duplicate Detection
**Estimated**: 1 hour

- Parse sırasında mevcut asset'lerle karşılaştırma
- Sarı renk ile işaretleme
- "Skip" / "Import anyway" seçenekleri
- Checkbox ile satır bazlı kontrol

##### Task 4.2: Add Loading States & Error Handling
**Estimated**: 0.5 hours

- Import sırasında progress gösterimi
- Hata durumunda detaylı feedback
- Partial success durumu gösterimi

##### Task 4.3: Success Flow & Refresh
**Estimated**: 0.5 hours

- Import sonrası success toast
- Portfolio asset listesi refresh
- Modal kapanma

#### Deliverables
- [ ] Duplicate detection working
- [ ] User can choose to skip/include duplicates
- [ ] Loading states implemented
- [ ] Error handling comprehensive
- [ ] Success flow smooth

---

### Phase 5: Testing & Polish [Priority: MEDIUM]
**Timeline**: 2 hours
**Dependencies**: All phases complete

#### Tasks

##### Task 5.1: End-to-End Testing
**Estimated**: 1 hour

```typescript
// e2e/import-assets.spec.ts
describe('Asset Import Flow', () => {
  it('should import assets from pasted data', async () => {
    // 1. Navigate to portfolio
    // 2. Click Import button
    // 3. Paste test data
    // 4. Verify preview
    // 5. Click Import
    // 6. Verify assets created
  });
});
```

##### Task 5.2: Edge Case Handling
**Estimated**: 0.5 hours

- Boş input handling
- Sadece header satırı
- Çok büyük veri seti (100+ satır)
- Geçersiz karakterler

##### Task 5.3: Final Polish
**Estimated**: 0.5 hours

- Responsive design check
- Accessibility review
- Performance optimization

#### Deliverables
- [ ] E2E tests written and passing
- [ ] Edge cases handled
- [ ] Responsive design verified
- [ ] Ready for PR

---

## Risk Assessment

### Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Number parsing edge cases | Medium | Medium | Comprehensive unit tests, multiple format support |
| Large data set performance | Low | Medium | Implement pagination/virtualization if needed |
| API rate limiting | Low | Low | Sequential processing with delays if needed |

### Dependencies
| Dependency | Risk | Contingency |
|------------|------|-------------|
| Mevcut UI components | Low | Zaten var ve test edilmiş |
| Assets API | Low | Mevcut ve çalışıyor |
| Transactions API | Low | Mevcut ve çalışıyor |

## Success Metrics

- **Performance**: 20 asset import < 5 saniye
- **Reliability**: %95+ başarılı import oranı
- **User Experience**: 3 adımda tamamlanan flow
- **Code Quality**: %80+ test coverage

## Definition of Done

- [ ] Tüm Phase'ler tamamlandı
- [ ] Tüm unit testler geçiyor
- [ ] Integration testler geçiyor
- [ ] Code review yapıldı
- [ ] Manuel test tamamlandı
- [ ] PR oluşturuldu ve merge edildi

## Quick Reference: File Changes

| File | Action | Phase |
|------|--------|-------|
| `lib/utils/clipboard-parser.ts` | CREATE | 1 |
| `lib/utils/__tests__/clipboard-parser.test.ts` | CREATE | 1 |
| `components/portfolios/import-preview-table.tsx` | CREATE | 2 |
| `components/portfolios/import-assets-dialog.tsx` | CREATE | 2 |
| `app/(protected)/portfolios/[id]/page.tsx` | MODIFY | 2 |
| `app/api/portfolios/[id]/assets/import/route.ts` | CREATE | 3 |
| `__tests__/integration/api/import.test.ts` | CREATE | 3 |
| `e2e/import-assets.spec.ts` | CREATE | 5 |
