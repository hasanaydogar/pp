import {
  ExchangeRateResponse,
  ExchangeRateResponseSchema,
  ExchangeRates,
  ExchangeRateError,
  ExchangeRateFetchOptions,
} from '@/lib/types/exchange-rates';

/**
 * Exchange Rate API Client
 * 
 * Fetches exchange rates from ExchangeRate-API
 * @see https://www.exchangerate-api.com/docs/overview
 * 
 * @example
 * ```ts
 * const rates = await fetchExchangeRates();
 * console.log(rates.rates['EUR']); // 0.91
 * ```
 */

const API_BASE_URL = 'https://v6.exchangerate-api.com/v6';
const DEFAULT_BASE_CURRENCY = 'USD';
const DEFAULT_TIMEOUT = 5000; // 5 seconds

/**
 * Get API key from environment variables
 * @throws {ExchangeRateError} If API key is not configured
 */
function getApiKey(): string {
  const apiKey = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY;
  
  if (!apiKey || apiKey === 'your_exchange_rate_api_key_here') {
    throw new ExchangeRateError(
      'Exchange Rate API key is not configured. Please set NEXT_PUBLIC_EXCHANGE_RATE_API_KEY in your environment variables.',
      'invalid-key'
    );
  }
  
  return apiKey;
}

/**
 * Fetch exchange rates from ExchangeRate-API
 * 
 * @param options - Fetch options
 * @returns Exchange rates data
 * @throws {ExchangeRateError} If fetch fails or response is invalid
 * 
 * @example
 * ```ts
 * // Fetch rates with USD as base
 * const rates = await fetchExchangeRates();
 * 
 * // Fetch rates with EUR as base
 * const eurRates = await fetchExchangeRates({ baseCurrency: 'EUR' });
 * 
 * // Fetch with custom timeout
 * const rates = await fetchExchangeRates({ timeout: 10000 });
 * ```
 */
export async function fetchExchangeRates(
  options: ExchangeRateFetchOptions = {}
): Promise<ExchangeRates> {
  const {
    baseCurrency = DEFAULT_BASE_CURRENCY,
    timeout = DEFAULT_TIMEOUT,
    signal,
  } = options;

  const apiKey = getApiKey();
  const url = `${API_BASE_URL}/${apiKey}/latest/${baseCurrency}`;

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Fetch exchange rates
    const response = await fetch(url, {
      signal: signal || controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    // Handle HTTP errors
    if (!response.ok) {
      if (response.status === 404) {
        throw new ExchangeRateError(
          `Invalid currency code: ${baseCurrency}`,
          'unsupported-code',
          404
        );
      }
      if (response.status === 429) {
        throw new ExchangeRateError(
          'API rate limit exceeded. Please try again later.',
          'quota-reached',
          429
        );
      }
      throw new ExchangeRateError(
        `HTTP error: ${response.status} ${response.statusText}`,
        'network-error',
        response.status
      );
    }

    // Parse JSON response
    const data: unknown = await response.json();

    // Validate response format with Zod
    const validationResult = ExchangeRateResponseSchema.safeParse(data);
    
    if (!validationResult.success) {
      console.error('Exchange rate response validation failed:', validationResult.error);
      throw new ExchangeRateError(
        'Invalid response format from Exchange Rate API',
        'malformed-request'
      );
    }

    const validatedData = validationResult.data;

    // Check for API-level errors
    if (validatedData.result === 'error') {
      const errorType = validatedData.error_type || 'unknown-error';
      throw new ExchangeRateError(
        `API error: ${errorType}`,
        errorType as any
      );
    }

    // Transform to internal format
    const exchangeRates: ExchangeRates = {
      base: validatedData.base_code,
      rates: validatedData.conversion_rates,
      lastUpdate: new Date(validatedData.time_last_update_unix * 1000),
      nextUpdate: new Date(validatedData.time_next_update_unix * 1000),
    };

    return exchangeRates;

  } catch (error) {
    clearTimeout(timeoutId);

    // Handle abort/timeout errors
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ExchangeRateError(
        'Request timeout: Exchange Rate API did not respond in time',
        'timeout-error'
      );
    }

    // Re-throw ExchangeRateError as-is
    if (error instanceof ExchangeRateError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError) {
      throw new ExchangeRateError(
        'Network error: Unable to connect to Exchange Rate API',
        'network-error'
      );
    }

    // Handle unknown errors
    throw new ExchangeRateError(
      `Unknown error: ${error instanceof Error ? error.message : 'Unknown'}`,
      'unknown-error'
    );
  }
}

/**
 * Fetch conversion rate between two currencies
 * 
 * @param from - Source currency code
 * @param to - Target currency code
 * @param options - Fetch options
 * @returns Conversion rate
 * @throws {ExchangeRateError} If fetch fails
 * 
 * @example
 * ```ts
 * const rate = await fetchConversionRate('USD', 'EUR');
 * console.log(rate); // 0.91
 * ```
 */
export async function fetchConversionRate(
  from: string,
  to: string,
  options: Omit<ExchangeRateFetchOptions, 'baseCurrency'> = {}
): Promise<number> {
  const rates = await fetchExchangeRates({ ...options, baseCurrency: from });
  
  const rate = rates.rates[to];
  
  if (rate === undefined) {
    throw new ExchangeRateError(
      `Currency code not found: ${to}`,
      'unsupported-code'
    );
  }
  
  return rate;
}

/**
 * Check if exchange rate API is configured
 * @returns True if API key is configured
 */
export function isExchangeRateApiConfigured(): boolean {
  const apiKey = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY;
  return Boolean(apiKey && apiKey !== 'your_exchange_rate_api_key_here');
}

/**
 * Get supported currency codes
 * Note: This is a static list. For dynamic list, use the /codes endpoint
 * 
 * @returns Array of supported currency codes
 */
export function getSupportedCurrencies(): string[] {
  return [
    'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'NZD',
    'SEK', 'KRW', 'SGD', 'NOK', 'MXN', 'INR', 'RUB', 'ZAR', 'TRY', 'BRL',
    'TWD', 'DKK', 'PLN', 'THB', 'IDR', 'HUF', 'CZK', 'ILS', 'CLP', 'PHP',
    'AED', 'COP', 'SAR', 'MYR', 'RON', 'ARS', 'VND', 'PKR', 'EGP', 'NGN',
  ];
}
