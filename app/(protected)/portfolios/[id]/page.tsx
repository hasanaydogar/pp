'use client';

import React, { useMemo } from 'react';
import { usePortfolio } from '@/lib/hooks/use-portfolio';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeletePortfolioDialog } from '@/components/portfolios/delete-portfolio-dialog';
import { ImportAssetsDialog } from '@/components/portfolios/import-assets-dialog';
import Link from 'next/link';
import { PlusIcon, PencilIcon, TrashIcon, ArrowUpTrayIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { createSlug, getAssetUrl } from '@/lib/utils/slug';

interface Asset {
  id: string;
  symbol: string;
  name?: string | null;
  type: string;
  quantity: number;
  average_buy_price: number;
  currency: string;
}

interface PortfolioDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PortfolioDetailPage({ params }: PortfolioDetailPageProps) {
  const [portfolioId, setPortfolioId] = React.useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  
  React.useEffect(() => {
    params.then(({ id }) => setPortfolioId(id));
  }, [params]);

  const { portfolio, loading, error, refetch } = usePortfolio(portfolioId || '');

  // Get assets from portfolio (must be before early returns)
  const assets: Asset[] = useMemo(() => {
    if (!portfolio || !Array.isArray(portfolio.assets)) {
      return [];
    }
    return portfolio.assets.filter((a): a is Asset => a !== null && typeof a === 'object' && 'id' in a);
  }, [portfolio]);

  // Calculate portfolio metrics (must be before early returns)
  const totalValue = useMemo(() => {
    return assets.reduce((sum, asset) => {
      const quantity = typeof asset.quantity === 'number' ? asset.quantity : parseFloat(String(asset.quantity)) || 0;
      const price = typeof asset.average_buy_price === 'number' 
        ? asset.average_buy_price 
        : parseFloat(String(asset.average_buy_price)) || 0;
      return sum + quantity * price;
    }, 0);
  }, [assets]);

  const assetCount = assets.length;

  if (!portfolioId) {
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
        <Heading level={1}>Portfolio Details</Heading>
        <ErrorMessage error={error} onRetry={refetch} />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="space-y-8">
        <Heading level={1}>Portfolio Not Found</Heading>
        <Text className="mt-2">The portfolio you're looking for could not be found.</Text>
        <Link href="/portfolios">
          <Button>Back to Portfolios</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Heading level={1}>{portfolio.name}</Heading>
          <Text className="mt-2">
            Base Currency: <strong>{portfolio.base_currency}</strong>
            {portfolio.benchmark_symbol && (
              <> • Benchmark: <strong>{portfolio.benchmark_symbol}</strong></>
            )}
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/portfolios/${portfolio.id}/edit`}>
            <Button>
              <PencilIcon className="mr-2 size-4" />
              Edit
            </Button>
          </Link>
          <Button
            onClick={() => setDeleteDialogOpen(true)}
            className="bg-red-600 text-white hover:bg-red-500"
          >
            <TrashIcon className="mr-2 size-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <Text className="text-sm text-zinc-600 dark:text-zinc-400">Total Value</Text>
          <Heading level={2} className="mt-2">
            {totalValue.toLocaleString('en-US', {
              style: 'currency',
              currency: portfolio.base_currency,
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Heading>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <Text className="text-sm text-zinc-600 dark:text-zinc-400">Total Assets</Text>
          <Heading level={2} className="mt-2">{assetCount}</Heading>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <Text className="text-sm text-zinc-600 dark:text-zinc-400">Created</Text>
          <Text className="mt-2">
            {new Date(portfolio.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </div>
      </div>

      {/* Assets Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Heading level={2}>Assets</Heading>
          <div className="flex items-center gap-2">
            <Button outline onClick={() => setImportDialogOpen(true)}>
              <ArrowUpTrayIcon className="mr-2 size-4" />
              Import
            </Button>
            <Link href={`/portfolios/${portfolio.id}/assets/new`}>
              <Button>
                <PlusIcon className="mr-2 size-4" />
                Add Asset
              </Button>
            </Link>
          </div>
        </div>

        {assets.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <Text className="text-zinc-600 dark:text-zinc-400">No assets in this portfolio yet.</Text>
            <Link href={`/portfolios/${portfolio.id}/assets/new`}>
              <Button className="mt-4">
                <PlusIcon className="mr-2 size-4" />
                Add Your First Asset
              </Button>
            </Link>
          </div>
        ) : (
          <div className="rounded-lg bg-white shadow-xs ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Symbol</TableHeader>
                  <TableHeader>Type</TableHeader>
                  <TableHeader>Quantity</TableHeader>
                  <TableHeader>Avg. Buy Price</TableHeader>
                  <TableHeader>Value</TableHeader>
                  <TableHeader className="text-right">Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {assets.map((asset) => {
                  const quantity = typeof asset.quantity === 'number' 
                    ? asset.quantity 
                    : parseFloat(String(asset.quantity)) || 0;
                  const price = typeof asset.average_buy_price === 'number' 
                    ? asset.average_buy_price 
                    : parseFloat(String(asset.average_buy_price)) || 0;
                  const value = quantity * price;
                  const portfolioSlug = createSlug(portfolio.name);
                  const assetUrl = getAssetUrl(portfolioSlug, asset.symbol);

                  return (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{asset.symbol}</div>
                          {asset.name && (
                            <div className="text-sm text-zinc-600 dark:text-zinc-400">
                              {asset.name}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                          {asset.type}
                        </span>
                      </TableCell>
                      <TableCell>{quantity.toLocaleString('en-US', { maximumFractionDigits: 8 })}</TableCell>
                      <TableCell>
                        {price.toLocaleString('en-US', {
                          style: 'currency',
                          currency: asset.currency,
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>
                        {value.toLocaleString('en-US', {
                          style: 'currency',
                          currency: asset.currency,
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={assetUrl}>
                          <Button plain>View</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <DeletePortfolioDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        portfolio={{
          id: portfolio.id,
          name: portfolio.name,
        }}
      />

      {/* Import Dialog */}
      <ImportAssetsDialog
        portfolioId={portfolio.id}
        existingAssets={assets}
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onSuccess={(count) => {
          refetch();
        }}
      />
    </div>
  );
}

