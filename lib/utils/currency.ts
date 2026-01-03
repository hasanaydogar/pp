import { Currency } from '@/lib/types/currency';

/**
 * Formats a number as currency
 * @param amount Amount to format
 * @param currency Currency code (defaults to USD)
 * @param options Additional formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: Currency | string = Currency.USD,
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    locale?: string;
  }
): string {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    locale = 'en-US',
  } = options || {};

  return amount.toLocaleString(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits,
    maximumFractionDigits,
  });
}

/**
 * Formats a number as currency without currency symbol (just number)
 * @param amount Amount to format
 * @param options Additional formatting options
 * @returns Formatted number string
 */
export function formatAmount(
  amount: number,
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    locale?: string;
  }
): string {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    locale = 'en-US',
  } = options || {};

  return amount.toLocaleString(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  });
}
