'use client';

import React from 'react';
import { Period, formatPeriodLabel, getPeriodOptions } from '@/lib/utils/period';
import { Select } from '@/components/ui/select';
import { CalendarDaysIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';

interface PeriodPickerProps {
  value: Period;
  onChange: (period: Period) => void;
  className?: string;
  showIcon?: boolean;
}

export function PeriodPicker({
  value,
  onChange,
  className,
  showIcon = true,
}: PeriodPickerProps) {
  const options = getPeriodOptions();

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      {showIcon && (
        <CalendarDaysIcon className="h-5 w-5 text-zinc-400" />
      )}
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as Period)}
        className="min-w-[140px]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

/**
 * Compact version for inline usage
 */
export function PeriodPickerInline({
  value,
  onChange,
  className,
}: Omit<PeriodPickerProps, 'showIcon'>) {
  const options = getPeriodOptions();

  return (
    <div className={clsx('inline-flex items-center gap-1.5 text-sm', className)}>
      <span className="text-zinc-500 dark:text-zinc-400">Dönem:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Period)}
        className="bg-transparent border-none text-zinc-900 dark:text-white font-medium cursor-pointer focus:outline-none focus:ring-0 pr-6"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Button group version
 */
export function PeriodPickerButtons({
  value,
  onChange,
  className,
  compact = false,
}: PeriodPickerProps & { compact?: boolean }) {
  const options = compact 
    ? getPeriodOptions().filter(o => ['7d', '30d', '90d', 'year'].includes(o.value))
    : getPeriodOptions();

  return (
    <div className={clsx('inline-flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-1', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={clsx(
            'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
            value === option.value
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          )}
        >
          {compact ? option.value.toUpperCase() : option.label}
        </button>
      ))}
    </div>
  );
}
