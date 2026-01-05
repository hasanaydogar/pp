'use client';

import React from 'react';
import { 
  BanknotesIcon, 
  CalendarDaysIcon,
  ChartBarIcon,
} from '@heroicons/react/20/solid';
import { formatCurrency } from '@/lib/utils/currency';
import clsx from 'clsx';

interface CashSummaryCardsProps {
  cashBalance: number;
  monthlyDividend: number;
  yearlyDividend: number;
  dividendYield?: number;
  displayCurrency: string;
}

interface SummaryCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}

function SummaryCard({ title, value, subtitle, icon: Icon, iconColor }: SummaryCardProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow dark:bg-zinc-900 sm:p-6">
      <div className="flex items-center">
        <div className={clsx('flex-shrink-0 rounded-md p-3', iconColor)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dt className="truncate text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {title}
          </dt>
          <dd className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            {value}
          </dd>
          {subtitle && (
            <dd className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {subtitle}
            </dd>
          )}
        </div>
      </div>
    </div>
  );
}

export function CashSummaryCards({
  cashBalance,
  monthlyDividend,
  yearlyDividend,
  dividendYield = 0,
  displayCurrency,
}: CashSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Cash Balance */}
      <SummaryCard
        title="Nakit Bakiyesi"
        value={formatCurrency(cashBalance, displayCurrency)}
        subtitle="Kullanılabilir nakit"
        icon={BanknotesIcon}
        iconColor="bg-green-500"
      />
      
      {/* Monthly Dividend */}
      <SummaryCard
        title="Aylık Temettü"
        value={formatCurrency(monthlyDividend, displayCurrency)}
        subtitle="Bu ay alınan"
        icon={CalendarDaysIcon}
        iconColor="bg-blue-500"
      />
      
      {/* Yearly Dividend */}
      <SummaryCard
        title="Yıllık Temettü"
        value={formatCurrency(yearlyDividend, displayCurrency)}
        subtitle={dividendYield > 0 ? `Verim: %${dividendYield.toFixed(2)}` : 'Bu yıl toplam'}
        icon={ChartBarIcon}
        iconColor="bg-purple-500"
      />
    </div>
  );
}
