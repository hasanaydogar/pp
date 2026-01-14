/**
 * Slug Utility Functions
 * 
 * Provides URL-friendly slug generation with Turkish character support.
 * Used for creating semantic URLs like /p/borsa-istanbul/doas
 */

/**
 * Creates a URL-friendly slug from a string.
 * Handles Turkish characters by converting them to ASCII equivalents.
 * 
 * @example
 * createSlug("Borsa İstanbul") // "borsa-istanbul"
 * createSlug("ABD Borsaları") // "abd-borsalari"
 * createSlug("My Portfolio 2024") // "my-portfolio-2024"
 */
export function createSlug(name: string): string {
  return name
    // Turkish uppercase conversions FIRST (before toLowerCase)
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .replace(/Ş/g, 's')
    .replace(/Ğ/g, 'g')
    .replace(/Ü/g, 'u')
    .replace(/Ö/g, 'o')
    .replace(/Ç/g, 'c')
    .toLowerCase()
    // Turkish lowercase conversions
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/ı/g, 'i')
    // Replace any non-alphanumeric characters with dashes
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading and trailing dashes
    .replace(/^-|-$/g, '');
}

/**
 * Converts a stock symbol to URL-friendly format (lowercase).
 * 
 * @example
 * symbolToUrl("DOAS") // "doas"
 * symbolToUrl("THYAO") // "thyao"
 */
export function symbolToUrl(symbol: string): string {
  return symbol.toLowerCase();
}

/**
 * Converts a URL symbol back to uppercase format for API calls.
 * 
 * @example
 * urlToSymbol("doas") // "DOAS"
 * urlToSymbol("thyao") // "THYAO"
 */
export function urlToSymbol(url: string): string {
  return url.toUpperCase();
}

/**
 * Gets the URL slug for a portfolio based on its name.
 * 
 * @example
 * getPortfolioSlug({ name: "Borsa İstanbul" }) // "borsa-istanbul"
 */
export function getPortfolioSlug(portfolio: { name: string }): string {
  return createSlug(portfolio.name);
}

/**
 * Generates the full URL path for an asset within a portfolio.
 * 
 * @example
 * getAssetUrl("borsa-istanbul", "DOAS") // "/p/borsa-istanbul/doas"
 */
export function getAssetUrl(portfolioSlug: string, symbol: string): string {
  return `/p/${portfolioSlug}/${symbolToUrl(symbol)}`;
}

/**
 * Generates the full URL path for a portfolio dashboard.
 * 
 * @example
 * getPortfolioUrl({ name: "Borsa İstanbul" }) // "/p/borsa-istanbul"
 */
export function getPortfolioUrl(portfolio: { name: string }): string {
  return `/p/${getPortfolioSlug(portfolio)}`;
}

/**
 * Checks if a slug matches a portfolio name.
 * Used for finding portfolios by URL slug.
 * 
 * @example
 * matchesSlug({ name: "Borsa İstanbul" }, "borsa-istanbul") // true
 * matchesSlug({ name: "ABD Borsaları" }, "abd-borsalari") // true
 */
export function matchesSlug(portfolio: { name: string }, slug: string): boolean {
  return getPortfolioSlug(portfolio) === slug;
}
