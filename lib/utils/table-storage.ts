import { TablePreferences, ColumnConfig } from '@/lib/types/table-columns';
import { PREFERENCES_VERSION } from '@/lib/config/default-columns';

const STORAGE_KEY_PREFIX = 'table-prefs-';

/**
 * Generate localStorage key for a portfolio
 */
export function getStorageKey(portfolioId: string): string {
  return `${STORAGE_KEY_PREFIX}${portfolioId}`;
}

/**
 * Load table preferences from localStorage
 * Returns null if not found or invalid
 */
export function loadPreferences(portfolioId: string): TablePreferences | null {
  if (typeof window === 'undefined') return null;

  try {
    const key = getStorageKey(portfolioId);
    const stored = localStorage.getItem(key);

    if (!stored) return null;

    const prefs = JSON.parse(stored) as TablePreferences;

    // Version check for future migration support
    if (prefs.version !== PREFERENCES_VERSION) {
      // In future, migrate here instead of returning null
      console.log(`Table preferences version mismatch: ${prefs.version} !== ${PREFERENCES_VERSION}`);
      return null;
    }

    // Validate structure
    if (!prefs.columns || !Array.isArray(prefs.columns)) {
      return null;
    }

    return prefs;
  } catch (error) {
    console.error('Failed to load table preferences:', error);
    return null;
  }
}

/**
 * Save table preferences to localStorage
 */
export function savePreferences(portfolioId: string, columns: ColumnConfig[]): void {
  if (typeof window === 'undefined') return;

  try {
    const prefs: TablePreferences = {
      version: PREFERENCES_VERSION,
      portfolioId,
      columns,
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem(getStorageKey(portfolioId), JSON.stringify(prefs));
  } catch (error) {
    console.error('Failed to save table preferences:', error);
  }
}

/**
 * Clear table preferences from localStorage
 */
export function clearPreferences(portfolioId: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(getStorageKey(portfolioId));
  } catch (error) {
    console.error('Failed to clear table preferences:', error);
  }
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}
