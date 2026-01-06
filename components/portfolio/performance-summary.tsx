'use client';

import React from 'react';
import { PerformanceSummary as PerformanceSummaryType, Period, PERIOD_LABELS } from '@/lib/types/snapshot';
import { formatCurrency } from '@/lib/utils/currency';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, CalendarDaysIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';

interface PerformanceSummaryProps {
  summary: PerformanceSummaryType | null;
  todayChange?: number;
  todayChangePercent?: number;
  period: Period;
  currency: string;
}

export function PerformanceSummary({
  summary,
  todayChange = 0,
  todayChangePercent = 0,
  period,
  currency,
}: PerformanceSummaryProps) {
  const isPositiveToday = todayChange >= 0;
  const isPositivePeriod = (summary?.totalChange || 0) >= 0;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {/* Today's Change */}
      <div className="rounded-lg bg-white dark:bg-zinc-800 p-4 shadow-sm border border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-1">
          <CalendarDaysIcon className="h-4 w-4" />
          <span>Bugün</span>
        </div>
        <div className={clsx(
          'text-lg font-semibold tabular-nums',
          isPositiveToday ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        )}>
          {isPositiveToday ? '+' : ''}{formatCurrency(todayChange, currency)}
        </div>
        <div className={clsx(
          'text-sm tabular-nums',
          isPositiveToday ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        )}>
          {isPositiveToday ? '+' : ''}{todayChangePercent.toFixed(2)}%
        </div>
      </div>

      {/* Period Change */}
      <div className="rounded-lg bg-white dark:bg-zinc-800 p-4 shadow-sm border border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-1">
          {isPositivePeriod ? (
            <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
          )}
          <span>{PERIOD_LABELS[period]}</span>
        </div>
        <div className={clsx(
          'text-lg font-semibold tabular-nums',
          isPositivePeriod ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        )}>
          {isPositivePeriod ? '+' : ''}{formatCurrency(summary?.totalChange || 0, currency)}
        </div>
        <div className={clsx(
          'text-sm tabular-nums',
          isPositivePeriod ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        )}>
          {isPositivePeriod ? '+' : ''}{(summary?.totalChangePercent || 0).toFixed(2)}%
        </div>
      </div>

      {/* Best Day */}
      {summary?.bestDay && (
        <div className="rounded-lg bg-white dark:bg-zinc-800 p-4 shadow-sm border border-zinc-200 dark:border-zinc-700">
          <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
            En İyi Gün
          </div>
          <div className="text-lg font-semibold text-green-600 dark:text-green-400 tabular-nums">
            +{formatCurrency(summary.bestDay.change, currency)}
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            {new Date(summary.bestDay.date).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'short',
            })}
          </div>
        </div>
      )}

      {/* Worst Day */}
      {summary?.worstDay && (
        <div className="rounded-lg bg-white dark:bg-zinc-800 p-4 shadow-sm border border-zinc-200 dark:border-zinc-700">
          <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
            En Kötü Gün
          </div>
          <div className="text-lg font-semibold text-red-600 dark:text-red-400 tabular-nums">
            {formatCurrency(summary.worstDay.change, currency)}
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            {new Date(summary.worstDay.date).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'short',
            })}
          </div>
        </div>
      )}
    </div>
  );
}
