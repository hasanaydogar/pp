# Task Breakdown: Portfolio Copy-Paste Import

<!-- FEATURE_DIR: 007-portfolio-copy-paste-import -->
<!-- FEATURE_ID: 007 -->
<!-- TASK_LIST_ID: 001 -->
<!-- STATUS: ready -->
<!-- CREATED: 2026-01-03 -->
<!-- LAST_UPDATED: 2026-01-03 -->

## Progress Overview
- **Total Tasks**: 11
- **Completed Tasks**: 11 (100%)
- **In Progress Tasks**: 0
- **Blocked Tasks**: 0
- **Estimated Total Time**: 11 hours
- **Actual Completion**: 2026-01-03

## Quick Start

**Başlamak için ilk task'ı çalıştır:**
```
/sp-execute T001
```

---

## Task Summary

| ID | Task | Size | Phase | Dependencies | Status |
|----|------|------|-------|--------------|--------|
| T001 | Create clipboard parser utility | M | 1 | - | [x] |
| T002 | Add unit tests for parser | M | 1 | T001 | [x] |
| T003 | Create ImportPreviewTable component | M | 2 | T001 | [x] |
| T004 | Create ImportAssetsDialog component | M | 2 | T001, T003 | [x] |
| T005 | Integrate dialog into portfolio page | S | 2 | T004 | [x] |
| T006 | Create batch import API endpoint | M | 3 | T001 | [x] |
| T007 | Add integration tests for import API | S | 3 | T006 | [x] |
| T008 | Implement duplicate detection | M | 4 | T004, T006 | [x] |
| T009 | Add loading states & error handling | S | 4 | T004, T006 | [x] |
| T010 | Success flow & data refresh | S | 4 | T009 | [x] |
| T011 | Final testing & polish | M | 5 | All | [x] |

---

## Phase 1: Core Utilities [Priority: HIGH]

### T001: Create Clipboard Parser Utility
```yaml
id: task-001
status: todo
title: "Create clipboard parser utility"
priority: HIGH
size: M
estimate: 1 hour
phase: 1
dependencies: []
parallel: true
```

**Description:**
- **What**: Tab-separated clipboard verilerini parse eden utility fonksiyonları
- **Why**: Import özelliğinin temel altyapısı
- **How**: parseNumber, detectColumnType, parseClipboardData fonksiyonları
- **Done when**: Tüm fonksiyonlar çalışıyor ve TR/US format desteği var

**Files to Create:**
- `lib/utils/clipboard-parser.ts`

**Implementation:**
```typescript
// Types
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

// Functions
export function parseNumber(value: string): number | null
export function detectColumnType(header: string): ColumnType
export function parseClipboardData(text: string): ParseResult
export function validateRow(row: ParsedRow): ParsedRow
```

**Acceptance Criteria:**
- [ ] `parseNumber("1.000,50")` → `1000.50` (TR format)
- [ ] `parseNumber("1,000.50")` → `1000.50` (US format)
- [ ] `parseNumber("160.950,00 TRY")` → `160950.00` (suffix removal)
- [ ] `detectColumnType("STOCK")` → `'symbol'`
- [ ] `detectColumnType("TOPLAM_ADET")` → `'quantity'`
- [ ] `parseClipboardData(tabSeparatedText)` → valid ParseResult

**Column Detection Mappings:**
```typescript
const COLUMN_PATTERNS = {
  symbol: ['stock', 'sembol', 'symbol', 'ticker', 'hisse'],
  quantity: ['toplam_adet', 'adet', 'quantity', 'miktar', 'lot'],
  averagePrice: ['hisse_basi_ortalama_maliyet', 'ortalama', 'avg', 'average', 'maliyet', 'fiyat'],
  sector: ['sektor', 'sector', 'sektör']
};
```

---

### T002: Add Unit Tests for Parser
```yaml
id: task-002
status: todo
title: "Add unit tests for clipboard parser"
priority: HIGH
size: M
estimate: 1 hour
phase: 1
dependencies: [T001]
parallel: false
```

**Description:**
- **What**: Clipboard parser için kapsamlı unit testler
- **Why**: Farklı format ve edge case'leri test etmek
- **How**: Jest ile test dosyası oluşturma
- **Done when**: Tüm testler geçiyor, %90+ coverage

**Files to Create:**
- `lib/utils/__tests__/clipboard-parser.test.ts`

**Test Cases:**
```typescript
describe('clipboard-parser', () => {
  describe('parseNumber', () => {
    it('should parse Turkish format (1.000,50)', () => {
      expect(parseNumber('1.000,50')).toBe(1000.50);
    });
    
    it('should parse US format (1,000.50)', () => {
      expect(parseNumber('1,000.50')).toBe(1000.50);
    });
    
    it('should remove TRY suffix', () => {
      expect(parseNumber('160.950,00 TRY')).toBe(160950.00);
    });
    
    it('should handle percentage format', () => {
      expect(parseNumber('1,56%')).toBe(1.56);
    });
    
    it('should return null for invalid input', () => {
      expect(parseNumber('abc')).toBeNull();
      expect(parseNumber('')).toBeNull();
    });
  });

  describe('detectColumnType', () => {
    it('should detect symbol columns', () => {
      expect(detectColumnType('STOCK')).toBe('symbol');
      expect(detectColumnType('Sembol')).toBe('symbol');
    });
    
    it('should detect quantity columns', () => {
      expect(detectColumnType('TOPLAM_ADET')).toBe('quantity');
      expect(detectColumnType('Adet')).toBe('quantity');
    });
    
    it('should detect price columns', () => {
      expect(detectColumnType('HISSE_BASI_ORTALAMA_MALIYET')).toBe('averagePrice');
    });
    
    it('should return ignored for unknown columns', () => {
      expect(detectColumnType('TOPLAM_DEĞER')).toBe('ignored');
    });
  });

  describe('parseClipboardData', () => {
    const sampleData = `STOCK\tTOPLAM_ADET\tHISSE_BASI_ORTALAMA_MALIYET
AGESA\t750\t214,60 TRY
ARCLK\t800\t44,09 TRY`;

    it('should parse valid tab-separated data', () => {
      const result = parseClipboardData(sampleData);
      expect(result.rows.length).toBe(2);
      expect(result.validCount).toBe(2);
    });
    
    it('should detect column types from headers', () => {
      const result = parseClipboardData(sampleData);
      expect(result.columnMappings[0].type).toBe('symbol');
      expect(result.columnMappings[1].type).toBe('quantity');
    });
    
    it('should handle empty input', () => {
      const result = parseClipboardData('');
      expect(result.rows.length).toBe(0);
    });
    
    it('should mark invalid rows', () => {
      const invalidData = `STOCK\tTOPLAM_ADET
AGESA\tabc`;
      const result = parseClipboardData(invalidData);
      expect(result.rows[0].isValid).toBe(false);
    });
  });
});
```

**Acceptance Criteria:**
- [ ] Tüm testler geçiyor
- [ ] TR format testleri var
- [ ] US format testleri var
- [ ] Edge case testleri var (empty, invalid, etc.)

---

## Phase 2: UI Components [Priority: HIGH]

### T003: Create ImportPreviewTable Component
```yaml
id: task-003
status: todo
title: "Create ImportPreviewTable component"
priority: HIGH
size: M
estimate: 1 hour
phase: 2
dependencies: [T001]
parallel: true
```

**Description:**
- **What**: Parse edilmiş verileri önizleme tablosu olarak gösteren component
- **Why**: Kullanıcının import öncesi verileri doğrulaması için
- **How**: Mevcut Table component'ı ile renk kodlu satırlar
- **Done when**: Tablo doğru renk kodları ve status gösteriyor

**Files to Create:**
- `components/portfolios/import-preview-table.tsx`

**Implementation:**
```typescript
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ParseResult, ParsedRow } from '@/lib/utils/clipboard-parser';

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
  const getRowStatus = (row: ParsedRow) => {
    if (!row.isValid) return { status: 'error', color: 'red' as const, bgClass: 'bg-red-50 dark:bg-red-950/20' };
    if (existingSymbols.includes(row.symbol.toUpperCase())) 
      return { status: 'duplicate', color: 'amber' as const, bgClass: 'bg-amber-50 dark:bg-amber-950/20' };
    return { status: 'valid', color: 'green' as const, bgClass: 'bg-green-50 dark:bg-green-950/20' };
  };

  return (
    <div className="border rounded-lg overflow-hidden dark:border-white/10">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Symbol</TableHeader>
            <TableHeader className="text-right">Quantity</TableHeader>
            <TableHeader className="text-right">Avg Price</TableHeader>
            <TableHeader>Status</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {parsedData.rows.map((row) => {
            const { status, color, bgClass } = getRowStatus(row);
            return (
              <TableRow key={row.rowIndex} className={bgClass}>
                <TableCell className="font-medium">{row.symbol}</TableCell>
                <TableCell className="text-right">{row.quantity.toLocaleString()}</TableCell>
                <TableCell className="text-right">{row.averagePrice.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge color={color}>{status}</Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {/* Summary */}
      <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border-t dark:border-white/10 text-sm text-zinc-600 dark:text-zinc-400">
        Found: {parsedData.rows.length} rows | 
        Valid: {parsedData.validCount} | 
        Errors: {parsedData.errorCount}
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Tablo Symbol, Quantity, Avg Price, Status kolonlarını gösteriyor
- [ ] Geçerli satırlar yeşil arka plan
- [ ] Hatalı satırlar kırmızı arka plan
- [ ] Duplicate satırlar sarı arka plan
- [ ] Summary bar toplam sayıları gösteriyor

---

### T004: Create ImportAssetsDialog Component
```yaml
id: task-004
status: todo
title: "Create ImportAssetsDialog component"
priority: HIGH
size: M
estimate: 1.5 hours
phase: 2
dependencies: [T001, T003]
parallel: false
```

**Description:**
- **What**: Ana import modal dialog'u
- **Why**: Kullanıcının veri yapıştırıp import yapabilmesi için
- **How**: Dialog + Textarea + Preview Table + Import Button
- **Done when**: Yapıştırma → Önizleme → Import akışı çalışıyor

**Files to Create:**
- `components/portfolios/import-assets-dialog.tsx`

**Implementation:**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Text } from '@/components/ui/text';
import { ImportPreviewTable } from './import-preview-table';
import { parseClipboardData, ParseResult } from '@/lib/utils/clipboard-parser';
import { Asset } from '@/lib/types/portfolio';

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
  const [error, setError] = useState<string | null>(null);

  const existingSymbols = existingAssets.map(a => a.symbol.toUpperCase());

  // Parse on text change
  useEffect(() => {
    if (rawText.trim()) {
      try {
        const result = parseClipboardData(rawText);
        setParsedData(result);
        setError(null);
      } catch (e) {
        setError('Failed to parse data');
        setParsedData(null);
      }
    } else {
      setParsedData(null);
    }
  }, [rawText]);

  const handleImport = async () => {
    if (!parsedData || parsedData.validCount === 0) return;

    setIsImporting(true);
    setError(null);

    try {
      const assets = parsedData.rows
        .filter(row => row.isValid)
        .map(row => ({
          symbol: row.symbol,
          quantity: row.quantity,
          averageBuyPrice: row.averagePrice,
          type: 'STOCK' as const
        }));

      const response = await fetch(`/api/portfolios/${portfolioId}/assets/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assets })
      });

      const result = await response.json();

      if (response.ok) {
        onSuccess();
        onClose();
        setRawText('');
      } else {
        setError(result.message || 'Import failed');
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} size="3xl">
      <DialogTitle>Import Assets from Spreadsheet</DialogTitle>
      <DialogDescription>
        Copy rows from Excel or Google Sheets and paste them below. Include the header row.
      </DialogDescription>

      <DialogBody className="space-y-4">
        <Textarea
          placeholder="Paste your data here...&#10;&#10;Example:&#10;STOCK	TOPLAM_ADET	HISSE_BASI_ORTALAMA_MALIYET&#10;AGESA	750	214,60 TRY"
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={6}
          className="font-mono text-sm"
        />

        {parsedData && parsedData.rows.length > 0 && (
          <ImportPreviewTable
            parsedData={parsedData}
            existingSymbols={existingSymbols}
          />
        )}

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 p-3 rounded-lg">
            {error}
          </div>
        )}
      </DialogBody>

      <DialogActions>
        <Button plain onClick={onClose} disabled={isImporting}>
          Cancel
        </Button>
        <Button 
          color="green"
          onClick={handleImport} 
          disabled={!parsedData || parsedData.validCount === 0 || isImporting}
        >
          {isImporting ? 'Importing...' : `Import ${parsedData?.validCount || 0} Assets`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

**Acceptance Criteria:**
- [ ] Dialog açılıp kapanıyor
- [ ] Textarea'ya yapıştırılan veri parse ediliyor
- [ ] Önizleme tablosu görünüyor
- [ ] Import butonu doğru sayıyı gösteriyor
- [ ] Loading state çalışıyor
- [ ] Error mesajları gösteriliyor

---

### T005: Integrate Dialog into Portfolio Page
```yaml
id: task-005
status: todo
title: "Integrate ImportAssetsDialog into portfolio page"
priority: HIGH
size: S
estimate: 0.5 hours
phase: 2
dependencies: [T004]
parallel: false
```

**Description:**
- **What**: Import dialog'unu portföy detay sayfasına entegre etme
- **Why**: Kullanıcının Import butonuna erişebilmesi için
- **How**: Import butonu + dialog state yönetimi
- **Done when**: Import butonu çalışıyor ve dialog açılıyor

**Files to Modify:**
- `app/(protected)/portfolios/[id]/page.tsx`

**Changes:**
```typescript
// Add import button next to "Add Asset" button
<div className="flex gap-2">
  <Button onClick={() => router.push(`/portfolios/${id}/assets/new`)}>
    Add Asset
  </Button>
  <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
    Import Assets
  </Button>
</div>

// Add dialog component
<ImportAssetsDialog
  portfolioId={id}
  existingAssets={assets}
  open={importDialogOpen}
  onClose={() => setImportDialogOpen(false)}
  onSuccess={() => {
    refetchAssets();
    // Show success toast
  }}
/>
```

**Acceptance Criteria:**
- [ ] "Import Assets" butonu görünüyor
- [ ] Butona tıklayınca dialog açılıyor
- [ ] Import sonrası asset listesi yenileniyor

---

## Phase 3: Backend API [Priority: HIGH]

### T006: Create Batch Import API Endpoint
```yaml
id: task-006
status: todo
title: "Create batch import API endpoint"
priority: HIGH
size: M
estimate: 1.5 hours
phase: 3
dependencies: [T001]
parallel: true
```

**Description:**
- **What**: Toplu asset import için API endpoint
- **Why**: Birden fazla asset'i tek istekle oluşturmak için
- **How**: POST endpoint, sequential processing, BUY transaction oluşturma
- **Done when**: Endpoint çalışıyor ve transaction'lar oluşturuluyor

**Files to Create:**
- `app/api/portfolios/[id]/assets/import/route.ts`

**Implementation:**
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/actions';
import { unauthorized, badRequest, internalServerError } from '@/lib/api/errors';
import { validateUUIDOrThrow } from '@/lib/api/utils';
import { TransactionType } from '@/lib/types/portfolio';

interface ImportAsset {
  symbol: string;
  quantity: number;
  averageBuyPrice: number;
  type?: string;
}

interface ImportResult {
  symbol: string;
  success: boolean;
  assetId?: string;
  error?: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { id: portfolioId } = await params;
    
    try {
      validateUUIDOrThrow(portfolioId);
    } catch {
      return badRequest('Invalid portfolio ID');
    }

    const { assets } = await request.json() as { assets: ImportAsset[] };

    if (!assets || !Array.isArray(assets) || assets.length === 0) {
      return badRequest('No assets provided');
    }

    const supabase = await createClient();
    const results: ImportResult[] = [];
    let imported = 0;
    let failed = 0;

    // Process sequentially for better error handling
    for (const asset of assets) {
      try {
        // Validate required fields
        if (!asset.symbol || !asset.quantity || !asset.averageBuyPrice) {
          results.push({ 
            symbol: asset.symbol || 'unknown', 
            success: false, 
            error: 'Missing required fields' 
          });
          failed++;
          continue;
        }

        // Create asset
        const { data: newAsset, error: assetError } = await supabase
          .from('assets')
          .insert({
            portfolio_id: portfolioId,
            symbol: asset.symbol.toUpperCase(),
            quantity: asset.quantity,
            average_buy_price: asset.averageBuyPrice,
            type: asset.type || 'STOCK'
          })
          .select()
          .single();

        if (assetError) {
          results.push({ 
            symbol: asset.symbol, 
            success: false, 
            error: assetError.message 
          });
          failed++;
          continue;
        }

        // Create initial BUY transaction
        const { error: txError } = await supabase
          .from('transactions')
          .insert({
            asset_id: newAsset.id,
            type: TransactionType.BUY,
            amount: asset.quantity,
            price: asset.averageBuyPrice,
            date: new Date().toISOString(),
            transaction_cost: 0
          });

        if (txError) {
          // Asset created but transaction failed - log but don't fail
          console.error('Transaction creation failed:', txError);
        }

        results.push({ 
          symbol: asset.symbol, 
          success: true, 
          assetId: newAsset.id 
        });
        imported++;

      } catch (e) {
        results.push({ 
          symbol: asset.symbol, 
          success: false, 
          error: 'Unexpected error' 
        });
        failed++;
      }
    }

    return NextResponse.json({
      success: imported > 0,
      imported,
      failed,
      results
    }, { status: imported > 0 ? 201 : 400 });

  } catch (error) {
    return internalServerError('Import failed');
  }
}
```

**Acceptance Criteria:**
- [ ] Endpoint POST /api/portfolios/[id]/assets/import çalışıyor
- [ ] Her asset için BUY transaction oluşturuluyor
- [ ] Partial failure handling (bir hata diğerlerini etkilemiyor)
- [ ] Response: { success, imported, failed, results }

---

### T007: Add Integration Tests for Import API
```yaml
id: task-007
status: todo
title: "Add integration tests for import API"
priority: MEDIUM
size: S
estimate: 0.5 hours
phase: 3
dependencies: [T006]
parallel: false
```

**Description:**
- **What**: Import API için integration testler
- **Why**: API'nin doğru çalıştığını doğrulamak için
- **How**: Jest ile mock'lanmış testler
- **Done when**: Tüm test senaryoları geçiyor

**Files to Create:**
- `__tests__/integration/api/import.test.ts`

**Test Cases:**
```typescript
import { POST } from '@/app/api/portfolios/[id]/assets/import/route';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/actions';

jest.mock('@/lib/supabase/server');
jest.mock('@/lib/auth/actions');

describe('POST /api/portfolios/[id]/assets/import', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const portfolioId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

  beforeEach(() => {
    jest.clearAllMocks();
    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
  });

  it('should import multiple assets successfully', async () => {
    const mockAsset = { id: 'asset-1', symbol: 'AGESA' };
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockAsset, error: null })
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);

    const request = new Request('http://localhost/api/portfolios/' + portfolioId + '/assets/import', {
      method: 'POST',
      body: JSON.stringify({
        assets: [
          { symbol: 'AGESA', quantity: 750, averageBuyPrice: 214.60 },
          { symbol: 'ARCLK', quantity: 800, averageBuyPrice: 44.09 }
        ]
      })
    });

    const response = await POST(request, { params: Promise.resolve({ id: portfolioId }) });
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.imported).toBe(2);
  });

  it('should return 401 for unauthenticated user', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue(null);

    const request = new Request('http://localhost/api/portfolios/' + portfolioId + '/assets/import', {
      method: 'POST',
      body: JSON.stringify({ assets: [] })
    });

    const response = await POST(request, { params: Promise.resolve({ id: portfolioId }) });
    expect(response.status).toBe(401);
  });

  it('should return 400 for empty assets array', async () => {
    const request = new Request('http://localhost/api/portfolios/' + portfolioId + '/assets/import', {
      method: 'POST',
      body: JSON.stringify({ assets: [] })
    });

    const response = await POST(request, { params: Promise.resolve({ id: portfolioId }) });
    expect(response.status).toBe(400);
  });
});
```

**Acceptance Criteria:**
- [ ] Success case testi geçiyor
- [ ] Auth failure testi geçiyor
- [ ] Validation failure testi geçiyor
- [ ] Partial failure testi geçiyor

---

## Phase 4: Duplicate Detection & UX [Priority: MEDIUM]

### T008: Implement Duplicate Detection
```yaml
id: task-008
status: todo
title: "Implement duplicate asset detection"
priority: MEDIUM
size: M
estimate: 1 hour
phase: 4
dependencies: [T004, T006]
parallel: false
```

**Description:**
- **What**: Import sırasında mevcut asset'lerle çakışma kontrolü
- **Why**: Kullanıcının yanlışlıkla duplicate oluşturmasını önlemek için
- **How**: existingSymbols ile karşılaştırma, sarı renk gösterimi, skip seçeneği
- **Done when**: Duplicate'ler sarı gösteriliyor ve atlanabiliyor

**Changes Required:**
1. `ImportPreviewTable`: Duplicate badge gösterimi ✓ (T003'te yapıldı)
2. `ImportAssetsDialog`: Checkbox ile satır bazlı kontrol
3. `ImportAssetsDialog`: "Skip duplicates" checkbox

**Implementation Updates:**
```typescript
// In ImportAssetsDialog
const [skipDuplicates, setSkipDuplicates] = useState(true);
const [excludedRows, setExcludedRows] = useState<Set<number>>(new Set());

const assetsToImport = parsedData?.rows.filter((row, index) => {
  if (!row.isValid) return false;
  if (excludedRows.has(index)) return false;
  if (skipDuplicates && existingSymbols.includes(row.symbol.toUpperCase())) return false;
  return true;
}) || [];

// UI: Add checkbox
<label className="flex items-center gap-2">
  <Checkbox checked={skipDuplicates} onCheckedChange={setSkipDuplicates} />
  <span>Skip existing assets</span>
</label>
```

**Acceptance Criteria:**
- [ ] Duplicate satırlar sarı renkte gösteriliyor
- [ ] "Skip existing assets" checkbox çalışıyor
- [ ] Import sayısı doğru hesaplanıyor
- [ ] Kullanıcı duplicate'leri dahil etmeyi seçebiliyor

---

### T009: Add Loading States & Error Handling
```yaml
id: task-009
status: todo
title: "Add loading states and error handling"
priority: MEDIUM
size: S
estimate: 0.5 hours
phase: 4
dependencies: [T004, T006]
parallel: false
```

**Description:**
- **What**: Import işlemi sırasında loading gösterimi ve hata yönetimi
- **Why**: Kullanıcıya işlemin durumunu bildirmek için
- **How**: Spinner, disabled states, error messages
- **Done when**: Tüm durumlar düzgün gösteriliyor

**Implementation:**
```typescript
// Loading state with spinner
{isImporting && (
  <div className="flex items-center gap-2">
    <Spinner className="h-4 w-4" />
    <span>Importing {importProgress}/{totalToImport}...</span>
  </div>
)}

// Error display
{error && (
  <Alert variant="destructive">
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)}

// Partial success display
{importResult && (
  <Alert>
    <AlertDescription>
      Imported {importResult.imported} assets.
      {importResult.failed > 0 && ` Failed: ${importResult.failed}`}
    </AlertDescription>
  </Alert>
)}
```

**Acceptance Criteria:**
- [ ] Import sırasında butonlar disabled
- [ ] Loading spinner görünüyor
- [ ] Hata mesajları kullanıcıya gösteriliyor
- [ ] Partial success durumu açıkça gösteriliyor

---

### T010: Success Flow & Data Refresh
```yaml
id: task-010
status: todo
title: "Implement success flow and data refresh"
priority: MEDIUM
size: S
estimate: 0.5 hours
phase: 4
dependencies: [T009]
parallel: false
```

**Description:**
- **What**: Import başarılı olduğunda UI güncelleme
- **Why**: Kullanıcının sonucu görmesi ve devam edebilmesi için
- **How**: Success toast, modal kapanma, data refetch
- **Done when**: Başarılı import sonrası liste güncel

**Implementation:**
```typescript
// In portfolio page
const handleImportSuccess = () => {
  // Refetch assets
  router.refresh();
  // Or if using SWR/React Query
  mutate(`/api/portfolios/${id}/assets`);
  
  // Show success toast
  toast({
    title: 'Import successful',
    description: `${importedCount} assets imported successfully.`
  });
};
```

**Acceptance Criteria:**
- [ ] Success toast gösteriliyor
- [ ] Modal kapanıyor
- [ ] Asset listesi otomatik yenileniyor
- [ ] Yeni asset'ler hemen görünüyor

---

## Phase 5: Testing & Polish [Priority: MEDIUM]

### T011: Final Testing & Polish
```yaml
id: task-011
status: todo
title: "Final testing and polish"
priority: MEDIUM
size: M
estimate: 1.5 hours
phase: 5
dependencies: [T001, T002, T003, T004, T005, T006, T007, T008, T009, T010]
parallel: false
```

**Description:**
- **What**: Son testler, edge case'ler ve polish
- **Why**: Production-ready kalite için
- **How**: Manuel test, edge case handling, responsive check
- **Done when**: Tüm senaryolar çalışıyor, PR hazır

**Tasks:**
1. **Edge Case Testing:**
   - [ ] Empty input handling
   - [ ] Only header row (no data)
   - [ ] Very large dataset (100+ rows)
   - [ ] Invalid characters in data
   - [ ] Mixed valid/invalid rows

2. **Responsive Design:**
   - [ ] Mobile viewport test
   - [ ] Table horizontal scroll
   - [ ] Dialog size on small screens

3. **Accessibility:**
   - [ ] Keyboard navigation
   - [ ] Screen reader labels
   - [ ] Focus management

4. **Performance:**
   - [ ] Large data parsing speed
   - [ ] UI responsiveness during import

**Acceptance Criteria:**
- [ ] Tüm edge case'ler handle ediliyor
- [ ] Responsive design çalışıyor
- [ ] Accessibility gereksinimleri karşılanıyor
- [ ] Performance kabul edilebilir seviyede

---

## Execution Strategy

### Parallel Execution Groups

**Group A (Can run in parallel):**
- T001: Parser utility
- T003: Preview table (after T001)
- T006: API endpoint

**Group B (Sequential):**
- T001 → T002 (tests depend on implementation)
- T003 → T004 → T005 (UI components chain)
- T006 → T007 (API + tests)

**Group C (Depends on A & B):**
- T008, T009, T010 → T011

### Recommended Execution Order

```
Day 1 (4 hours):
├── T001: Parser utility (1h)
├── T002: Parser tests (1h)
├── T006: API endpoint (1.5h) [parallel with T003]
└── T003: Preview table (1h)

Day 2 (4 hours):
├── T004: Import dialog (1.5h)
├── T005: Page integration (0.5h)
├── T007: API tests (0.5h)
└── T008: Duplicate detection (1h)

Day 3 (3 hours):
├── T009: Loading states (0.5h)
├── T010: Success flow (0.5h)
└── T011: Final testing (1.5h)
```

---

## Progress Tracking

```yaml
status:
  total: 11
  completed: 0
  in_progress: 0
  blocked: 0
  
phases:
  phase_1: 0/2 (0%)
  phase_2: 0/3 (0%)
  phase_3: 0/2 (0%)
  phase_4: 0/3 (0%)
  phase_5: 0/1 (0%)

metrics:
  estimated_total: 11 hours
  velocity: TBD
  estimated_completion: TBD
```

---

## Definition of Done

### Per Task
- [ ] Code implemented
- [ ] Tests written (where applicable)
- [ ] Code reviewed
- [ ] Acceptance criteria met

### Feature Complete
- [ ] All 11 tasks completed
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Manual testing done
- [ ] Edge cases handled
- [ ] PR created and approved
- [ ] Merged to main branch

---

**Legend:**
- [S] = Small (< 1 hour), [M] = Medium (1-2 hours), [L] = Large (> 2 hours)
- **Status**: [ ] Pending, [>] In Progress, [x] Completed, [!] Blocked
