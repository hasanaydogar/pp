'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const STORAGE_KEY = 'lastVisitedPortfolio';

/**
 * Hook to track the last visited portfolio page.
 * Automatically saves the current pathname to localStorage
 * when visiting any /p/* route.
 */
export function useLastVisitedPortfolio() {
  const pathname = usePathname();

  useEffect(() => {
    // Only save paths that start with /p/ (portfolio pages)
    if (pathname?.startsWith('/p/')) {
      try {
        localStorage.setItem(STORAGE_KEY, pathname);
      } catch (e) {
        // localStorage might be unavailable (e.g., private browsing)
        console.warn('Could not save last visited portfolio:', e);
      }
    }
  }, [pathname]);
}

/**
 * Get the last visited portfolio path from localStorage.
 * Returns null if no path is stored or if running on server.
 */
export function getLastVisitedPortfolio(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    // localStorage might be unavailable
    console.warn('Could not read last visited portfolio:', e);
    return null;
  }
}

/**
 * Clear the last visited portfolio from localStorage.
 */
export function clearLastVisitedPortfolio(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear last visited portfolio:', e);
  }
}
