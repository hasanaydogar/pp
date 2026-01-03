'use client';

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ParseResult, ParsedRow } from '@/lib/utils/clipboard-parser';

interface ImportPreviewTableProps {
  parsedData: ParseResult;
  existingSymbols: string[];
  onRowToggle?: (rowIndex: number, include: boolean) => void;
}

type RowStatus = {
  status: 'valid' | 'error' | 'duplicate';
  color: 'green' | 'red' | 'amber';
  label: string;
};

function getRowStatus(row: ParsedRow, existingSymbols: string[]): RowStatus {
  if (!row.isValid) {
    return {
      status: 'error',
      color: 'red',
      label: row.errors[0] || 'Invalid',
    };
  }

  if (existingSymbols.includes(row.symbol.toUpperCase())) {
    return {
      status: 'duplicate',
      color: 'amber',
      label: 'Exists',
    };
  }

  return {
    status: 'valid',
    color: 'green',
    label: 'Valid',
  };
}

export function ImportPreviewTable({
  parsedData,
  existingSymbols,
}: ImportPreviewTableProps) {
  const duplicateCount = parsedData.rows.filter(
    (row) => row.isValid && existingSymbols.includes(row.symbol.toUpperCase())
  ).length;

  return (
    <div className="space-y-2">
      <Table dense>
        <TableHead>
          <TableRow>
            <TableHeader>Symbol</TableHeader>
            <TableHeader className="text-right">Quantity</TableHeader>
            <TableHeader className="text-right">Avg Price</TableHeader>
            {parsedData.columnMappings.some((m) => m.type === 'sector') && (
              <TableHeader>Sector</TableHeader>
            )}
            <TableHeader>Status</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {parsedData.rows.map((row) => {
            const { color, label } = getRowStatus(row, existingSymbols);
            return (
              <TableRow key={row.rowIndex}>
                <TableCell className="font-medium">{row.symbol || '-'}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {isNaN(row.quantity) ? '-' : row.quantity.toLocaleString('tr-TR')}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {isNaN(row.averagePrice)
                    ? '-'
                    : row.averagePrice.toLocaleString('tr-TR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                </TableCell>
                {parsedData.columnMappings.some((m) => m.type === 'sector') && (
                  <TableCell>{row.sector || '-'}</TableCell>
                )}
                <TableCell>
                  <Badge color={color}>{label}</Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Summary */}
      <div className="flex items-center justify-between px-1 text-sm text-zinc-500 dark:text-zinc-400">
        <span>
          Found <strong>{parsedData.rows.length}</strong> rows
        </span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            Valid: {parsedData.validCount - duplicateCount}
          </span>
          {duplicateCount > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
              Duplicates: {duplicateCount}
            </span>
          )}
          {parsedData.errorCount > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
              Errors: {parsedData.errorCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
