'use client';

import React from 'react';
import { PositionCategory, PositionCategoryLabels } from '@/lib/types/sector';
import { ExclamationTriangleIcon } from '@heroicons/react/16/solid';
import clsx from 'clsx';

interface PositionCategoryBadgeProps {
  category: PositionCategory;
  isOverWeight?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

const categoryStyles: Record<PositionCategory, string> = {
  [PositionCategory.CORE]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  [PositionCategory.SATELLITE]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  [PositionCategory.NEW]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const categoryShortLabels: Record<PositionCategory, string> = {
  [PositionCategory.CORE]: 'Ana',
  [PositionCategory.SATELLITE]: 'Uydu',
  [PositionCategory.NEW]: 'Yeni',
};

export function PositionCategoryBadge({
  category,
  isOverWeight = false,
  showLabel = true,
  size = 'sm',
}: PositionCategoryBadgeProps) {
  const label = showLabel ? categoryShortLabels[category] : categoryShortLabels[category].charAt(0);
  
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className={clsx(
          'inline-flex items-center rounded-full font-medium',
          size === 'sm' && 'px-2 py-0.5 text-xs',
          size === 'md' && 'px-2.5 py-1 text-sm',
          categoryStyles[category]
        )}
      >
        {label}
      </span>
      {isOverWeight && (
        <span 
          className={clsx(
            'inline-flex items-center rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            size === 'sm' && 'px-1.5 py-0.5',
            size === 'md' && 'px-2 py-1'
          )}
          title="Ağırlık limiti aşıldı"
        >
          <ExclamationTriangleIcon className={clsx(
            size === 'sm' && 'h-3 w-3',
            size === 'md' && 'h-4 w-4'
          )} />
        </span>
      )}
    </span>
  );
}
