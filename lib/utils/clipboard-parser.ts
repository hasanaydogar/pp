/**
 * Clipboard Parser Utility
 * Parses tab-separated data from Excel/Google Sheets clipboard
 */

// Column types for import
export type ColumnType = 'symbol' | 'quantity' | 'averagePrice' | 'sector' | 'ignored';

// Column mapping interface
export interface ColumnMapping {
  index: number;
  type: ColumnType;
  header: string;
}

// Parsed row interface
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

// Parse result interface
export interface ParseResult {
  headers: string[];
  columnMappings: ColumnMapping[];
  rows: ParsedRow[];
  validCount: number;
  errorCount: number;
}

// Column detection patterns - order matters for specificity
const COLUMN_PATTERNS: Record<ColumnType, string[]> = {
  symbol: ['stock', 'sembol', 'symbol', 'ticker', 'hisse', 'kod'],
  quantity: ['toplam_adet', 'adet', 'quantity', 'miktar', 'lot', 'qty', 'amount'],
  averagePrice: [
    'hisse_basi_ortalama_maliyet',
    'hisse_basi_ortalama',
    'ortalama_maliyet',
    'ortalama_fiyat',
    'avg_price',
    'average_price',
    'ort_fiyat',
    'birim_fiyat',
  ],
  sector: ['sektor', 'sector', 'sektör', 'industry'],
  ignored: [],
};

/**
 * Parse a number from various formats
 * Supports:
 * - Turkish format: 1.000,50
 * - US format: 1,000.50
 * - With currency suffix: 160.950,00 TRY
 * - Percentage: 1,56%
 */
export function parseNumber(value: string): number | null {
  if (!value || typeof value !== 'string') {
    return null;
  }

  // Clean the value
  let cleaned = value.trim();

  // Remove common suffixes and prefixes
  cleaned = cleaned.replace(/\s*(TRY|USD|EUR|₺|\$|€|%)\s*$/i, '');
  cleaned = cleaned.replace(/^(TRY|USD|EUR|₺|\$|€)\s*/i, '');

  // Remove any remaining whitespace
  cleaned = cleaned.trim();

  if (!cleaned) {
    return null;
  }

  // Detect format by analyzing the pattern
  // Turkish format: uses . as thousands separator and , as decimal
  // US format: uses , as thousands separator and . as decimal

  const lastDot = cleaned.lastIndexOf('.');
  const lastComma = cleaned.lastIndexOf(',');

  let normalizedValue: string;

  if (lastComma > lastDot) {
    // Turkish format: 1.000,50 or just 100,50
    // Remove dots (thousands separator) and replace comma with dot (decimal)
    normalizedValue = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (lastDot > lastComma) {
    // US format: 1,000.50 or just 100.50
    // Remove commas (thousands separator)
    normalizedValue = cleaned.replace(/,/g, '');
  } else if (lastComma !== -1 && lastDot === -1) {
    // Only comma exists: could be Turkish decimal (100,50)
    normalizedValue = cleaned.replace(',', '.');
  } else if (lastDot !== -1 && lastComma === -1) {
    // Only dot exists: could be US decimal (100.50) or Turkish thousands (1.000)
    // If there are exactly 3 digits after the dot, it's likely thousands
    const afterDot = cleaned.split('.')[1];
    if (afterDot && afterDot.length === 3 && !cleaned.includes(',')) {
      // Likely Turkish thousands: 1.000 means 1000
      normalizedValue = cleaned.replace(/\./g, '');
    } else {
      // US decimal
      normalizedValue = cleaned;
    }
  } else {
    // No separators
    normalizedValue = cleaned;
  }

  const result = parseFloat(normalizedValue);
  return isNaN(result) ? null : result;
}

/**
 * Detect column type from header name
 */
export function detectColumnType(header: string): ColumnType {
  if (!header) return 'ignored';

  const normalizedHeader = header.toLowerCase().trim().replace(/\s+/g, '_');

  // Check for exact or partial matches, prioritizing longer/more specific patterns
  const typeScores: { type: ColumnType; score: number }[] = [];

  for (const [type, patterns] of Object.entries(COLUMN_PATTERNS)) {
    if (type === 'ignored') continue;

    for (const pattern of patterns) {
      if (normalizedHeader === pattern) {
        // Exact match - highest priority
        return type as ColumnType;
      }
      if (normalizedHeader.includes(pattern)) {
        // Pattern found in header - score by pattern length (longer = more specific)
        typeScores.push({ type: type as ColumnType, score: pattern.length });
      }
    }
  }

  // Return the type with the highest score (longest matching pattern)
  if (typeScores.length > 0) {
    typeScores.sort((a, b) => b.score - a.score);
    return typeScores[0].type;
  }

  return 'ignored';
}

/**
 * Validate a parsed row
 */
export function validateRow(row: Omit<ParsedRow, 'isValid' | 'errors'>): ParsedRow {
  const errors: string[] = [];

  // Check required fields
  if (!row.symbol || row.symbol.trim() === '') {
    errors.push('Symbol is required');
  }

  if (row.quantity === null || row.quantity === undefined || isNaN(row.quantity)) {
    errors.push('Invalid quantity');
  } else if (row.quantity <= 0) {
    errors.push('Quantity must be positive');
  }

  if (
    row.averagePrice === null ||
    row.averagePrice === undefined ||
    isNaN(row.averagePrice)
  ) {
    errors.push('Invalid average price');
  } else if (row.averagePrice < 0) {
    errors.push('Price cannot be negative');
  }

  return {
    ...row,
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Parse clipboard data (tab-separated values)
 */
export function parseClipboardData(text: string): ParseResult {
  const result: ParseResult = {
    headers: [],
    columnMappings: [],
    rows: [],
    validCount: 0,
    errorCount: 0,
  };

  if (!text || typeof text !== 'string') {
    return result;
  }

  // Split into lines and filter empty ones
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return result;
  }

  // First line is headers
  const headerLine = lines[0];
  result.headers = headerLine.split('\t').map((h) => h.trim());

  // Create column mappings
  result.columnMappings = result.headers.map((header, index) => ({
    index,
    type: detectColumnType(header),
    header,
  }));

  // Find required column indices
  const symbolIndex = result.columnMappings.findIndex((m) => m.type === 'symbol');
  const quantityIndex = result.columnMappings.findIndex((m) => m.type === 'quantity');
  const priceIndex = result.columnMappings.findIndex((m) => m.type === 'averagePrice');
  const sectorIndex = result.columnMappings.findIndex((m) => m.type === 'sector');

  // Parse data rows (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const columns = line.split('\t').map((c) => c.trim());

    // Skip if no data
    if (columns.length === 0 || (columns.length === 1 && columns[0] === '')) {
      continue;
    }

    // Extract values
    const symbol = symbolIndex >= 0 ? columns[symbolIndex] || '' : '';
    const quantityStr = quantityIndex >= 0 ? columns[quantityIndex] || '' : '';
    const priceStr = priceIndex >= 0 ? columns[priceIndex] || '' : '';
    const sector = sectorIndex >= 0 ? columns[sectorIndex] : undefined;

    // Parse numbers
    const quantity = parseNumber(quantityStr) ?? NaN;
    const averagePrice = parseNumber(priceStr) ?? NaN;

    // Create row and validate
    const row = validateRow({
      rowIndex: i,
      symbol: symbol.toUpperCase(),
      quantity,
      averagePrice,
      sector,
      rawData: columns,
    });

    result.rows.push(row);

    if (row.isValid) {
      result.validCount++;
    } else {
      result.errorCount++;
    }
  }

  return result;
}
