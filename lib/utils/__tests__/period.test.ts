/**
 * @jest-environment node
 */

import {
  Period,
  getPeriodDateRange,
  formatPeriodLabel,
  getPeriodOptions,
  formatDateRange,
  dateRangeToISO,
  isDateInRange,
  isFutureDate,
} from '../period';

describe('period utility functions', () => {
  // Mock the current date for consistent testing
  const mockDate = new Date('2026-01-21T12:00:00.000Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getPeriodDateRange', () => {
    it('should return correct range for 7d period', () => {
      const range = getPeriodDateRange('7d');

      expect(range.end.getFullYear()).toBe(2026);
      expect(range.end.getMonth()).toBe(0); // January
      expect(range.end.getDate()).toBe(21);

      // Start should be 7 days before
      expect(range.start.getDate()).toBe(14);
    });

    it('should return correct range for 30d period', () => {
      const range = getPeriodDateRange('30d');

      // End is today
      expect(range.end.getDate()).toBe(21);

      // Start should be 30 days before (Dec 22, 2025)
      expect(range.start.getMonth()).toBe(11); // December
      expect(range.start.getDate()).toBe(22);
      expect(range.start.getFullYear()).toBe(2025);
    });

    it('should return correct range for 90d period', () => {
      const range = getPeriodDateRange('90d');

      // Start should be 90 days before
      expect(range.start.getMonth()).toBe(9); // October
    });

    it('should return correct range for month period', () => {
      const range = getPeriodDateRange('month');

      // Start should be first of current month
      expect(range.start.getDate()).toBe(1);
      expect(range.start.getMonth()).toBe(0); // January
      expect(range.start.getFullYear()).toBe(2026);
    });

    it('should return correct range for year period', () => {
      const range = getPeriodDateRange('year');

      // Start should be Jan 1st of current year
      expect(range.start.getDate()).toBe(1);
      expect(range.start.getMonth()).toBe(0); // January
      expect(range.start.getFullYear()).toBe(2026);
    });

    it('should return correct range for all period', () => {
      const range = getPeriodDateRange('all');

      // Start should be 2020
      expect(range.start.getFullYear()).toBe(2020);
    });

    it('should set end time to end of day', () => {
      const range = getPeriodDateRange('7d');

      expect(range.end.getHours()).toBe(23);
      expect(range.end.getMinutes()).toBe(59);
      expect(range.end.getSeconds()).toBe(59);
    });

    it('should set start time to beginning of day for relative periods', () => {
      const range = getPeriodDateRange('7d');

      expect(range.start.getHours()).toBe(0);
      expect(range.start.getMinutes()).toBe(0);
      expect(range.start.getSeconds()).toBe(0);
    });
  });

  describe('formatPeriodLabel', () => {
    it('should return correct label for 7d', () => {
      expect(formatPeriodLabel('7d')).toBe('Son 7 Gün');
    });

    it('should return correct label for 30d', () => {
      expect(formatPeriodLabel('30d')).toBe('Son 30 Gün');
    });

    it('should return correct label for 90d', () => {
      expect(formatPeriodLabel('90d')).toBe('Son 90 Gün');
    });

    it('should return correct label for month', () => {
      expect(formatPeriodLabel('month')).toBe('Bu Ay');
    });

    it('should return correct label for year', () => {
      expect(formatPeriodLabel('year')).toBe('Bu Yıl');
    });

    it('should return correct label for all', () => {
      expect(formatPeriodLabel('all')).toBe('Tümü');
    });

    it('should cover all Period types', () => {
      const periods: Period[] = ['7d', '30d', '90d', 'month', 'year', 'all'];
      periods.forEach(period => {
        expect(formatPeriodLabel(period)).toBeTruthy();
      });
    });
  });

  describe('getPeriodOptions', () => {
    it('should return all period options', () => {
      const options = getPeriodOptions();

      expect(options).toHaveLength(6);
      expect(options.map(o => o.value)).toEqual(['7d', '30d', '90d', 'month', 'year', 'all']);
    });

    it('should have labels for all options', () => {
      const options = getPeriodOptions();

      options.forEach(option => {
        expect(option.label).toBeTruthy();
        expect(typeof option.label).toBe('string');
      });
    });
  });

  describe('formatDateRange', () => {
    it('should format date range correctly', () => {
      const range = {
        start: new Date('2026-01-01'),
        end: new Date('2026-01-31'),
      };

      const formatted = formatDateRange(range);

      // Turkish format: "1 Oca - 31 Oca 2026"
      expect(formatted).toContain('Oca');
      expect(formatted).toContain('2026');
    });
  });

  describe('dateRangeToISO', () => {
    it('should convert date range to ISO strings', () => {
      const range = {
        start: new Date('2026-01-15T10:30:00'),
        end: new Date('2026-01-20T15:45:00'),
      };

      const iso = dateRangeToISO(range);

      expect(iso.startDate).toBe('2026-01-15');
      expect(iso.endDate).toBe('2026-01-20');
    });
  });

  describe('isDateInRange', () => {
    const range = {
      start: new Date('2026-01-10'),
      end: new Date('2026-01-20'),
    };

    it('should return true for date within range', () => {
      expect(isDateInRange(new Date('2026-01-15'), range)).toBe(true);
    });

    it('should return true for date at start of range', () => {
      expect(isDateInRange(new Date('2026-01-10'), range)).toBe(true);
    });

    it('should return true for date at end of range', () => {
      expect(isDateInRange(new Date('2026-01-20'), range)).toBe(true);
    });

    it('should return false for date before range', () => {
      expect(isDateInRange(new Date('2026-01-05'), range)).toBe(false);
    });

    it('should return false for date after range', () => {
      expect(isDateInRange(new Date('2026-01-25'), range)).toBe(false);
    });

    it('should accept string dates', () => {
      expect(isDateInRange('2026-01-15', range)).toBe(true);
      expect(isDateInRange('2026-01-05', range)).toBe(false);
    });
  });

  describe('isFutureDate', () => {
    it('should return true for future date', () => {
      expect(isFutureDate(new Date('2026-01-22'))).toBe(true);
      expect(isFutureDate(new Date('2026-02-01'))).toBe(true);
    });

    it('should return false for past date', () => {
      expect(isFutureDate(new Date('2026-01-20'))).toBe(false);
      expect(isFutureDate(new Date('2025-12-31'))).toBe(false);
    });

    it('should return false for today', () => {
      // Today is 2026-01-21, checking at start of day
      expect(isFutureDate(new Date('2026-01-21T00:00:00'))).toBe(false);
    });

    it('should accept string dates', () => {
      expect(isFutureDate('2026-01-25')).toBe(true);
      expect(isFutureDate('2026-01-15')).toBe(false);
    });
  });
});
