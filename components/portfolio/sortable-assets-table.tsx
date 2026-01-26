'use client';

import React, { useMemo, ReactNode } from 'react';
import Link from 'next/link';
import { AssetWithMetrics, SortColumn, SortDirection } from '@/lib/types/asset-metrics';
import { PortfolioPolicy, DEFAULT_POLICY } from '@/lib/types/policy';
import { ColumnConfig, COLUMN_IDS, COLUMN_SORT_MAP } from '@/lib/types/table-columns';
import { SortableTableHeader, NonSortableTableHeader } from './sortable-table-header';
import { PositionCategoryBadge } from './position-category-badge';
import { WeightIndicator } from './weight-indicator';
import { DailyChangeColumn } from './daily-change-column';
import { ColumnConfigPanel } from './column-config-panel';
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
  // Column customization props (optional for backward compatibility)
  columns?: ColumnConfig[];
  onColumnsChange?: (columns: ColumnConfig[]) => void;
  onToggleColumn?: (columnId: string) => void;
  onResetColumns?: () => void;
}

interface ColumnRenderContext {
  asset: AssetWithMetrics;
  index: number;
  policy: PortfolioPolicy | typeof DEFAULT_POLICY;
  slug: string;
  displayCurrency: string;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
}

// Column header renderer
function renderColumnHeader(
  column: ColumnConfig,
  ctx: Pick<ColumnRenderContext, 'sortColumn' | 'sortDirection' | 'onSort'>
): ReactNode {
  const sortKey = COLUMN_SORT_MAP[column.id as keyof typeof COLUMN_SORT_MAP];
  const baseClass = column.responsiveHide || '';

  if (!column.sortable || !sortKey) {
    return (
      <NonSortableTableHeader
        key={column.id}
        className={baseClass}
        align={column.align}
      >
        {column.label}
      </NonSortableTableHeader>
    );
  }

  return (
    <SortableTableHeader
      key={column.id}
      column={sortKey as SortColumn}
      currentSort={ctx.sortColumn}
      direction={ctx.sortDirection}
      onSort={ctx.onSort}
      align={column.align}
      className={baseClass}
    >
      {column.label}
    </SortableTableHeader>
  );
}

// Column cell renderer
function renderColumnCell(
  column: ColumnConfig,
  ctx: ColumnRenderContext
): ReactNode {
  const { asset, index, policy, slug, displayCurrency } = ctx;
  const baseClass = column.responsiveHide || '';
  const alignClass = column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : '';

  switch (column.id) {
    case COLUMN_IDS.ROW_NUMBER:
      return (
        <td
          key={column.id}
          className={clsx(baseClass, 'py-2 px-3 text-sm text-zinc-500 dark:text-zinc-400 text-center w-10')}
        >
          {index + 1}
        </td>
      );

    case COLUMN_IDS.SYMBOL:
      return (
        <td key={column.id} className="py-2 px-3">
          <Link
            href={getAssetUrl(slug, asset.symbol)}
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            {asset.symbol}
          </Link>
        </td>
      );

    case COLUMN_IDS.CURRENT_PRICE:
      return (
        <td
          key={column.id}
          className={clsx(baseClass, 'py-2 px-3 text-right text-sm text-zinc-900 dark:text-white tabular-nums')}
        >
          {formatCurrency(asset.currentPrice, displayCurrency)}
        </td>
      );

    case COLUMN_IDS.WEIGHT:
      return (
        <td key={column.id} className="py-2 px-3 text-right">
          <WeightIndicator
            weight={asset.weight}
            maxWeight={policy.max_weight_per_stock}
            isTopPosition={index === 0}
          />
        </td>
      );

    case COLUMN_IDS.CURRENT_VALUE:
      return (
        <td
          key={column.id}
          className="py-2 px-3 text-right text-sm font-medium text-zinc-900 dark:text-white tabular-nums"
        >
          {formatCurrency(asset.currentValue, displayCurrency)}
        </td>
      );

    case COLUMN_IDS.COST_BASIS:
      return (
        <td
          key={column.id}
          className={clsx(baseClass, 'py-2 px-3 text-right text-sm text-zinc-500 dark:text-zinc-400 tabular-nums')}
        >
          {formatCurrency(asset.costBasis, displayCurrency)}
        </td>
      );

    case COLUMN_IDS.GAIN_LOSS:
      return (
        <td
          key={column.id}
          className={clsx(
            baseClass,
            'py-2 px-3 text-right text-sm tabular-nums',
            asset.gainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          )}
        >
          {asset.gainLoss >= 0 ? '+' : ''}
          {formatCurrency(asset.gainLoss, displayCurrency)}
        </td>
      );

    case COLUMN_IDS.GAIN_LOSS_PERCENT:
      return (
        <td
          key={column.id}
          className={clsx(
            'py-2 px-3 text-right text-sm font-medium tabular-nums',
            asset.gainLossPercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          )}
        >
          {asset.gainLossPercent >= 0 ? '+' : ''}
          {asset.gainLossPercent.toFixed(2)}%
        </td>
      );

    case COLUMN_IDS.DAILY_CHANGE_PERCENT:
      return (
        <td
          key={column.id}
          className={clsx(
            baseClass,
            'py-2 px-3 text-right text-sm font-medium tabular-nums',
            asset.dailyChangePercent > 0
              ? 'text-green-600 dark:text-green-400'
              : asset.dailyChangePercent < 0
              ? 'text-red-600 dark:text-red-400'
              : 'text-zinc-500 dark:text-zinc-400'
          )}
        >
          {asset.previousClose ? (
            <>
              {asset.dailyChangePercent > 0 ? '+' : ''}
              {asset.dailyChangePercent.toFixed(2)}%
            </>
          ) : (
            <span className="text-zinc-400 dark:text-zinc-500">-</span>
          )}
        </td>
      );

    case COLUMN_IDS.DAILY_CHANGE_AMOUNT:
      return (
        <td
          key={column.id}
          className={clsx(
            baseClass,
            'py-2 px-3 text-right text-sm tabular-nums',
            asset.positionDailyChange > 0
              ? 'text-green-600 dark:text-green-400'
              : asset.positionDailyChange < 0
              ? 'text-red-600 dark:text-red-400'
              : 'text-zinc-500 dark:text-zinc-400'
          )}
        >
          {asset.previousClose && asset.positionDailyChange !== 0 ? (
            <>
              {asset.positionDailyChange > 0 ? '+' : ''}
              {formatCurrency(asset.positionDailyChange, displayCurrency)}
            </>
          ) : (
            <span className="text-zinc-400 dark:text-zinc-500">-</span>
          )}
        </td>
      );

    case COLUMN_IDS.CATEGORY:
      return (
        <td key={column.id} className={clsx(baseClass, 'py-2 px-3')}>
          <PositionCategoryBadge
            category={asset.category}
            isOverWeight={asset.isOverWeight}
          />
        </td>
      );

    case COLUMN_IDS.ACTIONS:
      return (
        <td key={column.id} className="py-2 px-3 text-right">
          <div className="flex items-center justify-end gap-1">
            <Link href={`${getAssetUrl(slug, asset.symbol)}/transactions/new?type=BUY`}>
              <Button color="green" className="!px-2 !py-1 text-xs">
                <ArrowUpIcon className="h-3 w-3 mr-0.5" />
                Al
              </Button>
            </Link>
            <Link href={`${getAssetUrl(slug, asset.symbol)}/transactions/new?type=SELL`}>
              <Button color="red" className="!px-2 !py-1 text-xs">
                <ArrowDownIcon className="h-3 w-3 mr-0.5" />
                Sat
              </Button>
            </Link>
          </div>
        </td>
      );

    default:
      return null;
  }
}

export function SortableAssetsTable({
  assets,
  sortColumn,
  sortDirection,
  onSort,
  policy,
  slug,
  displayCurrency,
  columns,
  onColumnsChange,
  onToggleColumn,
  onResetColumns,
}: SortableAssetsTableProps) {
  const p = policy || DEFAULT_POLICY;

  // Get visible columns sorted by order
  const visibleColumns = useMemo(() => {
    if (!columns) return null;
    return columns.filter((c) => c.visible).sort((a, b) => a.order - b.order);
  }, [columns]);

  // Show column config panel only if column customization is enabled
  const showColumnConfig = columns && onColumnsChange && onToggleColumn && onResetColumns;

  if (assets.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Henüz varlık eklenmemiş.
        </p>
      </div>
    );
  }

  // If no column config provided, render the original static table
  if (!visibleColumns) {
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
                  <td className="hidden sm:table-cell py-2 px-3 text-sm text-zinc-500 dark:text-zinc-400 text-center w-10">
                    {index + 1}
                  </td>

                  <td className="py-2 px-3">
                    <Link
                      href={getAssetUrl(slug, asset.symbol)}
                      className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      {asset.symbol}
                    </Link>
                  </td>

                  <td className="hidden sm:table-cell py-2 px-3 text-right text-sm text-zinc-900 dark:text-white tabular-nums">
                    {formatCurrency(asset.currentPrice, displayCurrency)}
                  </td>

                  <td className="py-2 px-3 text-right">
                    <WeightIndicator
                      weight={asset.weight}
                      maxWeight={p.max_weight_per_stock}
                      isTopPosition={index === 0}
                    />
                  </td>

                  <td className="py-2 px-3 text-right text-sm font-medium text-zinc-900 dark:text-white tabular-nums">
                    {formatCurrency(asset.currentValue, displayCurrency)}
                  </td>

                  <td className="hidden lg:table-cell py-2 px-3 text-right text-sm text-zinc-500 dark:text-zinc-400 tabular-nums">
                    {formatCurrency(asset.costBasis, displayCurrency)}
                  </td>

                  <td
                    className={clsx(
                      'hidden md:table-cell py-2 px-3 text-right text-sm tabular-nums',
                      asset.gainLoss >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    {asset.gainLoss >= 0 ? '+' : ''}
                    {formatCurrency(asset.gainLoss, displayCurrency)}
                  </td>

                  <td
                    className={clsx(
                      'py-2 px-3 text-right text-sm font-medium tabular-nums',
                      asset.gainLossPercent >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    {asset.gainLossPercent >= 0 ? '+' : ''}
                    {asset.gainLossPercent.toFixed(2)}%
                  </td>

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

                  <td className="hidden lg:table-cell py-2 px-3">
                    <PositionCategoryBadge
                      category={asset.category}
                      isOverWeight={asset.isOverWeight}
                    />
                  </td>

                  <td className="py-2 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`${getAssetUrl(slug, asset.symbol)}/transactions/new?type=BUY`}>
                        <Button color="green" className="!px-2 !py-1 text-xs">
                          <ArrowUpIcon className="h-3 w-3 mr-0.5" />
                          Al
                        </Button>
                      </Link>
                      <Link href={`${getAssetUrl(slug, asset.symbol)}/transactions/new?type=SELL`}>
                        <Button color="red" className="!px-2 !py-1 text-xs">
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

  // Dynamic column rendering
  const headerCtx = { sortColumn, sortDirection, onSort };

  return (
    <div className="space-y-2">
      {/* Column Config Panel */}
      {showColumnConfig && (
        <div className="flex justify-end">
          <ColumnConfigPanel
            columns={columns}
            onReorder={onColumnsChange}
            onToggleVisibility={onToggleColumn}
            onReset={onResetColumns}
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
              <tr>
                {visibleColumns.map((column) => renderColumnHeader(column, headerCtx))}
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {assets.map((asset, index) => {
                const cellCtx: ColumnRenderContext = {
                  asset,
                  index,
                  policy: p,
                  slug,
                  displayCurrency,
                  sortColumn,
                  sortDirection,
                  onSort,
                };

                return (
                  <tr
                    key={asset.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    {visibleColumns.map((column) => renderColumnCell(column, cellCtx))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
