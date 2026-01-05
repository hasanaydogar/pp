/**
 * Snapshot Service
 * Handles creating and managing portfolio snapshots
 */

import { formatSnapshotDate } from '@/lib/types/snapshot';

export interface SnapshotData {
  portfolioId: string;
  totalValue: number;
  assetsValue: number;
  cashValue: number;
  dailyChange?: number;
  dailyChangePercent?: number;
}

/**
 * Create or update today's portfolio snapshot
 */
export async function createSnapshot(data: SnapshotData): Promise<boolean> {
  try {
    const response = await fetch(`/api/portfolios/${data.portfolioId}/snapshots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        total_value: data.totalValue,
        assets_value: data.assetsValue,
        cash_value: data.cashValue,
        daily_change: data.dailyChange,
        daily_change_percent: data.dailyChangePercent,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to create snapshot:', error);
    return false;
  }
}

/**
 * Check if today's snapshot already exists
 */
export async function hasTodaySnapshot(portfolioId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `/api/portfolios/${portfolioId}/snapshots?period=7d&limit=1`
    );

    if (!response.ok) return false;

    const { data } = await response.json();
    if (!data || data.length === 0) return false;

    const today = formatSnapshotDate(new Date());
    return data.some((s: any) => s.snapshot_date === today);
  } catch (error) {
    console.error('Failed to check snapshot:', error);
    return false;
  }
}

/**
 * Create snapshot if it doesn't exist for today
 */
export async function ensureTodaySnapshot(data: SnapshotData): Promise<void> {
  const hasSnapshot = await hasTodaySnapshot(data.portfolioId);
  if (!hasSnapshot) {
    await createSnapshot(data);
  }
}
