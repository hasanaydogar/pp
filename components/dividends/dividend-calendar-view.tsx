'use client';

import React, { useState } from 'react';
import { DividendCalendarItem, UpcomingDividend } from '@/lib/types/dividend';
import { formatCurrency } from '@/lib/utils/currency';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';

interface DividendCalendarViewProps {
  byMonth: Record<string, DividendCalendarItem[]>;
  currency: string;
}

const DAYS_TR = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export function DividendCalendarView({
  byMonth,
  currency,
}: DividendCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DividendCalendarItem | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

  // Get calendar data for current month
  const monthData = byMonth[monthKey] || [];
  const dividendDates = new Set(monthData.map(d => d.date));

  // Build calendar grid
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = lastDay.getDate();

  const days: Array<{ day: number | null; date: string | null; hasDividend: boolean }> = [];
  
  // Empty cells before first day
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push({ day: null, date: null, hasDividend: false });
  }
  
  // Days of month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({
      day: d,
      date: dateStr,
      hasDividend: dividendDates.has(dateStr),
    });
  }

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (dateStr: string | null) => {
    if (!dateStr) return;
    const dayData = monthData.find(d => d.date === dateStr);
    setSelectedDay(dayData || null);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goToPrevMonth}
          className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <ChevronLeftIcon className="h-5 w-5 text-zinc-500" />
        </button>
        
        <h3 className="font-medium text-zinc-900 dark:text-white">
          {MONTHS_TR[month]} {year}
        </h3>
        
        <button
          onClick={goToNextMonth}
          className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <ChevronRightIcon className="h-5 w-5 text-zinc-500" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Header */}
        {DAYS_TR.map(day => (
          <div
            key={day}
            className="text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 py-2"
          >
            {day}
          </div>
        ))}

        {/* Days */}
        {days.map((d, i) => (
          <button
            key={i}
            onClick={() => handleDayClick(d.date)}
            disabled={!d.day}
            className={clsx(
              'relative aspect-square flex items-center justify-center text-sm rounded-lg transition-colors',
              !d.day && 'invisible',
              d.day && 'hover:bg-zinc-100 dark:hover:bg-zinc-800',
              d.date === today && 'ring-2 ring-indigo-500',
              d.hasDividend && 'font-semibold text-green-600 dark:text-green-400'
            )}
          >
            {d.day}
            {d.hasDividend && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-green-500" />
            )}
          </button>
        ))}
      </div>

      {/* Selected Day Details */}
      {selectedDay && (
        <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
          <h4 className="font-medium text-zinc-900 dark:text-white mb-2">
            {new Date(selectedDay.date).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
            })}
          </h4>
          <div className="space-y-2">
            {selectedDay.dividends.map((dividend) => (
              <div
                key={dividend.symbol}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-medium">{dividend.symbol}</span>
                <span className="text-green-600 dark:text-green-400">
                  {formatCurrency(dividend.expectedTotal, currency)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700 flex justify-between text-sm font-medium">
            <span>Toplam</span>
            <span className="text-green-600 dark:text-green-400">
              {formatCurrency(selectedDay.totalExpected, currency)}
            </span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span>Temettü günü</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 ring-2 ring-indigo-500 rounded" />
          <span>Bugün</span>
        </div>
      </div>
    </div>
  );
}
