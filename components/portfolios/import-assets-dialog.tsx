'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogActions,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, Label } from '@/components/ui/fieldset';
import { ImportPreviewTable } from './import-preview-table';
import { parseClipboardData, ParseResult } from '@/lib/utils/clipboard-parser';

// Simplified asset type for import - only need symbol for duplicate detection
interface SimpleAsset {
  symbol: string;
}

interface ImportAssetsDialogProps {
  portfolioId: string;
  existingAssets: SimpleAsset[];
  open: boolean;
  onClose: () => void;
  onSuccess: (importedCount: number) => void;
}

interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  results: Array<{
    symbol: string;
    success: boolean;
    error?: string;
  }>;
}

export function ImportAssetsDialog({
  portfolioId,
  existingAssets,
  open,
  onClose,
  onSuccess,
}: ImportAssetsDialogProps) {
  const [rawText, setRawText] = useState('');
  const [parsedData, setParsedData] = useState<ParseResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const existingSymbols = existingAssets.map((a) => a.symbol.toUpperCase());

  // Calculate import counts
  const getImportableCount = useCallback(() => {
    if (!parsedData) return 0;

    return parsedData.rows.filter((row) => {
      if (!row.isValid) return false;
      if (skipDuplicates && existingSymbols.includes(row.symbol.toUpperCase())) {
        return false;
      }
      return true;
    }).length;
  }, [parsedData, skipDuplicates, existingSymbols]);

  // Parse on text change
  useEffect(() => {
    if (rawText.trim()) {
      try {
        const result = parseClipboardData(rawText);
        setParsedData(result);
        setError(null);
        setImportResult(null);
      } catch (e) {
        setError('Failed to parse data. Make sure you copied tab-separated data.');
        setParsedData(null);
      }
    } else {
      setParsedData(null);
      setError(null);
      setImportResult(null);
    }
  }, [rawText]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setRawText('');
      setParsedData(null);
      setError(null);
      setImportResult(null);
      setSkipDuplicates(true);
    }
  }, [open]);

  const handleImport = async () => {
    if (!parsedData || getImportableCount() === 0) return;

    setIsImporting(true);
    setError(null);

    try {
      const assetsToImport = parsedData.rows
        .filter((row) => {
          if (!row.isValid) return false;
          if (skipDuplicates && existingSymbols.includes(row.symbol.toUpperCase())) {
            return false;
          }
          return true;
        })
        .map((row) => ({
          symbol: row.symbol,
          quantity: row.quantity,
          averageBuyPrice: row.averagePrice,
          type: 'STOCK' as const,
        }));

      const response = await fetch(`/api/portfolios/${portfolioId}/assets/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assets: assetsToImport }),
      });

      const result: ImportResult = await response.json();

      if (response.ok && result.imported > 0) {
        setImportResult(result);
        onSuccess(result.imported);
        // Close dialog after short delay to show success
        setTimeout(() => {
          onClose();
        }, 1500);
      } else if (result.failed > 0) {
        setImportResult(result);
        setError(`Failed to import ${result.failed} assets. See details above.`);
      } else {
        setError(result.results?.[0]?.error || 'Import failed');
      }
    } catch (e) {
      setError('Network error. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const importableCount = getImportableCount();
  const duplicateCount = parsedData
    ? parsedData.rows.filter(
        (row) => row.isValid && existingSymbols.includes(row.symbol.toUpperCase())
      ).length
    : 0;

  return (
    <Dialog open={open} onClose={onClose} size="3xl">
      <DialogTitle>Import Assets from Spreadsheet</DialogTitle>
      <DialogDescription>
        Copy rows from Excel or Google Sheets and paste them below. Include the header
        row with column names like STOCK, TOPLAM_ADET, HISSE_BASI_ORTALAMA_MALIYET.
      </DialogDescription>

      <DialogBody className="space-y-4">
        {/* Textarea for pasting */}
        <Textarea
          placeholder={`Paste your data here...\n\nExample:\nSTOCK\tTOPLAM_ADET\tHISSE_BASI_ORTALAMA_MALIYET\nAGESA\t750\t214,60 TRY\nARCLK\t800\t44,09 TRY`}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={6}
          className="font-mono text-sm"
        />

        {/* Preview table */}
        {parsedData && parsedData.rows.length > 0 && (
          <div className="space-y-3">
            <ImportPreviewTable
              parsedData={parsedData}
              existingSymbols={existingSymbols}
            />

            {/* Skip duplicates option */}
            {duplicateCount > 0 && (
              <Field className="flex items-center gap-3">
                <Checkbox
                  checked={skipDuplicates}
                  onChange={(checked) => setSkipDuplicates(checked)}
                />
                <Label>Skip existing assets ({duplicateCount} duplicates found)</Label>
              </Field>
            )}
          </div>
        )}

        {/* Success message */}
        {importResult && importResult.imported > 0 && (
          <div className="rounded-lg bg-green-50 dark:bg-green-950/50 p-3 text-sm text-green-700 dark:text-green-400">
            ✓ Successfully imported {importResult.imported} asset
            {importResult.imported > 1 ? 's' : ''}!
            {importResult.failed > 0 && ` (${importResult.failed} failed)`}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/50 p-3 text-sm text-red-600 dark:text-red-400">
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
          disabled={!parsedData || importableCount === 0 || isImporting}
        >
          {isImporting
            ? 'Importing...'
            : importableCount > 0
              ? `Import ${importableCount} Asset${importableCount > 1 ? 's' : ''}`
              : 'No valid assets to import'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
