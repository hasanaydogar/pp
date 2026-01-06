/**
 * Period utility functions for date range calculations
 */

export type Period = '7d' | '30d' | '90d' | 'month' | 'year' | 'all';

export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Get the date range for a given period
 */
export function getPeriodDateRange(period: Period): DateRange {
  const end = new Date();
  const start = new Date();
  
  // Set to end of today
  end.setHours(23, 59, 59, 999);
  
  switch (period) {
    case '7d':
      start.setDate(end.getDate() - 7);
      break;
    case '30d':
      start.setDate(end.getDate() - 30);
      break;
    case '90d':
      start.setDate(end.getDate() - 90);
      break;
    case 'month':
      // Start of current month
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'year':
      // Start of current year
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'all':
      // Far back enough to include all data
      start.setFullYear(2020, 0, 1);
      start.setHours(0, 0, 0, 0);
      break;
    default:
      start.setDate(end.getDate() - 30);
  }
  
  // Set start to beginning of day
  if (period !== 'month' && period !== 'year' && period !== 'all') {
    start.setHours(0, 0, 0, 0);
  }
  
  return { start, end };
}

/**
 * Format period as human-readable label
 */
export function formatPeriodLabel(period: Period): string {
  const labels: Record<Period, string> = {
    '7d': 'Son 7 Gün',
    '30d': 'Son 30 Gün',
    '90d': 'Son 90 Gün',
    'month': 'Bu Ay',
    'year': 'Bu Yıl',
    'all': 'Tümü',
  };
  return labels[period] || 'Son 30 Gün';
}

/**
 * Get all available period options
 */
export function getPeriodOptions(): { value: Period; label: string }[] {
  return [
    { value: '7d', label: 'Son 7 Gün' },
    { value: '30d', label: 'Son 30 Gün' },
    { value: '90d', label: 'Son 90 Gün' },
    { value: 'month', label: 'Bu Ay' },
    { value: 'year', label: 'Bu Yıl' },
    { value: 'all', label: 'Tümü' },
  ];
}

/**
 * Format date range as string (e.g., "1 Oca - 31 Oca 2026")
 */
export function formatDateRange(range: DateRange): string {
  const formatOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
  };
  
  const startStr = range.start.toLocaleDateString('tr-TR', formatOptions);
  const endStr = range.end.toLocaleDateString('tr-TR', {
    ...formatOptions,
    year: 'numeric',
  });
  
  return `${startStr} - ${endStr}`;
}

/**
 * Convert DateRange to ISO date strings for API calls
 */
export function dateRangeToISO(range: DateRange): { startDate: string; endDate: string } {
  return {
    startDate: range.start.toISOString().split('T')[0],
    endDate: range.end.toISOString().split('T')[0],
  };
}

/**
 * Check if a date is within a given range
 */
export function isDateInRange(date: Date | string, range: DateRange): boolean {
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  return checkDate >= range.start && checkDate <= range.end;
}

/**
 * Check if a date is in the future
 */
export function isFutureDate(date: Date | string): boolean {
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return checkDate > today;
}
