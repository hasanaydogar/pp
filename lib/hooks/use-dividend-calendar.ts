'use client';

import { useState, useEffect, useCallback } from 'react';
import { UpcomingDividend, DividendCalendarItem, DividendCalendarResponse } from '@/lib/types/dividend';

// ============================================================================
// TYPES
// ============================================================================

interface UseDividendCalendarResult {
  upcoming: UpcomingDividend[];
  byMonth: Record<string, DividendCalendarItem[]>;
  totalExpected90Days: number;
  totalExpectedYearly: number;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useDividendCalendar(
  portfolioId: string | null
): UseDividendCalendarResult {
  const [upcoming, setUpcoming] = useState<UpcomingDividend[]>([]);
  const [byMonth, setByMonth] = useState<Record<string, DividendCalendarItem[]>>({});
  const [totalExpected90Days, setTotalExpected90Days] = useState(0);
  const [totalExpectedYearly, setTotalExpectedYearly] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCalendar = useCallback(async () => {
    if (!portfolioId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/dividends/calendar?portfolioId=${portfolioId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch dividend calendar');
      }

      const result = await response.json();
      const data: DividendCalendarResponse = result.data;

      setUpcoming(data.upcoming || []);
      setByMonth(data.byMonth || {});
      setTotalExpected90Days(data.totalExpected90Days || 0);
      setTotalExpectedYearly(data.totalExpectedYearly || 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [portfolioId]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  return {
    upcoming,
    byMonth,
    totalExpected90Days,
    totalExpectedYearly,
    loading,
    error,
    refetch: fetchCalendar,
  };
}
