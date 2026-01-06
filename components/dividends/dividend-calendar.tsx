'use client';

import React from 'react';
import { DividendByMonth } from '@/lib/types/dividend';
import { formatCurrency } from '@/lib/utils/currency';
import { CalendarDaysIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';

interface DividendCalendarProps {
  byMonth: DividendByMonth[];
  currency: string;
}

const MONTH_NAMES: Record<string, string> = {
  '01': 'Ocak',
  '02': 'Şubat',
  '03': 'Mart',
  '04': 'Nisan',
  '05': 'Mayıs',
  '06': 'Haziran',
  '07': 'Temmuz',
  '08': 'Ağustos',
  '09': 'Eylül',
  '10': 'Ekim',
  '11': 'Kasım',
  '12': 'Aralık',
};

function getMonthName(monthStr: string): string {
  const month = monthStr.split('-')[1];
  return MONTH_NAMES[month] || monthStr;
}

export function DividendCalendar({
  byMonth,
  currency,
}: DividendCalendarProps) {
  if (byMonth.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
        <CalendarDaysIcon className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-600" />
        <p className="mt-2">Henüz temettü kaydı yok</p>
      </div>
    );
  }

  // Get max amount for relative bar sizing
  const maxAmount = Math.max(...byMonth.map(m => m.amount));

  return (
    <div className="space-y-3">
      {byMonth.map((month) => {
        const barWidth = (month.amount / maxAmount) * 100;
        
        return (
          <div key={month.month} className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-zinc-900 dark:text-white">
                {getMonthName(month.month)}
              </span>
              <span className="text-sm font-semibold text-zinc-900 dark:text-white tabular-nums">
                {formatCurrency(month.amount, currency)}
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${barWidth}%` }}
              />
            </div>
            
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {month.count} temettü
            </span>
          </div>
        );
      })}
    </div>
  );
}
