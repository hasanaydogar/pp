'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils/currency';
import { CashFlowSummary } from '@/lib/hooks/use-cash-flow';
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
} from '@heroicons/react/20/solid';
import clsx from 'clsx';

interface CashSummaryCardsProps {
  currentBalance: number;
  summary: CashFlowSummary | null;
  expectedDividend90Days: number;
  currency: string;
  periodLabel?: string;
}

interface SummaryCardProps {
  title: string;
  value: number;
  currency: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'positive' | 'negative' | 'neutral';
}

function SummaryCard({
  title,
  value,
  currency,
  subtitle,
  icon,
  trend = 'neutral',
}: SummaryCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-sm border border-zinc-200 dark:border-zinc-700">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">{title}</span>
        <div className={clsx(
          'p-1.5 rounded-lg',
          trend === 'positive' && 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
          trend === 'negative' && 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
          trend === 'neutral' && 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
        )}>
          {icon}
        </div>
      </div>
      
      <div className={clsx(
        'text-xl font-semibold',
        trend === 'positive' && 'text-green-600 dark:text-green-400',
        trend === 'negative' && 'text-red-600 dark:text-red-400',
        trend === 'neutral' && 'text-zinc-900 dark:text-white'
      )}>
        {trend === 'positive' && value > 0 && '+'}
        {formatCurrency(value, currency)}
      </div>
      
      {subtitle && (
        <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          {subtitle}
        </div>
      )}
    </div>
  );
}

export function CashSummaryCards({
  currentBalance,
  summary,
  expectedDividend90Days,
  currency,
  periodLabel = 'Dönem',
}: CashSummaryCardsProps) {
  const netChange = summary?.netChange || 0;
  const totalDividends = summary?.totalDividends || 0;
  const totalPurchases = summary?.totalPurchases || 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Current Balance */}
      <SummaryCard
        title="Mevcut Nakit"
        value={currentBalance}
        currency={currency}
        icon={<BanknotesIcon className="h-4 w-4" />}
        trend="neutral"
      />

      {/* Net Change */}
      <SummaryCard
        title={`${periodLabel} Değişimi`}
        value={netChange}
        currency={currency}
        subtitle={summary ? `${formatCurrency(summary.startBalance, currency)} → ${formatCurrency(summary.endBalance, currency)}` : undefined}
        icon={netChange >= 0 
          ? <ArrowTrendingUpIcon className="h-4 w-4" />
          : <ArrowTrendingDownIcon className="h-4 w-4" />
        }
        trend={netChange > 0 ? 'positive' : netChange < 0 ? 'negative' : 'neutral'}
      />

      {/* Total Dividends */}
      <SummaryCard
        title={`${periodLabel} Temettü`}
        value={totalDividends}
        currency={currency}
        subtitle={totalPurchases > 0 ? `Alım: ${formatCurrency(totalPurchases, currency)}` : undefined}
        icon={<ArrowTrendingUpIcon className="h-4 w-4" />}
        trend={totalDividends > 0 ? 'positive' : 'neutral'}
      />

      {/* Expected Dividends */}
      <SummaryCard
        title="Beklenen Temettü"
        value={expectedDividend90Days}
        currency={currency}
        subtitle="90 gün içinde"
        icon={<CalendarIcon className="h-4 w-4" />}
        trend={expectedDividend90Days > 0 ? 'positive' : 'neutral'}
      />
    </div>
  );
}
