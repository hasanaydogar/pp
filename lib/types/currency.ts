/**
 * Currency types and utilities
 */

/**
 * Supported currency codes
 * ISO 4217 currency codes
 */
export enum Currency {
  USD = 'USD', // US Dollar
  TRY = 'TRY', // Turkish Lira
  EUR = 'EUR', // Euro
  GBP = 'GBP', // British Pound
  JPY = 'JPY', // Japanese Yen
  CNY = 'CNY', // Chinese Yuan
  CHF = 'CHF', // Swiss Franc
  CAD = 'CAD', // Canadian Dollar
  AUD = 'AUD', // Australian Dollar
  NZD = 'NZD', // New Zealand Dollar
  SEK = 'SEK', // Swedish Krona
  NOK = 'NOK', // Norwegian Krone
  DKK = 'DKK', // Danish Krone
  PLN = 'PLN', // Polish Zloty
  HUF = 'HUF', // Hungarian Forint
  CZK = 'CZK', // Czech Koruna
  RUB = 'RUB', // Russian Ruble
  INR = 'INR', // Indian Rupee
  BRL = 'BRL', // Brazilian Real
  MXN = 'MXN', // Mexican Peso
  ZAR = 'ZAR', // South African Rand
  KRW = 'KRW', // South Korean Won
  SGD = 'SGD', // Singapore Dollar
  HKD = 'HKD', // Hong Kong Dollar
}

/**
 * Default currency
 */
export const DEFAULT_CURRENCY = Currency.USD;

/**
 * List of all supported currencies
 */
export const SUPPORTED_CURRENCIES = Object.values(Currency);

/**
 * Validates if a string is a supported currency code
 * @param currency Currency code to validate
 * @returns True if valid, false otherwise
 */
export function isValidCurrency(currency: string): boolean {
  return SUPPORTED_CURRENCIES.includes(currency as Currency);
}

/**
 * Validates currency and throws error if invalid
 * @param currency Currency code to validate
 * @throws Error if currency is not supported
 */
export function validateCurrency(currency: string): void {
  if (!isValidCurrency(currency)) {
    throw new Error(
      `Unsupported currency: ${currency}. Supported currencies: ${SUPPORTED_CURRENCIES.join(', ')}`,
    );
  }
}

