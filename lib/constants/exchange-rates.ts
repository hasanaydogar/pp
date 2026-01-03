/**
 * Static Exchange Rates Fallback
 * 
 * These rates are used as a fallback when the exchange rate API is unavailable.
 * Rates are based on USD as the base currency.
 * 
 * **IMPORTANT**: Update these rates monthly to ensure accuracy.
 * Last Updated: 2025-01-02
 * Source: ExchangeRate-API (https://www.exchangerate-api.com/)
 */

export const STATIC_EXCHANGE_RATES = {
  base: 'USD' as const,
  lastUpdated: '2025-01-02',
  rates: {
    // Major Currencies
    USD: 1.0,
    EUR: 0.91,
    GBP: 0.79,
    JPY: 144.5,
    CHF: 0.85,
    CAD: 1.35,
    AUD: 1.45,
    NZD: 1.58,
    
    // Asian Currencies
    CNY: 7.12,
    HKD: 7.82,
    SGD: 1.33,
    KRW: 1305.0,
    INR: 83.0,
    THB: 34.5,
    MYR: 4.58,
    IDR: 15650.0,
    PHP: 55.5,
    VND: 24350.0,
    
    // European Currencies
    SEK: 10.25,
    NOK: 10.45,
    DKK: 6.78,
    PLN: 3.95,
    CZK: 22.5,
    HUF: 355.0,
    RON: 4.52,
    BGN: 1.78,
    HRK: 6.85,
    
    // Middle East & Africa
    TRY: 32.5,
    SAR: 3.75,
    AED: 3.67,
    ILS: 3.65,
    EGP: 30.8,
    ZAR: 18.5,
    NGN: 850.0,
    KES: 128.0,
    
    // Latin America
    BRL: 4.95,
    MXN: 17.2,
    ARS: 350.5,
    CLP: 920.0,
    COP: 3950.0,
    PEN: 3.72,
    
    // Other
    RUB: 92.0,
    UAH: 38.5,
  } as const,
};

/**
 * Get a fallback exchange rate for a given currency
 * @param currency - The currency code (e.g., 'EUR', 'TRY')
 * @returns The exchange rate relative to USD, or 1.0 if not found
 */
export function getFallbackRate(currency: string): number {
  return STATIC_EXCHANGE_RATES.rates[currency as keyof typeof STATIC_EXCHANGE_RATES.rates] ?? 1.0;
}

/**
 * Check if static rates are stale (older than 60 days)
 * @returns true if rates should be updated
 */
export function areStaticRatesStale(): boolean {
  const lastUpdate = new Date(STATIC_EXCHANGE_RATES.lastUpdated);
  const now = new Date();
  const daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
  return daysSinceUpdate > 60;
}

/**
 * Get a warning message if static rates are being used
 * @returns Warning message for UI display
 */
export function getStaticRatesWarning(): string {
  const isStale = areStaticRatesStale();
  const lastUpdate = STATIC_EXCHANGE_RATES.lastUpdated;
  
  if (isStale) {
    return `⚠️ Using static exchange rates (last updated: ${lastUpdate}). Rates may be outdated.`;
  }
  
  return `ℹ️ Using static exchange rates (last updated: ${lastUpdate}). Live rates unavailable.`;
}
