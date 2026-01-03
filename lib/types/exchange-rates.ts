import { z } from 'zod';

/**
 * Exchange Rate API Response Schema
 * Based on ExchangeRate-API v6 response format
 * @see https://www.exchangerate-api.com/docs/overview
 */
export const ExchangeRateResponseSchema = z.object({
  result: z.enum(['success', 'error']),
  documentation: z.string().optional(),
  terms_of_use: z.string().optional(),
  time_last_update_unix: z.number(),
  time_last_update_utc: z.string(),
  time_next_update_unix: z.number(),
  time_next_update_utc: z.string(),
  base_code: z.string(),
  conversion_rates: z.record(z.string(), z.number()),
  error_type: z.string().optional(),
});

export type ExchangeRateResponse = z.infer<typeof ExchangeRateResponseSchema>;

/**
 * Simplified exchange rate data for internal use
 */
export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  lastUpdate: Date;
  nextUpdate: Date;
  /** Indicates if using fallback static rates instead of live API data */
  isFallback?: boolean;
  /** Warning message to display when using fallback rates */
  fallbackWarning?: string;
}

/**
 * Exchange rate API error types
 */
export type ExchangeRateErrorType =
  | 'unsupported-code'
  | 'malformed-request'
  | 'invalid-key'
  | 'inactive-account'
  | 'quota-reached'
  | 'network-error'
  | 'timeout-error'
  | 'unknown-error';

/**
 * Exchange rate API error
 */
export class ExchangeRateError extends Error {
  constructor(
    message: string,
    public type: ExchangeRateErrorType,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ExchangeRateError';
  }
}

/**
 * Exchange rate fetch options
 */
export interface ExchangeRateFetchOptions {
  baseCurrency?: string;
  timeout?: number;
  signal?: AbortSignal;
}
