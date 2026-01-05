import { Currency } from '@/lib/types/currency';

// Currency symbol mapping for compact display
const CURRENCY_SYMBOLS: Record<string, string> = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  CHF: 'CHF',
  CAD: 'C$',
  AUD: 'A$',
  INR: '₹',
  KRW: '₩',
  BRL: 'R$',
  RUB: '₽',
};

/**
 * Formats a number as currency with compact symbol
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
    useSymbol?: boolean; // Use compact symbol instead of code
  }
): string {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    locale = 'tr-TR',
    useSymbol = true,
  } = options || {};

  // Use compact symbol for known currencies
  if (useSymbol && CURRENCY_SYMBOLS[currency]) {
    const formattedNumber = amount.toLocaleString(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
    });
    return `${CURRENCY_SYMBOLS[currency]}${formattedNumber}`;
  }

  // Fallback to standard formatting
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
