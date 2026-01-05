'use client';

import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/20/solid';
import { formatCurrency } from '@/lib/utils/currency';
import clsx from 'clsx';

interface DailyChangeColumnProps {
  changePercent: number;
  changeAmount?: number;
  currency?: string;
  previousClose?: number;
  showAmount?: boolean;
  size?: 'sm' | 'md';
}

export function DailyChangeColumn({
  changePercent,
  changeAmount = 0,
  currency = 'TRY',
  previousClose,
  showAmount = false,
  size = 'md',
}: DailyChangeColumnProps) {
  const isPositive = changePercent > 0;
  const isNegative = changePercent < 0;
  const isNeutral = changePercent === 0;

  const Icon = isPositive ? ArrowUpIcon : isNegative ? ArrowDownIcon : MinusIcon;
  
  const colorClass = isPositive
    ? 'text-green-600 dark:text-green-400'
    : isNegative
      ? 'text-red-600 dark:text-red-400'
      : 'text-zinc-500 dark:text-zinc-400';

  const bgClass = isPositive
    ? 'bg-green-50 dark:bg-green-900/20'
    : isNegative
      ? 'bg-red-50 dark:bg-red-900/20'
      : 'bg-zinc-50 dark:bg-zinc-800/50';

  const sizeClasses = size === 'sm' 
    ? 'text-xs px-1.5 py-0.5'
    : 'text-sm px-2 py-1';

  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <div className="flex flex-col items-end gap-0.5">
      {/* Percentage with icon */}
      <span
        className={clsx(
          'inline-flex items-center gap-0.5 rounded font-medium tabular-nums',
          colorClass,
          bgClass,
          sizeClasses
        )}
        title={previousClose ? `Önceki kapanış: ${formatCurrency(previousClose, currency)}` : undefined}
      >
        <Icon className={iconSize} />
        <span>{isPositive ? '+' : ''}{changePercent.toFixed(2)}%</span>
      </span>
      
      {/* Amount (optional) */}
      {showAmount && changeAmount !== 0 && (
        <span className={clsx('text-xs tabular-nums', colorClass)}>
          {isPositive ? '+' : ''}{formatCurrency(changeAmount, currency)}
        </span>
      )}
    </div>
  );
}

// Simpler inline version for tight spaces
export function DailyChangeInline({
  changePercent,
  size = 'sm',
}: {
  changePercent: number;
  size?: 'sm' | 'md';
}) {
  const isPositive = changePercent > 0;
  const isNegative = changePercent < 0;

  const colorClass = isPositive
    ? 'text-green-600 dark:text-green-400'
    : isNegative
      ? 'text-red-600 dark:text-red-400'
      : 'text-zinc-500 dark:text-zinc-400';

  const Icon = isPositive ? ArrowUpIcon : isNegative ? ArrowDownIcon : MinusIcon;
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <span className={clsx('inline-flex items-center gap-0.5 tabular-nums', colorClass)}>
      <Icon className={iconSize} />
      <span className={size === 'sm' ? 'text-xs' : 'text-sm'}>
        {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
      </span>
    </span>
  );
}
