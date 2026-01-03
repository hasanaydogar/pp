'use client';

import React from 'react';
import { useExchangeRates } from '@/lib/hooks/use-exchange-rates';
import { useCurrency } from '@/lib/context/currency-context';
import { convertCurrency, formatCurrency, formatConversionRate, getConversionRate } from '@/lib/utils/currency-conversion';
import { Spinner } from '@/components/ui/spinner';

export interface CurrencyDisplayProps {
  /**
   * The amount to display
   */
  amount: number;
  
  /**
   * The original currency of the amount
   */
  currency: string;
  
  /**
   * Display format
   * - 'inline': Show converted amount inline with original
   * - 'stacked': Show converted amount below original
   * - 'converted-only': Show only converted amount
   * @default 'inline'
   */
  format?: 'inline' | 'stacked' | 'converted-only';
  
  /**
   * Show conversion rate tooltip
   * @default false
   */
  showRate?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Show loading spinner while fetching rates
   * @default true
   */
  showLoading?: boolean;
}

/**
 * Currency Display Component
 * 
 * Displays an amount with automatic conversion to the user's selected currency.
 * 
 * @example
 * ```tsx
 * // Inline format (default)
 * <CurrencyDisplay amount={100} currency="USD" />
 * // Output: $100.00 (₺3,250.00)
 * 
 * // Stacked format
 * <CurrencyDisplay amount={100} currency="USD" format="stacked" />
 * // Output:
 * // $100.00
 * // ₺3,250.00
 * 
 * // Converted only
 * <CurrencyDisplay amount={100} currency="USD" format="converted-only" />
 * // Output: ₺3,250.00
 * 
 * // With conversion rate
 * <CurrencyDisplay amount={100} currency="USD" showRate />
 * // Output: $100.00 (₺3,250.00) [1 USD = 32.50 TRY]
 * ```
 */
export function CurrencyDisplay({
  amount,
  currency,
  format = 'inline',
  showRate = false,
  className = '',
  showLoading = true,
}: CurrencyDisplayProps) {
  const { currency: selectedCurrency } = useCurrency();
  const { data: rates, isLoading, error } = useExchangeRates();
  
  // Loading state
  if (isLoading && showLoading) {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        <Spinner className="h-4 w-4" />
        <span className="text-zinc-500 dark:text-zinc-400">Loading...</span>
      </span>
    );
  }
  
  // Error state - show original amount
  if (error || !rates) {
    return (
      <span className={className} title="Exchange rates unavailable">
        {formatCurrency(amount, currency)}
      </span>
    );
  }
  
  // Same currency - no conversion needed
  if (currency === selectedCurrency) {
    return (
      <span className={className}>
        {formatCurrency(amount, currency)}
      </span>
    );
  }
  
  // Convert amount
  const convertedAmount = convertCurrency(amount, currency, selectedCurrency, rates);
  
  if (convertedAmount === null) {
    // Conversion failed - show original
    return (
      <span className={className} title="Conversion unavailable">
        {formatCurrency(amount, currency)}
      </span>
    );
  }
  
  const originalFormatted = formatCurrency(amount, currency);
  const convertedFormatted = formatCurrency(convertedAmount, selectedCurrency);
  const rate = getConversionRate(currency, selectedCurrency, rates);
  const rateFormatted = rate ? formatConversionRate(currency, selectedCurrency, rate) : '';
  
  // Converted only format
  if (format === 'converted-only') {
    return (
      <span className={className} title={`Original: ${originalFormatted}`}>
        {convertedFormatted}
        {showRate && rate && (
          <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
            ({rateFormatted})
          </span>
        )}
      </span>
    );
  }
  
  // Stacked format
  if (format === 'stacked') {
    return (
      <div className={`flex flex-col ${className}`}>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {originalFormatted}
        </span>
        <span className="font-semibold">
          {convertedFormatted}
        </span>
        {showRate && rate && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {rateFormatted}
          </span>
        )}
      </div>
    );
  }
  
  // Inline format (default)
  return (
    <span className={className}>
      <span className="font-semibold">{convertedFormatted}</span>
      <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">
        ({originalFormatted})
      </span>
      {showRate && rate && (
        <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
          [{rateFormatted}]
        </span>
      )}
    </span>
  );
}

/**
 * Simple currency amount display without conversion
 * 
 * @example
 * ```tsx
 * <CurrencyAmount amount={1234.56} currency="USD" />
 * // Output: $1,234.56
 * ```
 */
export function CurrencyAmount({
  amount,
  currency,
  className = '',
}: {
  amount: number;
  currency: string;
  className?: string;
}) {
  return (
    <span className={className}>
      {formatCurrency(amount, currency)}
    </span>
  );
}

/**
 * Currency badge showing the currency code
 * 
 * @example
 * ```tsx
 * <CurrencyBadge currency="USD" />
 * // Output: [USD]
 * ```
 */
export function CurrencyBadge({
  currency,
  className = '',
}: {
  currency: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 ${className}`}
    >
      {currency}
    </span>
  );
}

/**
 * Conversion rate display
 * 
 * @example
 * ```tsx
 * <ConversionRateDisplay from="USD" to="TRY" />
 * // Output: 1 USD = 32.50 TRY
 * ```
 */
export function ConversionRateDisplay({
  from,
  to,
  className = '',
}: {
  from: string;
  to: string;
  className?: string;
}) {
  const { data: rates, isLoading } = useExchangeRates();
  
  if (isLoading) {
    return (
      <span className={`text-zinc-500 dark:text-zinc-400 ${className}`}>
        Loading rate...
      </span>
    );
  }
  
  if (!rates || from === to) {
    return null;
  }
  
  const rate = getConversionRate(from, to, rates);
  
  if (rate === null) {
    return null;
  }
  
  return (
    <span className={`text-sm text-zinc-500 dark:text-zinc-400 ${className}`}>
      {formatConversionRate(from, to, rate)}
    </span>
  );
}
