'use client';

import React from 'react';
import { CashPosition } from '@/lib/types/cash';
import { PortfolioPolicy, DEFAULT_POLICY } from '@/lib/types/policy';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/currency';
import { BanknotesIcon, PlusIcon } from '@heroicons/react/24/outline';

interface CashPositionCardProps {
  positions: CashPosition[];
  totalPortfolioValue: number;
  policy?: PortfolioPolicy | null;
  onAddCash?: () => void;
  displayCurrency?: string;
}

export function CashPositionCard({
  positions,
  totalPortfolioValue,
  policy,
  onAddCash,
  displayCurrency = 'TRY',
}: CashPositionCardProps) {
  const p = policy || DEFAULT_POLICY;
  const totalCash = positions.reduce((sum, pos) => sum + pos.amount, 0);
  const cashPercentage = totalPortfolioValue > 0 ? totalCash / totalPortfolioValue : 0;

  // Determine status
  let status: 'below' | 'on_target' | 'above' = 'on_target';
  let statusColor: 'yellow' | 'green' | 'blue' = 'green';

  if (cashPercentage < p.cash_min_percent) {
    status = 'below';
    statusColor = 'yellow';
  } else if (cashPercentage > p.cash_max_percent) {
    status = 'above';
    statusColor = 'blue';
  }

  const statusLabels = {
    below: 'Hedefin Altında',
    on_target: 'Hedefte',
    above: 'Hedefin Üstünde',
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BanknotesIcon className="h-5 w-5 text-green-500" />
          <h3 className="text-sm font-medium text-zinc-900 dark:text-white">
            Nakit Pozisyonları
          </h3>
        </div>
        {onAddCash && (
          <Button outline onClick={onAddCash} className="h-7 px-2 text-xs">
            <PlusIcon className="h-4 w-4 mr-1" />
            Ekle
          </Button>
        )}
      </div>

      <div className="mt-3 space-y-2">
        {positions.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Henüz nakit pozisyonu yok
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {positions.map((pos) => (
              <div
                key={pos.currency}
                className="flex items-center gap-1 rounded bg-zinc-100 px-2 py-1 dark:bg-zinc-700"
              >
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  {pos.currency}:
                </span>
                <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {formatCurrency(pos.amount, pos.currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {positions.length > 0 && (
        <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-zinc-700">
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Toplam Nakit</p>
            <p className="text-lg font-semibold text-zinc-900 dark:text-white">
              {formatCurrency(totalCash, displayCurrency)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Oran (Hedef: %{(p.cash_target_percent * 100).toFixed(0)})
            </p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-zinc-900 dark:text-white">
                %{(cashPercentage * 100).toFixed(1)}
              </span>
              <Badge color={statusColor}>{statusLabels[status]}</Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
