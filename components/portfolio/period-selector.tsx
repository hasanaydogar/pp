'use client';

import React from 'react';
import { Period, PERIOD_LABELS } from '@/lib/types/snapshot';
import clsx from 'clsx';

interface PeriodSelectorProps {
  value: Period;
  onChange: (period: Period) => void;
  size?: 'sm' | 'md';
}

const PERIODS: Period[] = ['7d', '30d', '90d', '365d', 'all'];

export function PeriodSelector({
  value,
  onChange,
  size = 'md',
}: PeriodSelectorProps) {
  const sizeClasses = size === 'sm'
    ? 'px-2 py-1 text-xs'
    : 'px-3 py-1.5 text-sm';

  return (
    <div className="inline-flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-1 gap-1">
      {PERIODS.map((period) => (
        <button
          key={period}
          onClick={() => onChange(period)}
          className={clsx(
            'rounded-md font-medium transition-colors',
            sizeClasses,
            value === period
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          )}
        >
          {PERIOD_LABELS[period]}
        </button>
      ))}
    </div>
  );
}
