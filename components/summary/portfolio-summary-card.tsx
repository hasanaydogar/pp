'use client';

import React from 'react';
import Link from 'next/link';
import { PortfolioSummary, PortfolioWithExtras } from '@/lib/api/summary';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/currency';
import { createSlug } from '@/lib/utils/slug';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface PortfolioSummaryCardProps {
  summary: PortfolioSummary;
  displayCurrency?: string;
}

export function PortfolioSummaryCard({ 
  summary, 
  displayCurrency = 'TRY' 
}: PortfolioSummaryCardProps) {
  const { portfolio, total_value, total_cash, cash_percentage, daily_change, daily_change_percent, policy_violations } = summary;
  const portfolioWithExtras = portfolio as PortfolioWithExtras;
  
  const isPositive = daily_change >= 0;
  const slug = createSlug(portfolio.name);
  
  const criticalViolations = policy_violations.filter(v => v.severity === 'critical').length;
  const warningViolations = policy_violations.filter(v => v.severity === 'warning').length;

  return (
    <Link href={`/p/${slug}`}>
      <div className="rounded-lg border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-zinc-900 dark:text-white">
              {portfolio.name}
            </h3>
            {portfolioWithExtras.description && (
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                {portfolioWithExtras.description}
              </p>
            )}
          </div>
          
          {policy_violations.length > 0 && (
            <div className="flex items-center gap-1">
              <ExclamationTriangleIcon className="h-4 w-4 text-amber-500" />
              {criticalViolations > 0 && (
                <Badge color="red">{criticalViolations}</Badge>
              )}
              {warningViolations > 0 && (
                <Badge color="yellow">{warningViolations}</Badge>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Toplam Değer</p>
            <p className="text-xl font-semibold text-zinc-900 dark:text-white">
              {formatCurrency(total_value, displayCurrency)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Günlük</p>
            <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? (
                <ArrowTrendingUpIcon className="h-4 w-4" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {isPositive ? '+' : ''}{formatCurrency(daily_change, displayCurrency)}
              </span>
              <span className="text-xs">
                ({isPositive ? '+' : ''}{(daily_change_percent * 100).toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-zinc-700">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Nakit: {formatCurrency(total_cash, displayCurrency)} 
            <span className="ml-1">(%{(cash_percentage * 100).toFixed(1)})</span>
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {summary.asset_count} varlık
          </div>
        </div>
      </div>
    </Link>
  );
}
