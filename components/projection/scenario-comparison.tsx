'use client';

import React from 'react';
import { ProjectionScenario } from '@/lib/types/portfolio-settings';
import { formatCurrency } from '@/lib/utils/currency';
import clsx from 'clsx';

interface ScenarioComparisonProps {
  scenarios: ProjectionScenario;
  targetYears: number; // Which year to show (e.g., 20)
  currency: string;
  baseRate: number;
}

interface ScenarioCardProps {
  title: string;
  emoji: string;
  value: number;
  monthlyIncome: number;
  rate: number;
  currency: string;
  colorClass: string;
}

function ScenarioCard({ 
  title, 
  emoji, 
  value, 
  monthlyIncome, 
  rate, 
  currency, 
  colorClass 
}: ScenarioCardProps) {
  return (
    <div className={clsx(
      'rounded-lg border p-4',
      colorClass
    )}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{emoji}</span>
        <span className="font-medium text-zinc-900 dark:text-white">{title}</span>
      </div>
      <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
        %{(rate * 100).toFixed(0)} yıllık getiri
      </div>
      <div className="text-2xl font-bold text-zinc-900 dark:text-white">
        {formatCurrency(value, currency)}
      </div>
      <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
        Aylık: {formatCurrency(monthlyIncome, currency)}
      </div>
    </div>
  );
}

export function ScenarioComparison({
  scenarios,
  targetYears,
  currency,
  baseRate,
}: ScenarioComparisonProps) {
  // Find the projection for the target year
  const optimisticData = scenarios.optimistic.find(p => p.years === targetYears);
  const baseData = scenarios.base.find(p => p.years === targetYears);
  const pessimisticData = scenarios.pessimistic.find(p => p.years === targetYears);

  if (!optimisticData || !baseData || !pessimisticData) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-zinc-900 dark:text-white">
        {targetYears} Yıl Sonra Senaryo Karşılaştırması
      </h3>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ScenarioCard
          title="İyimser"
          emoji="🟢"
          value={optimisticData.future_value}
          monthlyIncome={optimisticData.monthly_income}
          rate={baseRate + 0.02}
          currency={currency}
          colorClass="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
        />
        
        <ScenarioCard
          title="Baz Senaryo"
          emoji="🟡"
          value={baseData.future_value}
          monthlyIncome={baseData.monthly_income}
          rate={baseRate}
          currency={currency}
          colorClass="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20"
        />
        
        <ScenarioCard
          title="Kötümser"
          emoji="🔴"
          value={pessimisticData.future_value}
          monthlyIncome={pessimisticData.monthly_income}
          rate={baseRate - 0.02}
          currency={currency}
          colorClass="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
        />
      </div>
    </div>
  );
}
