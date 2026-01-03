import { describe, it, expect } from '@jest/globals';
import {
  convertCurrency,
  getConversionRate,
  roundAmount,
  formatCurrency,
  formatConversionRate,
  convertAndFormat,
  batchConvert,
  calculateTotal,
} from '../currency-conversion';
import { ExchangeRates } from '@/lib/types/exchange-rates';

// Mock exchange rates for testing
const mockRates: ExchangeRates = {
  base: 'USD',
  rates: {
    USD: 1.0,
    EUR: 0.91,
    GBP: 0.79,
    TRY: 32.5,
    JPY: 144.5,
  },
  lastUpdate: new Date('2025-01-02'),
  nextUpdate: new Date('2025-01-03'),
};

describe('Currency Conversion Utils', () => {
  describe('getConversionRate', () => {
    it('should return 1 for same currency', () => {
      expect(getConversionRate('USD', 'USD', mockRates)).toBe(1);
      expect(getConversionRate('EUR', 'EUR', mockRates)).toBe(1);
    });

    it('should return direct rate when from is base currency', () => {
      expect(getConversionRate('USD', 'EUR', mockRates)).toBe(0.91);
      expect(getConversionRate('USD', 'TRY', mockRates)).toBe(32.5);
    });

    it('should calculate inverse rate when to is base currency', () => {
      const rate = getConversionRate('EUR', 'USD', mockRates);
      expect(rate).toBeCloseTo(1 / 0.91, 5);
    });

    it('should calculate cross-currency rate', () => {
      const rate = getConversionRate('EUR', 'TRY', mockRates);
      expect(rate).toBeCloseTo(32.5 / 0.91, 5);
    });

    it('should return null for undefined rates', () => {
      expect(getConversionRate('USD', 'EUR', undefined)).toBeNull();
    });

    it('should return null for unsupported currency', () => {
      expect(getConversionRate('USD', 'XXX', mockRates)).toBeNull();
      expect(getConversionRate('XXX', 'USD', mockRates)).toBeNull();
    });
  });

  describe('convertCurrency', () => {
    it('should convert from base currency', () => {
      expect(convertCurrency(100, 'USD', 'EUR', mockRates)).toBe(91);
      expect(convertCurrency(100, 'USD', 'TRY', mockRates)).toBe(3250);
    });

    it('should convert to base currency', () => {
      const result = convertCurrency(91, 'EUR', 'USD', mockRates);
      expect(result).toBeCloseTo(100, 0);
    });

    it('should convert between non-base currencies', () => {
      const result = convertCurrency(100, 'EUR', 'TRY', mockRates);
      expect(result).toBeCloseTo(3571.43, 2);
    });

    it('should return 0 for zero amount', () => {
      expect(convertCurrency(0, 'USD', 'EUR', mockRates)).toBe(0);
    });

    it('should return amount unchanged for same currency', () => {
      expect(convertCurrency(100, 'USD', 'USD', mockRates)).toBe(100);
    });

    it('should return null for undefined rates', () => {
      expect(convertCurrency(100, 'USD', 'EUR', undefined)).toBeNull();
    });

    it('should handle negative amounts', () => {
      expect(convertCurrency(-100, 'USD', 'EUR', mockRates)).toBe(-91);
    });

    it('should respect precision option', () => {
      const result = convertCurrency(100, 'USD', 'EUR', mockRates, { precision: 4 });
      expect(result).toBe(91);
    });
  });

  describe('roundAmount', () => {
    it('should round with half-up mode', () => {
      expect(roundAmount(1.234, 2, 'half-up')).toBe(1.23);
      expect(roundAmount(1.235, 2, 'half-up')).toBe(1.24);
      expect(roundAmount(1.236, 2, 'half-up')).toBe(1.24);
    });

    it('should round with floor mode', () => {
      expect(roundAmount(1.234, 2, 'floor')).toBe(1.23);
      expect(roundAmount(1.239, 2, 'floor')).toBe(1.23);
    });

    it('should round with ceil mode', () => {
      expect(roundAmount(1.231, 2, 'ceil')).toBe(1.24);
      expect(roundAmount(1.239, 2, 'ceil')).toBe(1.24);
    });

    it('should handle different precisions', () => {
      expect(roundAmount(1.23456, 0)).toBe(1);
      expect(roundAmount(1.23456, 1)).toBe(1.2);
      expect(roundAmount(1.23456, 3)).toBe(1.235);
    });
  });

  describe('formatCurrency', () => {
    it('should format USD correctly', () => {
      const result = formatCurrency(1234.56, 'USD');
      expect(result).toContain('1,234.56');
      expect(result).toContain('$');
    });

    it('should format EUR correctly', () => {
      const result = formatCurrency(1234.56, 'EUR');
      expect(result).toContain('1,234.56');
      expect(result).toContain('€');
    });

    it('should format TRY correctly', () => {
      const result = formatCurrency(1234.56, 'TRY');
      expect(result).toContain('1,234.56');
    });

    it('should handle zero', () => {
      const result = formatCurrency(0, 'USD');
      expect(result).toContain('0.00');
    });

    it('should handle negative amounts', () => {
      const result = formatCurrency(-1234.56, 'USD');
      expect(result).toContain('1,234.56');
    });
  });

  describe('formatConversionRate', () => {
    it('should format conversion rate correctly', () => {
      expect(formatConversionRate('USD', 'EUR', 0.91)).toBe('1 USD = 0.91 EUR');
      expect(formatConversionRate('USD', 'TRY', 32.5)).toBe('1 USD = 32.50 TRY');
    });

    it('should handle large rates', () => {
      expect(formatConversionRate('USD', 'JPY', 144.5)).toBe('1 USD = 144.50 JPY');
    });
  });

  describe('convertAndFormat', () => {
    it('should convert and format in one step', () => {
      const result = convertAndFormat(100, 'USD', 'EUR', mockRates);
      expect(result).toContain('91.00');
      expect(result).toContain('€');
    });

    it('should return null for failed conversion', () => {
      expect(convertAndFormat(100, 'USD', 'XXX', mockRates)).toBeNull();
    });
  });

  describe('batchConvert', () => {
    it('should convert multiple amounts', () => {
      const amounts = [
        { amount: 100, currency: 'USD' },
        { amount: 200, currency: 'EUR' },
      ];
      const results = batchConvert(amounts, 'TRY', mockRates);
      
      expect(results).toHaveLength(2);
      expect(results[0].amount).toBe(3250);
      expect(results[0].currency).toBe('TRY');
      expect(results[1].amount).toBeCloseTo(7142.86, 2);
      expect(results[1].currency).toBe('TRY');
    });

    it('should handle empty array', () => {
      const results = batchConvert([], 'USD', mockRates);
      expect(results).toHaveLength(0);
    });
  });

  describe('calculateTotal', () => {
    it('should calculate total of mixed currencies', () => {
      const amounts = [
        { amount: 100, currency: 'USD' },
        { amount: 91, currency: 'EUR' },
      ];
      const total = calculateTotal(amounts, 'USD', mockRates);
      expect(total).toBeCloseTo(200, 0);
    });

    it('should return null if any conversion fails', () => {
      const amounts = [
        { amount: 100, currency: 'USD' },
        { amount: 100, currency: 'XXX' },
      ];
      const total = calculateTotal(amounts, 'USD', mockRates);
      expect(total).toBeNull();
    });

    it('should handle empty array', () => {
      const total = calculateTotal([], 'USD', mockRates);
      expect(total).toBe(0);
    });

    it('should handle same currency', () => {
      const amounts = [
        { amount: 100, currency: 'USD' },
        { amount: 200, currency: 'USD' },
      ];
      const total = calculateTotal(amounts, 'USD', mockRates);
      expect(total).toBe(300);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small amounts', () => {
      const result = convertCurrency(0.01, 'USD', 'EUR', mockRates);
      expect(result).toBeCloseTo(0.01, 2);
    });

    it('should handle very large amounts', () => {
      const result = convertCurrency(1000000, 'USD', 'TRY', mockRates);
      expect(result).toBe(32500000);
    });

    it('should handle decimal precision', () => {
      const result = convertCurrency(100.123, 'USD', 'EUR', mockRates);
      expect(result).toBeCloseTo(91.11, 2);
    });
  });
});
