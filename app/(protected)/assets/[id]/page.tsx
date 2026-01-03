'use client';

import React from 'react';
import { useAsset } from '@/lib/hooks/use-asset';
import { useAssetPerformance } from '@/lib/hooks/use-asset-performance';
import { useTransactions } from '@/lib/hooks/use-transactions';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeleteAssetDialog } from '@/components/assets/delete-asset-dialog';
import Link from 'next/link';
import { PlusIcon, PencilIcon, TrashIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/20/solid';
import { TransactionType } from '@/lib/types/portfolio';
import { DeleteTransactionDialog } from '@/components/transactions/delete-transaction-dialog';

interface AssetDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AssetDetailPage({ params }: AssetDetailPageProps) {
  // Note: We need to await params in a client component
  // For now, we'll use a workaround with useEffect
  const [assetId, setAssetId] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    params.then(({ id }) => setAssetId(id));
  }, [params]);

  const { asset, loading, error, refetch } = useAsset(assetId || '');
  const { performance, loading: performanceLoading } = useAssetPerformance(assetId || '');
  const { transactions, loading: transactionsLoading, hasMore, totalCount, loadMore } = useTransactions({
    assetId: assetId || '',
    limit: 20,
    offset: 0,
  });
  const [deleteAssetDialogOpen, setDeleteAssetDialogOpen] = React.useState(false);
  const [deleteTransactionDialogOpen, setDeleteTransactionDialogOpen] = React.useState(false);
  const [selectedTransaction, setSelectedTransaction] = React.useState<any>(null);

  if (!assetId) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <Heading level={1}>Asset Details</Heading>
        <ErrorMessage error={error} onRetry={refetch} />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="space-y-8">
        <Heading level={1}>Asset Not Found</Heading>
        <Text className="mt-2">The asset you're looking for could not be found.</Text>
        <Link href="/assets">
          <Button>Back to Assets</Button>
        </Link>
      </div>
    );
  }

  const assetQuantity = typeof asset.quantity === 'number' ? asset.quantity : parseFloat(String(asset.quantity)) || 0;
  const assetAveragePrice = typeof asset.average_buy_price === 'number' 
    ? asset.average_buy_price 
    : parseFloat(String(asset.average_buy_price)) || 0;
  const totalValue = assetQuantity * assetAveragePrice;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Heading level={1}>{asset.symbol}</Heading>
          <Text className="mt-2">
            {asset.name || asset.symbol} • {asset.type}
          </Text>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/assets/${asset.id}/transactions/new`}>
            <Button>
              <PlusIcon className="mr-2 size-5" />
              Add Transaction
            </Button>
          </Link>
          <Link href={`/assets/${asset.id}/edit`}>
            <Button plain>
              <PencilIcon className="mr-2 size-5" />
              Edit
            </Button>
          </Link>
          <Button
            plain
            onClick={() => setDeleteAssetDialogOpen(true)}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <TrashIcon className="mr-2 size-5" />
            Delete
          </Button>
        </div>
      </div>

      <DeleteAssetDialog
        open={deleteAssetDialogOpen}
        onClose={() => setDeleteAssetDialogOpen(false)}
        asset={{
          id: asset.id,
          symbol: asset.symbol,
          portfolio_id: asset.portfolio_id,
        }}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <Text className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Quantity</Text>
          <Text className="mt-2 text-2xl font-semibold">{assetQuantity}</Text>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <Text className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Average Buy Price
          </Text>
          <Text className="mt-2 text-2xl font-semibold">
            {assetAveragePrice.toLocaleString('en-US', {
              style: 'currency',
              currency: asset.currency || 'USD',
            })}
          </Text>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <Text className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Value</Text>
          <Text className="mt-2 text-2xl font-semibold">
            {totalValue.toLocaleString('en-US', {
              style: 'currency',
              currency: asset.currency || 'USD',
            })}
          </Text>
        </div>
      </div>

      {performance && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <Text className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Total Invested
            </Text>
            <Text className="mt-2 text-xl font-semibold">
              {performance.totalInvested.toLocaleString('en-US', {
                style: 'currency',
                currency: asset.currency || 'USD',
              })}
            </Text>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <Text className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Realized Gain/Loss
            </Text>
            <div className="mt-2 flex items-center gap-2">
              {performance.realizedGainLoss >= 0 ? (
                <ArrowTrendingUpIcon className="size-5 text-green-600 dark:text-green-400" />
              ) : (
                <ArrowTrendingDownIcon className="size-5 text-red-600 dark:text-red-400" />
              )}
              <Text
                className={`text-xl font-semibold ${
                  performance.realizedGainLoss >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {performance.realizedGainLoss >= 0 ? '+' : ''}
                {performance.realizedGainLoss.toLocaleString('en-US', {
                  style: 'currency',
                  currency: asset.currency || 'USD',
                })}
              </Text>
            </div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <Text className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Unrealized Gain/Loss
            </Text>
            <div className="mt-2 flex items-center gap-2">
              {performance.unrealizedGainLoss >= 0 ? (
                <ArrowTrendingUpIcon className="size-5 text-green-600 dark:text-green-400" />
              ) : (
                <ArrowTrendingDownIcon className="size-5 text-red-600 dark:text-red-400" />
              )}
              <Text
                className={`text-xl font-semibold ${
                  performance.unrealizedGainLoss >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {performance.unrealizedGainLoss >= 0 ? '+' : ''}
                {performance.unrealizedGainLoss.toLocaleString('en-US', {
                  style: 'currency',
                  currency: asset.currency || 'USD',
                })}
              </Text>
            </div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <Text className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Total Gain/Loss
            </Text>
            <div className="mt-2 flex items-center gap-2">
              {performance.totalGainLoss >= 0 ? (
                <ArrowTrendingUpIcon className="size-5 text-green-600 dark:text-green-400" />
              ) : (
                <ArrowTrendingDownIcon className="size-5 text-red-600 dark:text-red-400" />
              )}
              <Text
                className={`text-xl font-semibold ${
                  performance.totalGainLoss >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {performance.totalGainLoss >= 0 ? '+' : ''}
                {performance.totalGainLoss.toLocaleString('en-US', {
                  style: 'currency',
                  currency: asset.currency || 'USD',
                })}
              </Text>
            </div>
            <Text
              className={`mt-1 text-sm font-medium ${
                performance.performance >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {performance.performance >= 0 ? '+' : ''}
              {performance.performance.toFixed(2)}%
            </Text>
          </div>
        </div>
      )}

      {asset.notes && (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <Text className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Notes</Text>
          <Text className="mt-2">{asset.notes}</Text>
        </div>
      )}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <Heading level={2}>Transaction History</Heading>
            {totalCount !== null && (
              <Text className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Showing {transactions.length} of {totalCount} transactions
              </Text>
            )}
          </div>
          <Link href={`/assets/${asset.id}/transactions/new`}>
            <Button plain>
              <PlusIcon className="mr-2 size-4" />
              Add Transaction
            </Button>
          </Link>
        </div>

        {transactionsLoading && transactions.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <Text>No transactions recorded yet.</Text>
            <Link href={`/assets/${asset.id}/transactions/new`}>
              <Button className="mt-4">Record First Transaction</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="rounded-lg bg-white shadow-xs ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Date</TableHeader>
                    <TableHeader>Type</TableHeader>
                    <TableHeader className="text-right">Quantity</TableHeader>
                    <TableHeader className="text-right">Price</TableHeader>
                    <TableHeader className="text-right">Total</TableHeader>
                    <TableHeader className="text-right">Actions</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction: any) => {
                    const transactionAmount = typeof transaction.amount === 'number' 
                      ? transaction.amount 
                      : parseFloat(String(transaction.amount)) || 0;
                    const transactionPrice = typeof transaction.price === 'number' 
                      ? transaction.price 
                      : parseFloat(String(transaction.price)) || 0;
                    const transactionTotal = transactionAmount * transactionPrice;
                    
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {new Date(transaction.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-1 text-xs/5 font-medium ring-1 ring-inset ${
                              transaction.type === TransactionType.BUY
                                ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:ring-green-400/20'
                                : 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20'
                            }`}
                          >
                            {transaction.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{transactionAmount}</TableCell>
                        <TableCell className="text-right">
                          {transactionPrice.toLocaleString('en-US', {
                            style: 'currency',
                            currency: transaction.currency || asset.currency || 'USD',
                          })}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {transactionTotal.toLocaleString('en-US', {
                            style: 'currency',
                            currency: transaction.currency || asset.currency || 'USD',
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/assets/${asset.id}/transactions/${transaction.id}/edit`}>
                              <Button plain>
                                <PencilIcon className="size-4" />
                              </Button>
                            </Link>
                            <Button
                              plain
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setDeleteTransactionDialogOpen(true);
                              }}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <TrashIcon className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={loadMore}
                  disabled={transactionsLoading}
                  plain
                >
                  {transactionsLoading ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedTransaction && (
        <DeleteTransactionDialog
          open={deleteTransactionDialogOpen}
          onClose={() => {
            setDeleteTransactionDialogOpen(false);
            setSelectedTransaction(null);
          }}
          transaction={{
            id: selectedTransaction.id,
            asset_id: selectedTransaction.asset_id,
            type: selectedTransaction.type,
            amount: typeof selectedTransaction.amount === 'number' 
              ? selectedTransaction.amount 
              : parseFloat(String(selectedTransaction.amount)) || 0,
            date: selectedTransaction.date,
          }}
        />
      )}
    </div>
  );
}

