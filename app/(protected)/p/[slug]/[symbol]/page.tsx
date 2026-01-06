'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLivePrice } from '@/lib/hooks/use-live-price';
import { useTransactions } from '@/lib/hooks/use-transactions';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeleteAssetDialog } from '@/components/assets/delete-asset-dialog';
import Link from 'next/link';
import { PlusIcon, PencilIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/20/solid';
import { TransactionType } from '@/lib/types/portfolio';
import { DeleteTransactionDialog } from '@/components/transactions/delete-transaction-dialog';
import { usePortfolio } from '@/lib/context/portfolio-context';
import { getAssetUrl } from '@/lib/utils/slug';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Lightweight Charts
const PriceChart = dynamic(
  () => import('@/components/charts/price-chart').then((mod) => mod.PriceChart),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-semibold text-zinc-900 dark:text-white">Price Chart</span>
        </div>
        <div className="h-[340px] animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
      </div>
    ),
  }
);

interface AssetDetailPageProps {
  params: Promise<{ slug: string; symbol: string }>;
}

export default function AssetDetailPage({ params }: AssetDetailPageProps) {
  const router = useRouter();
  const [slug, setSlug] = React.useState<string | null>(null);
  const [urlSymbol, setUrlSymbol] = React.useState<string | null>(null);
  const [asset, setAsset] = React.useState<any>(null);
  const [portfolio, setPortfolio] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  const { setActivePortfolioId } = usePortfolio();

  // Get params
  React.useEffect(() => {
    params.then(({ slug, symbol }) => {
      setSlug(slug);
      setUrlSymbol(symbol);
    });
  }, [params]);

  // Fetch asset data
  React.useEffect(() => {
    if (!slug || !urlSymbol) return;

    const fetchAsset = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/portfolios/by-slug/${slug}/assets/${urlSymbol}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Asset not found');
          } else {
            setError('Failed to load asset');
          }
          return;
        }

        const result = await response.json();
        setAsset(result.data);
        setPortfolio(result.data.portfolio);
        
        // Set active portfolio
        if (result.data.portfolio?.id) {
          setActivePortfolioId(result.data.portfolio.id);
        }
      } catch (err) {
        setError('Failed to load asset');
        console.error('Error fetching asset:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAsset();
  }, [slug, urlSymbol, setActivePortfolioId]);

  // Live price hook
  const {
    price: livePrice,
    loading: priceLoading,
    error: priceError,
    refetch: refetchPrice,
    lastUpdated: priceLastUpdated,
  } = useLivePrice(asset?.symbol, asset?.currency || 'USD', {
    enabled: !!asset?.symbol,
  });

  // Transactions hook
  const { transactions, loading: transactionsLoading, hasMore, totalCount, loadMore } = useTransactions({
    assetId: asset?.id || '',
    limit: 20,
    offset: 0,
  });

  const [deleteAssetDialogOpen, setDeleteAssetDialogOpen] = React.useState(false);
  const [deleteTransactionDialogOpen, setDeleteTransactionDialogOpen] = React.useState(false);
  const [selectedTransaction, setSelectedTransaction] = React.useState<any>(null);

  if (!slug || !urlSymbol) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <Heading level={1}>Asset Details</Heading>
        <ErrorMessage error={error} />
        {slug && (
          <Link href={`/p/${slug}`}>
            <Button>Back to Portfolio</Button>
          </Link>
        )}
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="space-y-8">
        <Heading level={1}>Asset Not Found</Heading>
        <Text className="mt-2">The asset you're looking for could not be found.</Text>
        {slug && (
          <Link href={`/p/${slug}`}>
            <Button>Back to Portfolio</Button>
          </Link>
        )}
      </div>
    );
  }

  const assetQuantity = typeof asset.quantity === 'number' ? asset.quantity : parseFloat(String(asset.quantity)) || 0;
  const assetAveragePrice = typeof asset.average_buy_price === 'number' 
    ? asset.average_buy_price 
    : parseFloat(String(asset.average_buy_price)) || 0;
  const costBasis = assetQuantity * assetAveragePrice;
  
  // Live price calculations
  const currentPrice = livePrice?.price ?? null;
  const marketValue = currentPrice !== null ? assetQuantity * currentPrice : null;
  const unrealizedGainLoss = marketValue !== null ? marketValue - costBasis : null;
  const unrealizedGainLossPercent = costBasis > 0 && unrealizedGainLoss !== null 
    ? (unrealizedGainLoss / costBasis) * 100 
    : null;
  const dailyChange = livePrice?.change ?? null;
  const dailyChangePercent = livePrice?.changePercent ?? null;
  
  const formatLastUpdated = (date: Date | null) => {
    if (!date) return '';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };

  const companyName = livePrice?.longName || livePrice?.shortName || asset.name || asset.symbol;
  const assetUrl = getAssetUrl(slug, asset.symbol);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Heading level={1}>{asset.symbol}</Heading>
            <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {asset.type}
            </span>
          </div>
          {companyName && companyName !== asset.symbol && (
            <Text className="mt-1 text-lg text-zinc-600 dark:text-zinc-400">
              {companyName}
            </Text>
          )}
          {livePrice?.exchangeName && (
            <Text className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-500">
              {livePrice.exchangeName}
            </Text>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link href={`${assetUrl}/transactions/new`}>
            <Button>
              <PlusIcon className="mr-2 size-5" />
              Add Transaction
            </Button>
          </Link>
          <Link href={`${assetUrl}/edit`}>
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

      {/* Price Info Row - Stats with shared borders style */}
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-700 sm:grid-cols-2 lg:grid-cols-4">
        {/* Quantity */}
        <div className="bg-white px-4 py-6 dark:bg-zinc-900 sm:px-6">
          <Text className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Quantity</Text>
          <p className="mt-2 flex items-baseline gap-x-2">
            <span className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
              {assetQuantity.toLocaleString()}
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">shares</span>
          </p>
        </div>

        {/* Cost Basis */}
        <div className="bg-white px-4 py-6 dark:bg-zinc-900 sm:px-6">
          <Text className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Cost Basis</Text>
          <p className="mt-2 flex items-baseline gap-x-2">
            <span className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
              {costBasis.toLocaleString('en-US', {
                style: 'currency',
                currency: asset.currency || 'USD',
                maximumFractionDigits: 0,
              })}
            </span>
          </p>
          <Text className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {assetAveragePrice.toLocaleString('en-US', {
              style: 'currency',
              currency: asset.currency || 'USD',
            })}/share
          </Text>
        </div>

        {/* Current Price */}
        <div className="bg-white px-4 py-6 dark:bg-zinc-900 sm:px-6">
          <div className="flex items-center justify-between">
            <Text className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Current Price</Text>
            <Button
              plain
              onClick={() => refetchPrice()}
              disabled={priceLoading}
              className="!p-1"
            >
              <ArrowPathIcon className={`size-4 text-zinc-400 ${priceLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          {priceLoading && !livePrice ? (
            <div className="mt-2 space-y-2">
              <Skeleton height={32} width="70%" />
              <Skeleton height={16} width="40%" />
            </div>
          ) : currentPrice !== null ? (
            <>
              <p className="mt-2 flex items-baseline gap-x-2">
                <span className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                  {currentPrice.toLocaleString('en-US', {
                    style: 'currency',
                    currency: livePrice?.currency || asset.currency || 'USD',
                  })}
                </span>
                {dailyChangePercent !== null && (
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      dailyChange !== null && dailyChange >= 0
                        ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20'
                        : 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20'
                    }`}
                  >
                    {dailyChange !== null && dailyChange >= 0 ? '↑' : '↓'} {Math.abs(dailyChangePercent).toFixed(2)}%
                  </span>
                )}
              </p>
              {priceLastUpdated && (
                <Text className="mt-1 text-xs text-zinc-400">
                  Updated {formatLastUpdated(priceLastUpdated)}
                </Text>
              )}
            </>
          ) : (
            <div className="mt-2">
              <Text className="text-lg text-zinc-400">Price unavailable</Text>
              {priceError && (
                <Text className="mt-1 text-xs text-red-500">{priceError.error}</Text>
              )}
            </div>
          )}
        </div>

        {/* Market Value */}
        <div className="bg-white px-4 py-6 dark:bg-zinc-900 sm:px-6">
          <div className="flex items-center justify-between">
            <Text className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Market Value</Text>
            {unrealizedGainLossPercent !== null && (
              <span
                className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                  unrealizedGainLoss !== null && unrealizedGainLoss >= 0
                    ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20'
                    : 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20'
                }`}
              >
                {unrealizedGainLoss !== null && unrealizedGainLoss >= 0 ? '↑' : '↓'} {Math.abs(unrealizedGainLossPercent).toFixed(2)}%
              </span>
            )}
          </div>
          {priceLoading && !livePrice ? (
            <Skeleton className="mt-2" height={32} width="80%" />
          ) : marketValue !== null ? (
            <>
              <p className="mt-2">
                <span className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                  {marketValue.toLocaleString('en-US', {
                    style: 'currency',
                    currency: livePrice?.currency || asset.currency || 'USD',
                    maximumFractionDigits: 0,
                  })}
                </span>
              </p>
              {unrealizedGainLoss !== null && (
                <Text className={`mt-1 text-sm font-medium ${
                  unrealizedGainLoss >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {unrealizedGainLoss >= 0 ? '+' : ''}
                  {unrealizedGainLoss.toLocaleString('en-US', {
                    style: 'currency',
                    currency: livePrice?.currency || asset.currency || 'USD',
                  })}
                </Text>
              )}
            </>
          ) : (
            <Text className="mt-2 text-lg text-zinc-400">—</Text>
          )}
        </div>
      </div>

      {/* Market Data Row */}
      {livePrice && (livePrice.dayHigh || livePrice.fiftyTwoWeekHigh || livePrice.volume) && (
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-700 lg:grid-cols-4">
          {livePrice.dayLow !== undefined && livePrice.dayHigh !== undefined && (
            <div className="bg-white px-4 py-4 dark:bg-zinc-900 sm:px-6">
              <Text className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Day Range</Text>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20">
                  {livePrice.dayLow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-zinc-300 dark:text-zinc-600">→</span>
                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20">
                  {livePrice.dayHigh.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          {livePrice.fiftyTwoWeekLow !== undefined && livePrice.fiftyTwoWeekHigh !== undefined && (
            <div className="bg-white px-4 py-4 dark:bg-zinc-900 sm:px-6">
              <Text className="text-xs font-medium text-zinc-500 dark:text-zinc-400">52 Week Range</Text>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20">
                  {livePrice.fiftyTwoWeekLow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-zinc-300 dark:text-zinc-600">→</span>
                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20">
                  {livePrice.fiftyTwoWeekHigh.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          {livePrice.volume !== undefined && (
            <div className="bg-white px-4 py-4 dark:bg-zinc-900 sm:px-6">
              <Text className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Volume</Text>
              <p className="mt-2 text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                {livePrice.volume >= 1000000
                  ? `${(livePrice.volume / 1000000).toFixed(2)}M`
                  : livePrice.volume >= 1000
                    ? `${(livePrice.volume / 1000).toFixed(1)}K`
                    : livePrice.volume.toLocaleString()}
              </p>
            </div>
          )}

          {livePrice.exchangeName && (
            <div className="bg-white px-4 py-4 dark:bg-zinc-900 sm:px-6">
              <Text className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Exchange</Text>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                  {livePrice.exchangeName}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    livePrice.marketState === 'REGULAR'
                      ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400'
                      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'
                  }`}
                >
                  {livePrice.marketState === 'REGULAR' ? 'Open' : 'Closed'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Price Chart */}
      {asset.symbol && (
        <PriceChart
          symbol={asset.symbol}
          currency={asset.currency || 'USD'}
          height={400}
          showVolume={true}
          showSMA20={true}
          showSMA50={true}
          defaultRange="1M"
        />
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
          <Link href={`${assetUrl}/transactions/new`}>
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
            <Link href={`${assetUrl}/transactions/new`}>
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
                            <Link href={`${assetUrl}/transactions/${transaction.id}/edit`}>
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
