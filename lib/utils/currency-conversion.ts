import { ExchangeRates } from '@/lib/types/exchange-rates';

/**
 * Currency conversion options
 */
export interface ConversionOptions {
  /**
   * Number of decimal places for rounding
   * @default 2
   */
  precision?: number;
  
  /**
   * Rounding mode
   * @default 'half-up'
   */
  roundingMode?: 'half-up' | 'floor' | 'ceil';
}

/**
 * Convert an amount from one currency to another
 * 
 * @param amount - The amount to convert
 * @param from - Source currency code (e.g., 'USD')
 * @param to - Target currency code (e.g., 'EUR')
 * @param rates - Exchange rates data
 * @param options - Conversion options
 * @returns Converted amount, or null if conversion is not possible
 * 
 * @example
 * ```ts
 * const rates = { base: 'USD', rates: { EUR: 0.91, TRY: 32.5 } };
 * convertCurrency(100, 'USD', 'EUR', rates); // 91.00
 * convertCurrency(100, 'EUR', 'TRY', rates); // 3571.43
 * ```
 */
export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: ExchangeRates | undefined,
  options: ConversionOptions = {}
): number | null {
  const { precision = 2, roundingMode = 'half-up' } = options;
  
  // Validation
  if (!rates) return null;
  if (amount === 0) return 0;
  if (from === to) return amount;
  
  // Get conversion rate
  const rate = getConversionRate(from, to, rates);
  if (rate === null) return null;
  
  // Convert
  const converted = amount * rate;
  
  // Round
  return roundAmount(converted, precision, roundingMode);
}

/**
 * Get the conversion rate between two currencies
 * 
 * @param from - Source currency code
 * @param to - Target currency code
 * @param rates - Exchange rates data
 * @returns Conversion rate, or null if not available
 * 
 * @example
 * ```ts
 * const rates = { base: 'USD', rates: { EUR: 0.91, TRY: 32.5 } };
 * getConversionRate('USD', 'EUR', rates); // 0.91
 * getConversionRate('EUR', 'TRY', rates); // 35.71 (32.5 / 0.91)
 * ```
 */
export function getConversionRate(
  from: string,
  to: string,
  rates: ExchangeRates | undefined
): number | null {
  if (!rates) return null;
  if (from === to) return 1;
  
  const { base, rates: conversionRates } = rates;
  
  // Direct conversion if from is the base currency
  if (from === base) {
    return conversionRates[to] ?? null;
  }
  
  // Direct conversion if to is the base currency
  if (to === base) {
    const fromRate = conversionRates[from];
    return fromRate ? 1 / fromRate : null;
  }
  
  // Cross-currency conversion via base currency
  const fromRate = conversionRates[from];
  const toRate = conversionRates[to];
  
  if (fromRate === undefined || toRate === undefined) {
    return null;
  }
  
  return toRate / fromRate;
}

/**
 * Round an amount to specified precision
 * 
 * @param amount - Amount to round
 * @param precision - Number of decimal places
 * @param mode - Rounding mode
 * @returns Rounded amount
 */
export function roundAmount(
  amount: number,
  precision: number = 2,
  mode: 'half-up' | 'floor' | 'ceil' = 'half-up'
): number {
  const multiplier = Math.pow(10, precision);
  
  switch (mode) {
    case 'floor':
      return Math.floor(amount * multiplier) / multiplier;
    case 'ceil':
      return Math.ceil(amount * multiplier) / multiplier;
    case 'half-up':
    default:
      return Math.round(amount * multiplier) / multiplier;
  }
}

/**
 * Format a currency amount with proper symbol and formatting
 * 
 * @param amount - Amount to format
 * @param currency - Currency code (e.g., 'USD')
 * @param options - Intl.NumberFormat options
 * @returns Formatted currency string
 * 
 * @example
 * ```ts
 * formatCurrency(1234.56, 'USD'); // "$1,234.56"
 * formatCurrency(1234.56, 'EUR'); // "€1,234.56"
 * formatCurrency(1234.56, 'TRY'); // "₺1,234.56"
 * ```
 */
export function formatCurrency(
  amount: number,
  currency: string,
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);
}

/**
 * Format a conversion rate for display
 * 
 * @param from - Source currency
 * @param to - Target currency
 * @param rate - Conversion rate
 * @returns Formatted rate string (e.g., "1 USD = 32.50 TRY")
 * 
 * @example
 * ```ts
 * formatConversionRate('USD', 'TRY', 32.5); // "1 USD = 32.50 TRY"
 * formatConversionRate('EUR', 'USD', 1.10); // "1 EUR = 1.10 USD"
 * ```
 */
export function formatConversionRate(
  from: string,
  to: string,
  rate: number
): string {
  const formattedRate = rate.toFixed(2);
  return `1 ${from} = ${formattedRate} ${to}`;
}

/**
 * Convert and format a currency amount in one step
 * 
 * @param amount - Amount to convert
 * @param from - Source currency
 * @param to - Target currency
 * @param rates - Exchange rates data
 * @param options - Conversion options
 * @returns Formatted converted amount, or null if conversion fails
 * 
 * @example
 * ```ts
 * const rates = { base: 'USD', rates: { EUR: 0.91, TRY: 32.5 } };
 * convertAndFormat(100, 'USD', 'EUR', rates); // "€91.00"
 * convertAndFormat(100, 'EUR', 'TRY', rates); // "₺3,571.43"
 * ```
 */
export function convertAndFormat(
  amount: number,
  from: string,
  to: string,
  rates: ExchangeRates | undefined,
  options: ConversionOptions = {}
): string | null {
  const converted = convertCurrency(amount, from, to, rates, options);
  
  if (converted === null) return null;
  
  return formatCurrency(converted, to);
}

/**
 * Batch convert multiple amounts at once
 * 
 * @param amounts - Array of amounts with their currencies
 * @param targetCurrency - Target currency for all conversions
 * @param rates - Exchange rates data
 * @returns Array of converted amounts
 * 
 * @example
 * ```ts
 * const amounts = [
 *   { amount: 100, currency: 'USD' },
 *   { amount: 200, currency: 'EUR' },
 * ];
 * batchConvert(amounts, 'TRY', rates);
 * // [{ amount: 3250, currency: 'TRY' }, { amount: 7142.86, currency: 'TRY' }]
 * ```
 */
export function batchConvert(
  amounts: Array<{ amount: number; currency: string }>,
  targetCurrency: string,
  rates: ExchangeRates | undefined,
  options: ConversionOptions = {}
): Array<{ amount: number | null; currency: string }> {
  return amounts.map(({ amount, currency }) => ({
    amount: convertCurrency(amount, currency, targetCurrency, rates, options),
    currency: targetCurrency,
  }));
}

/**
 * Calculate the total of amounts in different currencies
 * 
 * @param amounts - Array of amounts with their currencies
 * @param targetCurrency - Currency for the total
 * @param rates - Exchange rates data
 * @returns Total amount in target currency, or null if any conversion fails
 * 
 * @example
 * ```ts
 * const amounts = [
 *   { amount: 100, currency: 'USD' },
 *   { amount: 200, currency: 'EUR' },
 * ];
 * calculateTotal(amounts, 'USD', rates); // 320.88 (100 + 200/0.91)
 * ```
 */
export function calculateTotal(
  amounts: Array<{ amount: number; currency: string }>,
  targetCurrency: string,
  rates: ExchangeRates | undefined,
  options: ConversionOptions = {}
): number | null {
  const converted = batchConvert(amounts, targetCurrency, rates, options);
  
  // If any conversion failed, return null
  if (converted.some(({ amount }) => amount === null)) {
    return null;
  }
  
  // Sum all converted amounts
  const total = converted.reduce((sum, { amount }) => sum + (amount ?? 0), 0);
  
  return roundAmount(total, options.precision ?? 2, options.roundingMode);
}
