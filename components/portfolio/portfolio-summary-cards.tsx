'use client';

import React from 'react';
import { 
  BanknotesIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartPieIcon
} from '@heroicons/react/20/solid';
import { PolicyViolation } from '@/lib/types/policy';
import { formatCurrency } from '@/lib/utils/currency';
import clsx from 'clsx';

interface PortfolioSummaryCardsProps {
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  cashAmount: number;
  cashPercent: number;
  cashTarget: number;
  policyViolations: PolicyViolation[];
  assetCount: number;
  displayCurrency: string;
}

interface SummaryCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  valueColor?: string;
}

function SummaryCard({ title, value, subtitle, icon: Icon, iconColor, valueColor }: SummaryCardProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow dark:bg-zinc-900 sm:p-6">
      <div className="flex items-center">
        <div className={clsx(
          'flex-shrink-0 rounded-md p-3',
          iconColor || 'bg-indigo-500'
        )}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dt className="truncate text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {title}
          </dt>
          <dd className={clsx(
            'mt-1 text-2xl font-semibold tracking-tight',
            valueColor || 'text-zinc-900 dark:text-white'
          )}>
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

export function PortfolioSummaryCards({
  totalValue,
  dailyChange,
  dailyChangePercent,
  cashAmount,
  cashPercent,
  cashTarget,
  policyViolations,
  assetCount,
  displayCurrency,
}: PortfolioSummaryCardsProps) {
  const isPositiveChange = dailyChange >= 0;
  const criticalViolations = policyViolations.filter(v => v.severity === 'critical').length;
  const warningViolations = policyViolations.filter(v => v.severity === 'warning').length;
  const hasViolations = policyViolations.length > 0;
  
  // Cash status
  const cashStatus = cashPercent < 0.05 ? 'low' : cashPercent > 0.10 ? 'high' : 'ok';
  const cashDiff = cashPercent - cashTarget;
  
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Value Card */}
      <SummaryCard
        title="Toplam Değer"
        value={formatCurrency(totalValue, displayCurrency)}
        subtitle={`${assetCount} varlık`}
        icon={BanknotesIcon}
        iconColor="bg-indigo-500"
      />
      
      {/* Daily Change Card */}
      <SummaryCard
        title="Günlük Değişim"
        value={
          <span className="flex items-center gap-1">
            {isPositiveChange ? (
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
            ) : (
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
            )}
            {formatCurrency(Math.abs(dailyChange), displayCurrency)}
          </span>
        }
        subtitle={`${isPositiveChange ? '+' : ''}${dailyChangePercent.toFixed(2)}%`}
        icon={isPositiveChange ? ArrowTrendingUpIcon : ArrowTrendingDownIcon}
        iconColor={isPositiveChange ? 'bg-green-500' : 'bg-red-500'}
        valueColor={isPositiveChange ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
      />
      
      {/* Cash Status Card */}
      <SummaryCard
        title="Nakit Durumu"
        value={formatCurrency(cashAmount, displayCurrency)}
        subtitle={
          <span className={clsx(
            cashStatus === 'low' && 'text-red-600 dark:text-red-400',
            cashStatus === 'high' && 'text-amber-600 dark:text-amber-400',
            cashStatus === 'ok' && 'text-green-600 dark:text-green-400'
          )}>
            {(cashPercent * 100).toFixed(1)}% 
            {cashDiff !== 0 && (
              <span className="ml-1">
                ({cashDiff > 0 ? '+' : ''}{(cashDiff * 100).toFixed(1)}% hedef)
              </span>
            )}
          </span>
        }
        icon={CurrencyDollarIcon}
        iconColor={
          cashStatus === 'low' ? 'bg-red-500' : 
          cashStatus === 'high' ? 'bg-amber-500' : 
          'bg-green-500'
        }
      />
      
      {/* Policy Status Card */}
      <SummaryCard
        title="Policy Durumu"
        value={
          hasViolations ? (
            <span className="flex items-center gap-2">
              <ExclamationTriangleIcon className={clsx(
                'h-5 w-5',
                criticalViolations > 0 ? 'text-red-500' : 'text-amber-500'
              )} />
              {policyViolations.length} İhlal
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              Uyumlu
            </span>
          )
        }
        subtitle={
          hasViolations ? (
            <span>
              {criticalViolations > 0 && <span className="text-red-600 dark:text-red-400">{criticalViolations} kritik</span>}
              {criticalViolations > 0 && warningViolations > 0 && ', '}
              {warningViolations > 0 && <span className="text-amber-600 dark:text-amber-400">{warningViolations} uyarı</span>}
            </span>
          ) : (
            'Tüm kurallar sağlandı'
          )
        }
        icon={hasViolations ? ExclamationTriangleIcon : CheckCircleIcon}
        iconColor={
          criticalViolations > 0 ? 'bg-red-500' : 
          warningViolations > 0 ? 'bg-amber-500' : 
          'bg-green-500'
        }
      />
    </div>
  );
}
