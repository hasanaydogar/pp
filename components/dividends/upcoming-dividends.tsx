'use client';

import React, { useState } from 'react';
import { UpcomingDividend } from '@/lib/types/dividend';
import { formatCurrency } from '@/lib/utils/currency';
import { CalendarDaysIcon, StarIcon, TrashIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';

interface UpcomingDividendsProps {
  dividends: UpcomingDividend[];
  currency: string;
  maxItems?: number;
  onViewAll?: () => void;
  onDeleteForecast?: (dividendId: string) => Promise<void>;
}

export function UpcomingDividends({
  dividends,
  currency,
  maxItems = 5,
  onViewAll,
  onDeleteForecast,
}: UpcomingDividendsProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const displayItems = dividends.slice(0, maxItems);
  const hasMore = dividends.length > maxItems;

  const handleDelete = async (dividend: UpcomingDividend) => {
    if (!onDeleteForecast) return;
    
    // Need dividend ID from the database - check if it exists
    const dividendId = (dividend as any).id;
    if (!dividendId) {
      console.error('Dividend ID not found for deletion');
      return;
    }

    if (!confirm(`${dividend.symbol} için beklentiyi silmek istediğinize emin misiniz?`)) {
      return;
    }

    setDeletingId(dividendId);
    try {
      await onDeleteForecast(dividendId);
    } finally {
      setDeletingId(null);
    }
  };

  if (dividends.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
        <CalendarDaysIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Önümüzdeki 90 günde temettü beklenmemektedir</p>
      </div>
    );
  }

  // Debug: Log dividend data to check isForecast and source
  console.log('[UpcomingDividends] dividends:', displayItems.map(d => ({
    symbol: d.symbol,
    id: d.id,
    isForecast: d.isForecast,
    source: d.source,
    expectedTotal: d.expectedTotal,
  })));

  return (
    <div className="space-y-3">
      {displayItems.map((dividend, index) => {
        // Check multiple conditions for forecast identification
        const isForecast = dividend.isForecast === true || dividend.source === 'MANUAL_FORECAST';
        // Manual dividends can also be deleted (source contains MANUAL)
        const isManual = dividend.source?.includes('MANUAL') || dividend.id;
        // Any dividend with an ID from database can be deleted if it's a forecast or manual
        const canDelete = (isForecast || isManual) && !!dividend.id && !!onDeleteForecast;
        
        return (
          <div
            key={`${dividend.symbol}-${dividend.exDividendDate}-${dividend.source || 'default'}`}
            className={clsx(
              'flex items-center justify-between py-3',
              index !== displayItems.length - 1 && 'border-b border-zinc-100 dark:border-zinc-800',
              isForecast && 'bg-indigo-50/50 dark:bg-indigo-900/10 -mx-2 px-2 rounded-lg'
            )}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-zinc-900 dark:text-white">
                  {dividend.symbol}
                </span>
                {isForecast && (
                  <span className="inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                    <StarIcon className="h-3 w-3" />
                    Beklenti
                  </span>
                )}
                <span className={clsx(
                  'text-xs px-1.5 py-0.5 rounded',
                  dividend.daysUntil <= 7 
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                )}>
                  {dividend.daysUntil === 0 
                    ? 'Bugün' 
                    : dividend.daysUntil === 1 
                      ? 'Yarın'
                      : `${dividend.daysUntil} gün`}
                </span>
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                {new Date(dividend.exDividendDate).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'short',
                })}
                {dividend.dividendPerShare > 0 && (
                  <>
                    <span className="mx-1">•</span>
                    {formatCurrency(dividend.dividendPerShare, currency)}/hisse × {dividend.quantity}
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className={clsx(
                  'font-semibold',
                  isForecast 
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-green-600 dark:text-green-400'
                )}>
                  {formatCurrency(dividend.expectedTotal, currency)}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {isForecast ? 'tahmini' : 'beklenen'}
                </div>
              </div>
              
              {/* Delete button for forecasts - show for any dividend with ID that is a forecast */}
              {canDelete && (
                <button
                  onClick={() => handleDelete(dividend)}
                  disabled={deletingId === dividend.id}
                  className={clsx(
                    'p-1.5 rounded-md transition-colors',
                    'text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20',
                    deletingId === dividend.id && 'opacity-50 cursor-not-allowed'
                  )}
                  title="Beklentiyi Sil"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}

      {hasMore && onViewAll && (
        <button
          onClick={onViewAll}
          className="w-full text-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 py-2"
        >
          Tümünü Gör ({dividends.length - maxItems} daha)
        </button>
      )}
    </div>
  );
}
