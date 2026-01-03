/**
 * Symbol Mapper Utility
 * Maps asset symbols to Yahoo Finance format based on currency/exchange
 */

// Currency to Yahoo Finance suffix mapping
const CURRENCY_SUFFIX_MAP: Record<string, string> = {
  TRY: '.IS', // Borsa Istanbul
  EUR: '.DE', // Frankfurt (default for EUR)
  GBP: '.L', // London Stock Exchange
  JPY: '.T', // Tokyo Stock Exchange
  HKD: '.HK', // Hong Kong Stock Exchange
  AUD: '.AX', // Australian Stock Exchange
  CAD: '.TO', // Toronto Stock Exchange
  CHF: '.SW', // Swiss Exchange
  // USD has no suffix (default)
};

/**
 * Map an asset symbol to Yahoo Finance format
 * @param symbol - The asset symbol (e.g., "THYAO", "AAPL")
 * @param currency - The asset currency (e.g., "TRY", "USD")
 * @returns Yahoo Finance symbol (e.g., "THYAO.IS", "AAPL")
 */
export function mapSymbolForYahoo(symbol: string, currency: string): string {
  const cleanSymbol = symbol.toUpperCase().trim();
  const suffix = CURRENCY_SUFFIX_MAP[currency.toUpperCase()] || '';
  return `${cleanSymbol}${suffix}`;
}

/**
 * Check if a stock is traded on Borsa Istanbul
 */
export function isBISTStock(currency: string): boolean {
  return currency.toUpperCase() === 'TRY';
}

/**
 * Get the exchange name from currency
 */
export function getExchangeName(currency: string): string {
  const exchangeNames: Record<string, string> = {
    TRY: 'Borsa Istanbul',
    USD: 'NYSE/NASDAQ',
    EUR: 'Frankfurt',
    GBP: 'London',
    JPY: 'Tokyo',
    HKD: 'Hong Kong',
  };
  return exchangeNames[currency.toUpperCase()] || 'Unknown';
}
