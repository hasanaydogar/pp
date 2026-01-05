'use client';

import React from 'react';
import { useSummary } from '@/lib/hooks/use-summary';
import { useCurrency } from '@/lib/context/currency-context';
import { PortfolioSummaryCard } from '@/components/summary/portfolio-summary-card';
import { ViolationsPanel } from '@/components/summary/violations-panel';
import { Heading, Subheading } from '@/components/ui/heading';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { formatCurrency } from '@/lib/utils/currency';
import { 
  BanknotesIcon, 
  ChartBarIcon, 
  WalletIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

export default function SummaryPage() {
  const { currency: displayCurrency } = useCurrency();
  const { summary, isLoading, error } = useSummary(displayCurrency);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-red-500">Hata: {error}</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-zinc-500">Veri bulunamadı</p>
      </div>
    );
  }

  const isPositive = summary.daily_change >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Heading>📊 Toplam Özet</Heading>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Tüm portfolyolarınızın birleşik görünümü
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Value */}
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <div className="flex items-center gap-2">
            <WalletIcon className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Toplam Değer</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
            {formatCurrency(summary.total_value, displayCurrency)}
          </p>
        </div>

        {/* Total Cash */}
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <div className="flex items-center gap-2">
            <BanknotesIcon className="h-5 w-5 text-green-500" />
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Toplam Nakit</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
            {formatCurrency(summary.total_cash, displayCurrency)}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            %{((summary.total_cash / summary.total_value) * 100 || 0).toFixed(1)} oran
          </p>
        </div>

        {/* Daily Change */}
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <div className="flex items-center gap-2">
            {isPositive ? (
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
            ) : (
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
            )}
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Günlük Değişim</span>
          </div>
          <p className={`mt-2 text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{formatCurrency(summary.daily_change, displayCurrency)}
          </p>
          <p className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{(summary.daily_change_percent * 100).toFixed(2)}%
          </p>
        </div>

        {/* Portfolio Count */}
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <div className="flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-purple-500" />
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Portfolyolar</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
            {summary.portfolio_count}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {summary.total_asset_count} varlık
          </p>
        </div>
      </div>

      {/* Policy Violations */}
      {summary.all_policy_violations.length > 0 && (
        <ViolationsPanel violations={summary.all_policy_violations} />
      )}

      {/* Portfolio List */}
      <div>
        <Subheading>Portfolyolar</Subheading>
        {summary.by_portfolio.length === 0 ? (
          <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-400">
              Henüz portfolyo oluşturmadınız.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {summary.by_portfolio.map((portfolioSummary) => (
              <PortfolioSummaryCard
                key={portfolioSummary.portfolio.id}
                summary={portfolioSummary}
                displayCurrency={displayCurrency}
              />
            ))}
          </div>
        )}
      </div>

      {/* Asset Type Distribution */}
      {summary.by_asset_type.length > 0 && (
        <div>
          <Subheading>Varlık Türü Dağılımı</Subheading>
          <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <div className="space-y-3">
              {summary.by_asset_type.map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge>{item.type}</Badge>
                    <span className="text-sm text-zinc-600 dark:text-zinc-300">
                      {formatCurrency(item.value, displayCurrency)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">
                    %{(item.percentage * 100).toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
