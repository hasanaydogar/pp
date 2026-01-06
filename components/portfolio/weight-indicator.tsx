'use client';

import React from 'react';
import { ExclamationTriangleIcon, ArrowUpIcon } from '@heroicons/react/16/solid';
import clsx from 'clsx';

interface WeightIndicatorProps {
  weight: number;
  maxWeight: number;
  showWarning?: boolean;
  isTopPosition?: boolean;
  size?: 'sm' | 'md';
}

export function WeightIndicator({
  weight,
  maxWeight,
  showWarning = true,
  isTopPosition = false,
  size = 'sm',
}: WeightIndicatorProps) {
  const isOverWeight = weight > maxWeight;
  const percentage = (weight * 100).toFixed(1);
  
  return (
    <span 
      className={clsx(
        'inline-flex items-center gap-1',
        isOverWeight && 'text-red-600 dark:text-red-400',
        !isOverWeight && 'text-zinc-900 dark:text-white',
        size === 'sm' && 'text-sm',
        size === 'md' && 'text-base'
      )}
    >
      {isTopPosition && (
        <ArrowUpIcon className={clsx(
          'text-indigo-500',
          size === 'sm' && 'h-3 w-3',
          size === 'md' && 'h-4 w-4'
        )} />
      )}
      <span className="font-medium tabular-nums">{percentage}%</span>
      {showWarning && isOverWeight && (
        <ExclamationTriangleIcon 
          className={clsx(
            'text-red-500',
            size === 'sm' && 'h-4 w-4',
            size === 'md' && 'h-5 w-5'
          )} 
          title={`Maksimum ağırlık ${(maxWeight * 100).toFixed(0)}% aşıldı`}
        />
      )}
    </span>
  );
}

interface WeightBarProps {
  weight: number;
  maxWeight: number;
  height?: number;
}

export function WeightBar({ weight, maxWeight, height = 4 }: WeightBarProps) {
  const isOverWeight = weight > maxWeight;
  // Cap at 100% for display
  const displayPercent = Math.min(weight * 100, 100);
  const maxPercent = maxWeight * 100;
  
  return (
    <div 
      className="relative w-full rounded-full bg-zinc-200 dark:bg-zinc-700"
      style={{ height }}
    >
      {/* Max weight marker */}
      <div 
        className="absolute top-0 bottom-0 w-0.5 bg-zinc-400 dark:bg-zinc-500"
        style={{ left: `${maxPercent}%` }}
      />
      {/* Current weight bar */}
      <div
        className={clsx(
          'absolute top-0 left-0 bottom-0 rounded-full transition-all duration-300',
          isOverWeight ? 'bg-red-500' : 'bg-indigo-500'
        )}
        style={{ width: `${displayPercent}%` }}
      />
    </div>
  );
}
