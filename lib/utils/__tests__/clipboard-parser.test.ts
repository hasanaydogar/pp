import {
  parseNumber,
  detectColumnType,
  parseClipboardData,
  validateRow,
  ColumnType,
} from '../clipboard-parser';

describe('clipboard-parser', () => {
  describe('parseNumber', () => {
    it('should parse Turkish format (1.000,50)', () => {
      expect(parseNumber('1.000,50')).toBe(1000.5);
      expect(parseNumber('160.950,00')).toBe(160950);
      expect(parseNumber('1.234.567,89')).toBe(1234567.89);
    });

    it('should parse US format (1,000.50)', () => {
      expect(parseNumber('1,000.50')).toBe(1000.5);
      expect(parseNumber('160,950.00')).toBe(160950);
      expect(parseNumber('1,234,567.89')).toBe(1234567.89);
    });

    it('should parse simple numbers', () => {
      expect(parseNumber('100')).toBe(100);
      expect(parseNumber('100.5')).toBe(100.5);
      expect(parseNumber('100,5')).toBe(100.5);
    });

    it('should remove TRY suffix', () => {
      expect(parseNumber('160.950,00 TRY')).toBe(160950);
      expect(parseNumber('214,60 TRY')).toBe(214.6);
      expect(parseNumber('44,09 TRY')).toBe(44.09);
    });

    it('should remove other currency suffixes', () => {
      expect(parseNumber('100.50 USD')).toBe(100.5);
      expect(parseNumber('100,50 EUR')).toBe(100.5);
      expect(parseNumber('100₺')).toBe(100);
      expect(parseNumber('$100')).toBe(100);
    });

    it('should handle percentage format', () => {
      expect(parseNumber('1,56%')).toBe(1.56);
      expect(parseNumber('10.5%')).toBe(10.5);
    });

    it('should return null for invalid input', () => {
      expect(parseNumber('')).toBeNull();
      expect(parseNumber('abc')).toBeNull();
      expect(parseNumber('   ')).toBeNull();
    });

    it('should handle null and undefined', () => {
      expect(parseNumber(null as unknown as string)).toBeNull();
      expect(parseNumber(undefined as unknown as string)).toBeNull();
    });

    it('should handle edge cases', () => {
      expect(parseNumber('0')).toBe(0);
      expect(parseNumber('0,00')).toBe(0);
      expect(parseNumber('0.00')).toBe(0);
    });
  });

  describe('detectColumnType', () => {
    it('should detect symbol columns', () => {
      expect(detectColumnType('STOCK')).toBe('symbol');
      expect(detectColumnType('Sembol')).toBe('symbol');
      expect(detectColumnType('Symbol')).toBe('symbol');
      expect(detectColumnType('Ticker')).toBe('symbol');
      expect(detectColumnType('Hisse')).toBe('symbol');
    });

    it('should detect quantity columns', () => {
      expect(detectColumnType('TOPLAM_ADET')).toBe('quantity');
      expect(detectColumnType('Adet')).toBe('quantity');
      expect(detectColumnType('Quantity')).toBe('quantity');
      expect(detectColumnType('Miktar')).toBe('quantity');
      expect(detectColumnType('Lot')).toBe('quantity');
    });

    it('should detect price columns', () => {
      expect(detectColumnType('HISSE_BASI_ORTALAMA_MALIYET')).toBe('averagePrice');
      expect(detectColumnType('Ortalama_Maliyet')).toBe('averagePrice');
      expect(detectColumnType('Avg_Price')).toBe('averagePrice');
      expect(detectColumnType('Average_Price')).toBe('averagePrice');
      expect(detectColumnType('Ortalama_Fiyat')).toBe('averagePrice');
    });

    it('should detect sector columns', () => {
      expect(detectColumnType('SEKTOR')).toBe('sector');
      expect(detectColumnType('Sector')).toBe('sector');
      expect(detectColumnType('Sektör')).toBe('sector');
    });

    it('should return ignored for unknown columns', () => {
      expect(detectColumnType('TOPLAM_DEĞER')).toBe('ignored');
      expect(detectColumnType('Yüzde')).toBe('ignored');
      expect(detectColumnType('RandomColumn')).toBe('ignored');
    });

    it('should handle empty or null input', () => {
      expect(detectColumnType('')).toBe('ignored');
      expect(detectColumnType(null as unknown as string)).toBe('ignored');
    });
  });

  describe('validateRow', () => {
    it('should validate a valid row', () => {
      const row = validateRow({
        rowIndex: 1,
        symbol: 'AGESA',
        quantity: 750,
        averagePrice: 214.6,
        rawData: ['AGESA', '750', '214,60'],
      });

      expect(row.isValid).toBe(true);
      expect(row.errors).toHaveLength(0);
    });

    it('should invalidate row with missing symbol', () => {
      const row = validateRow({
        rowIndex: 1,
        symbol: '',
        quantity: 750,
        averagePrice: 214.6,
        rawData: ['', '750', '214,60'],
      });

      expect(row.isValid).toBe(false);
      expect(row.errors).toContain('Symbol is required');
    });

    it('should invalidate row with invalid quantity', () => {
      const row = validateRow({
        rowIndex: 1,
        symbol: 'AGESA',
        quantity: NaN,
        averagePrice: 214.6,
        rawData: ['AGESA', 'abc', '214,60'],
      });

      expect(row.isValid).toBe(false);
      expect(row.errors).toContain('Invalid quantity');
    });

    it('should invalidate row with zero quantity', () => {
      const row = validateRow({
        rowIndex: 1,
        symbol: 'AGESA',
        quantity: 0,
        averagePrice: 214.6,
        rawData: ['AGESA', '0', '214,60'],
      });

      expect(row.isValid).toBe(false);
      expect(row.errors).toContain('Quantity must be positive');
    });

    it('should invalidate row with invalid price', () => {
      const row = validateRow({
        rowIndex: 1,
        symbol: 'AGESA',
        quantity: 750,
        averagePrice: NaN,
        rawData: ['AGESA', '750', 'abc'],
      });

      expect(row.isValid).toBe(false);
      expect(row.errors).toContain('Invalid average price');
    });

    it('should allow zero price', () => {
      const row = validateRow({
        rowIndex: 1,
        symbol: 'AGESA',
        quantity: 750,
        averagePrice: 0,
        rawData: ['AGESA', '750', '0'],
      });

      expect(row.isValid).toBe(true);
    });

    it('should invalidate row with negative price', () => {
      const row = validateRow({
        rowIndex: 1,
        symbol: 'AGESA',
        quantity: 750,
        averagePrice: -100,
        rawData: ['AGESA', '750', '-100'],
      });

      expect(row.isValid).toBe(false);
      expect(row.errors).toContain('Price cannot be negative');
    });
  });

  describe('parseClipboardData', () => {
    const sampleData = `STOCK\tTOPLAM_ADET\tHISSE_BASI_ORTALAMA_MALIYET\tSEKTOR
AGESA\t750\t214,60 TRY\tSigorta
ARCLK\t800\t44,09 TRY\tBeyaz Eşya
BIMAS\t197\t210,89 TRY\tMarket`;

    it('should parse valid tab-separated data', () => {
      const result = parseClipboardData(sampleData);

      expect(result.headers).toHaveLength(4);
      expect(result.rows).toHaveLength(3);
      expect(result.validCount).toBe(3);
      expect(result.errorCount).toBe(0);
    });

    it('should detect column types from headers', () => {
      const result = parseClipboardData(sampleData);

      expect(result.columnMappings[0].type).toBe('symbol');
      expect(result.columnMappings[1].type).toBe('quantity');
      expect(result.columnMappings[2].type).toBe('averagePrice');
      expect(result.columnMappings[3].type).toBe('sector');
    });

    it('should parse row values correctly', () => {
      const result = parseClipboardData(sampleData);

      expect(result.rows[0].symbol).toBe('AGESA');
      expect(result.rows[0].quantity).toBe(750);
      expect(result.rows[0].averagePrice).toBe(214.6);
      expect(result.rows[0].sector).toBe('Sigorta');

      expect(result.rows[1].symbol).toBe('ARCLK');
      expect(result.rows[1].quantity).toBe(800);
      expect(result.rows[1].averagePrice).toBe(44.09);
    });

    it('should handle empty input', () => {
      const result = parseClipboardData('');

      expect(result.headers).toHaveLength(0);
      expect(result.rows).toHaveLength(0);
      expect(result.validCount).toBe(0);
    });

    it('should handle header-only input', () => {
      const result = parseClipboardData('STOCK\tADET\tFIYAT');

      expect(result.headers).toHaveLength(3);
      expect(result.rows).toHaveLength(0);
    });

    it('should mark invalid rows', () => {
      const invalidData = `STOCK\tTOPLAM_ADET\tHISSE_BASI_ORTALAMA_MALIYET
AGESA\tabc\t214,60 TRY
ARCLK\t800\t44,09 TRY`;

      const result = parseClipboardData(invalidData);

      expect(result.rows[0].isValid).toBe(false);
      expect(result.rows[0].errors).toContain('Invalid quantity');
      expect(result.rows[1].isValid).toBe(true);
      expect(result.validCount).toBe(1);
      expect(result.errorCount).toBe(1);
    });

    it('should handle Windows line endings', () => {
      const windowsData = 'STOCK\tADET\r\nAGESA\t750\r\nARCLK\t800';
      const result = parseClipboardData(windowsData);

      expect(result.rows).toHaveLength(2);
    });

    it('should skip empty lines', () => {
      const dataWithEmptyLines = `STOCK\tTOPLAM_ADET\tHISSE_BASI_ORTALAMA_MALIYET

AGESA\t750\t214,60 TRY

ARCLK\t800\t44,09 TRY
`;

      const result = parseClipboardData(dataWithEmptyLines);

      expect(result.rows).toHaveLength(2);
    });

    it('should uppercase symbols', () => {
      const lowercaseData = `STOCK\tTOPLAM_ADET\tHISSE_BASI_ORTALAMA_MALIYET
agesa\t750\t214,60 TRY`;

      const result = parseClipboardData(lowercaseData);

      expect(result.rows[0].symbol).toBe('AGESA');
    });

    it('should handle real Google Sheets data format', () => {
      const realData = `STOCK\tYüzde\tTOPLAM_ADET\tTOPLAM_MALIYET\tHISSE_BASI_ORTALAMA_MALIYET\tTOPLAM_DEĞER\tSEKTOR
AGESA\t1,56%\t750\t160.950,00 TRY\t214,60 TRY\t161.625,00 TRY\tSigorta
ARCLK\t0,81%\t800\t35.273,00 TRY\t44,09 TRY\t83.920,00 TRY\tBeyaz Eşya`;

      const result = parseClipboardData(realData);

      expect(result.rows).toHaveLength(2);
      expect(result.validCount).toBe(2);
      expect(result.rows[0].symbol).toBe('AGESA');
      expect(result.rows[0].quantity).toBe(750);
      expect(result.rows[0].averagePrice).toBe(214.6);
      expect(result.rows[0].sector).toBe('Sigorta');
    });
  });
});
