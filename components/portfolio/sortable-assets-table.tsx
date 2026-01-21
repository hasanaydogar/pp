'use client';

import React from 'react';
import Link from 'next/link';
import { AssetWithMetrics, SortColumn, SortDirection } from '@/lib/types/asset-metrics';
import { PortfolioPolicy, DEFAULT_POLICY } from '@/lib/types/policy';
import { SortableTableHeader, NonSortableTableHeader } from './sortable-table-header';
import { PositionCategoryBadge } from './position-category-badge';
import { WeightIndicator } from './weight-indicator';
import { DailyChangeColumn } from './daily-change-column';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/currency';
import { getAssetUrl } from '@/lib/utils/slug';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/16/solid';
import clsx from 'clsx';

interface SortableAssetsTableProps {
  assets: AssetWithMetrics[];
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
  policy?: PortfolioPolicy | null;
  slug: string;
  displayCurrency: string;
}

export function SortableAssetsTable({
  assets,
  sortColumn,
  sortDirection,
  onSort,
  policy,
  slug,
  displayCurrency,
}: SortableAssetsTableProps) {
  const p = policy || DEFAULT_POLICY;
  
  if (assets.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Henüz varlık eklenmemiş.
        </p>
      </div>
    );
  }
  
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50">
            <tr>
              <NonSortableTableHeader className="w-10 hidden sm:table-cell">
                #
              </NonSortableTableHeader>
              
              <SortableTableHeader
                column="symbol"
                currentSort={sortColumn}
                direction={sortDirection}
                onSort={onSort}
              >
                Sembol
              </SortableTableHeader>

              <SortableTableHeader
                column="currentPrice"
                currentSort={sortColumn}
                direction={sortDirection}
                onSort={onSort}
                align="right"
                className="hidden sm:table-cell"
              >
                Son Fiyat
              </SortableTableHeader>

              <SortableTableHeader
                column="weight"
                currentSort={sortColumn}
                direction={sortDirection}
                onSort={onSort}
                align="right"
              >
                Ağırlık
              </SortableTableHeader>
              
              <SortableTableHeader
                column="currentValue"
                currentSort={sortColumn}
                direction={sortDirection}
                onSort={onSort}
                align="right"
              >
                Değer
              </SortableTableHeader>
              
              <SortableTableHeader
                column="costBasis"
                currentSort={sortColumn}
                direction={sortDirection}
                onSort={onSort}
                align="right"
                className="hidden lg:table-cell"
              >
                Maliyet
              </SortableTableHeader>
              
              <SortableTableHeader
                column="gainLoss"
                currentSort={sortColumn}
                direction={sortDirection}
                onSort={onSort}
                align="right"
                className="hidden md:table-cell"
              >
                G/Z
              </SortableTableHeader>
              
              <SortableTableHeader
                column="gainLossPercent"
                currentSort={sortColumn}
                direction={sortDirection}
                onSort={onSort}
                align="right"
              >
                G/Z %
              </SortableTableHeader>
              
              <SortableTableHeader
                column="dailyChangePercent"
                currentSort={sortColumn}
                direction={sortDirection}
                onSort={onSort}
                align="right"
                className="hidden xl:table-cell"
              >
                Günlük
              </SortableTableHeader>
              
              <SortableTableHeader
                column="category"
                currentSort={sortColumn}
                direction={sortDirection}
                onSort={onSort}
                className="hidden lg:table-cell"
              >
                Kategori
              </SortableTableHeader>
              
              <NonSortableTableHeader align="right">
                Aksiyon
              </NonSortableTableHeader>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {assets.map((asset, index) => (
              <tr 
                key={asset.id}
                className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                {/* Row Number */}
                <td className="hidden sm:table-cell py-2 px-3 text-sm text-zinc-500 dark:text-zinc-400 text-center w-10">
                  {index + 1}
                </td>
                
                {/* Symbol */}
                <td className="py-2 px-3">
                  <Link
                    href={getAssetUrl(slug, asset.symbol)}
                    className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    {asset.symbol}
                  </Link>
                </td>

                {/* Current Price - Hidden on mobile */}
                <td className="hidden sm:table-cell py-2 px-3 text-right text-sm text-zinc-900 dark:text-white tabular-nums">
                  {formatCurrency(asset.currentPrice, displayCurrency)}
                </td>

                {/* Weight */}
                <td className="py-2 px-3 text-right">
                  <WeightIndicator
                    weight={asset.weight}
                    maxWeight={p.max_weight_per_stock}
                    isTopPosition={index === 0}
                  />
                </td>
                
                {/* Current Value */}
                <td className="py-2 px-3 text-right text-sm font-medium text-zinc-900 dark:text-white tabular-nums">
                  {formatCurrency(asset.currentValue, displayCurrency)}
                </td>
                
                {/* Cost Basis - Hidden on smaller screens */}
                <td className="hidden lg:table-cell py-2 px-3 text-right text-sm text-zinc-500 dark:text-zinc-400 tabular-nums">
                  {formatCurrency(asset.costBasis, displayCurrency)}
                </td>
                
                {/* Gain/Loss Amount - Hidden on smaller screens */}
                <td className={clsx(
                  'hidden md:table-cell py-2 px-3 text-right text-sm tabular-nums',
                  asset.gainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                )}>
                  {asset.gainLoss >= 0 ? '+' : ''}{formatCurrency(asset.gainLoss, displayCurrency)}
                </td>
                
                {/* Gain/Loss Percent */}
                <td className={clsx(
                  'py-2 px-3 text-right text-sm font-medium tabular-nums',
                  asset.gainLossPercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                )}>
                  {asset.gainLossPercent >= 0 ? '+' : ''}{asset.gainLossPercent.toFixed(2)}%
                </td>
                
                {/* Daily Change - Hidden on smaller screens */}
                <td className="hidden xl:table-cell py-2 px-3 text-right">
                  <DailyChangeColumn
                    changePercent={asset.dailyChangePercent}
                    changeAmount={asset.positionDailyChange}
                    currency={displayCurrency}
                    previousClose={asset.previousClose}
                    showAmount={asset.positionDailyChange !== 0}
                    size="sm"
                  />
                </td>
                
                {/* Category - Hidden on smaller screens */}
                <td className="hidden lg:table-cell py-2 px-3">
                  <PositionCategoryBadge
                    category={asset.category}
                    isOverWeight={asset.isOverWeight}
                  />
                </td>
                
                {/* Actions */}
                <td className="py-2 px-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`${getAssetUrl(slug, asset.symbol)}/transactions/new?type=BUY`}>
                      <Button 
                        color="green" 
                        className="!px-2 !py-1 text-xs"
                      >
                        <ArrowUpIcon className="h-3 w-3 mr-0.5" />
                        Al
                      </Button>
                    </Link>
                    <Link href={`${getAssetUrl(slug, asset.symbol)}/transactions/new?type=SELL`}>
                      <Button 
                        color="red" 
                        className="!px-2 !py-1 text-xs"
                      >
                        <ArrowDownIcon className="h-3 w-3 mr-0.5" />
                        Sat
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
