'use client';

import React from 'react';
import { ProjectionResult } from '@/lib/types/portfolio-settings';
import { formatCurrency } from '@/lib/utils/currency';
import { formatYears } from '@/lib/utils/projection';

interface ProjectionTableProps {
  projections: ProjectionResult[];
  currency: string;
}

export function ProjectionTable({
  projections,
  currency,
}: ProjectionTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
        <thead className="bg-zinc-50 dark:bg-zinc-800/50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Süre
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Tahmini Değer
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Aylık Gelir*
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hidden sm:table-cell">
              Toplam Yatırım
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hidden md:table-cell">
              Toplam Getiri
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
          {projections.map((row) => (
            <tr key={row.years} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-white">
                {formatYears(row.years)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-zinc-900 dark:text-white tabular-nums">
                {formatCurrency(row.future_value, currency)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600 dark:text-green-400 tabular-nums">
                {formatCurrency(row.monthly_income, currency)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-zinc-500 dark:text-zinc-400 tabular-nums hidden sm:table-cell">
                {formatCurrency(row.total_invested, currency)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-blue-600 dark:text-blue-400 tabular-nums hidden md:table-cell">
                {formatCurrency(row.total_returns, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 text-xs text-zinc-500 dark:text-zinc-400">
        * Aylık gelir, belirtilen çekim oranına göre hesaplanmıştır.
      </div>
    </div>
  );
}
