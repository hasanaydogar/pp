'use client';

import React from 'react';
import { ChevronUpIcon, ChevronDownIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { SortColumn, SortDirection } from '@/lib/types/asset-metrics';
import clsx from 'clsx';

interface SortableTableHeaderProps {
  column: SortColumn;
  currentSort: SortColumn;
  direction: SortDirection;
  onSort: (column: SortColumn) => void;
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

export function SortableTableHeader({
  column,
  currentSort,
  direction,
  onSort,
  children,
  className,
  align = 'left',
}: SortableTableHeaderProps) {
  const isActive = currentSort === column;
  
  return (
    <th
      scope="col"
      className={clsx(
        'py-2 px-3 text-xs font-medium uppercase tracking-wider cursor-pointer select-none',
        'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200',
        'transition-colors duration-150',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        isActive && 'text-indigo-600 dark:text-indigo-400',
        className
      )}
      onClick={() => onSort(column)}
    >
      <div className={clsx(
        'inline-flex items-center gap-1',
        align === 'right' && 'flex-row-reverse'
      )}>
        <span>{children}</span>
        <span className="flex-shrink-0">
          {isActive ? (
            direction === 'asc' ? (
              <ChevronUpIcon className="h-4 w-4" />
            ) : (
              <ChevronDownIcon className="h-4 w-4" />
            )
          ) : (
            <ChevronUpDownIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
          )}
        </span>
      </div>
    </th>
  );
}

interface NonSortableTableHeaderProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

export function NonSortableTableHeader({
  children,
  className,
  align = 'left',
}: NonSortableTableHeaderProps) {
  return (
    <th
      scope="col"
      className={clsx(
        'py-2 px-3 text-xs font-medium uppercase tracking-wider',
        'text-zinc-500 dark:text-zinc-400',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className
      )}
    >
      {children}
    </th>
  );
}
