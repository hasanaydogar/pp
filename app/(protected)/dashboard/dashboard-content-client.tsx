'use client';

import { Heading, Subheading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import { ErrorMessage } from '@/components/ui/error-message';
import clsx from 'clsx';
import Link from 'next/link';
import { usePortfolio } from '@/lib/context/portfolio-context';
import { useCurrency } from '@/lib/context/currency-context';
import { useAssets } from '@/lib/hooks/use-assets';
import { formatCurrency } from '@/lib/utils/currency';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { createSlug, getAssetUrl } from '@/lib/utils/slug';

export default function DashboardContentClient() {
  const { activePortfolioId, portfolios } = usePortfolio();
  const { currency } = useCurrency();
  const { assets, loading, error } = useAssets({ portfolioId: activePortfolioId || undefined });
  
  const activePortfolio = portfolios.find(p => p.id === activePortfolioId);

  // Calculate metrics for active portfolio
  const totalAssets = assets.length;
  
  // Calculate total value (sum of all asset values: quantity * average_buy_price)
  const totalValue = assets.reduce((sum, asset) => {
    return sum + Number(asset.quantity) * Number(asset.average_buy_price);
  }, 0);

  // Calculate total gain/loss (simplified - in real app would use current prices)
  // For now, we'll show 0 as we don't have current prices
  const totalGainLoss: number = 0;
  const totalGainLossPercentage: number = 0;

  if (loading) {
    return (
      <div className="space-y-8">
        <Heading level={1}>Dashboard</Heading>
        <Text>Loading...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <Heading level={1}>Dashboard</Heading>
        <ErrorMessage error={error} />
      </div>
    );
  }

  // Get top assets by value
  const topAssets = assets
    .map((asset) => ({
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name || asset.symbol,
      value: Number(asset.quantity) * Number(asset.average_buy_price),
      gainLoss: 0, // Would calculate from current price
      gainLossPercentage: 0,
      type: asset.type,
      currency: asset.currency,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <Heading level={1}>Dashboard</Heading>
        <Text>
          {activePortfolio 
            ? `Viewing portfolio: ${activePortfolio.name}` 
            : 'Welcome to your portfolio dashboard!'}
        </Text>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-xs ring-1 ring-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900 dark:ring-white/10">
          <Subheading level={3}>Total Portfolio Value</Subheading>
          <p className="mt-2 text-3xl font-bold text-zinc-950 dark:text-white">
            <CurrencyDisplay 
              amount={totalValue} 
              currency="USD" 
              format="converted-only"
            />
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-xs ring-1 ring-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900 dark:ring-white/10">
          <Subheading level={3}>Total Gain/Loss</Subheading>
          <p
            className={clsx(
              'mt-2 text-3xl font-bold',
              totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
            )}
          >
            {totalGainLoss >= 0 ? <ArrowTrendingUpIcon className="inline-block size-6 mr-2" /> : <ArrowTrendingDownIcon className="inline-block size-6 mr-2" />}
            <CurrencyDisplay 
              amount={Math.abs(totalGainLoss)} 
              currency="USD" 
              format="converted-only"
            />
            {totalGainLossPercentage !== 0 && ` (${totalGainLossPercentage.toFixed(2)}%)`}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-xs ring-1 ring-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900 dark:ring-white/10">
          <Subheading level={3}>Display Currency</Subheading>
          <p className="mt-2 text-3xl font-bold text-zinc-950 dark:text-white">
            {currency}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-xs ring-1 ring-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900 dark:ring-white/10">
          <Subheading level={3}>Total Unique Assets</Subheading>
          <p className="mt-2 text-3xl font-bold text-zinc-950 dark:text-white">
            {totalAssets}
          </p>
        </div>
      </div>

      {topAssets.length > 0 && (
        <div className="mt-8">
          <Heading level={2}>Top Assets</Heading>
          <Text className="mt-2">Your assets by value.</Text>
          <div className="mt-4 rounded-lg bg-white shadow-xs ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Symbol</TableHeader>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Type</TableHeader>
                  <TableHeader className="text-right">Current Value</TableHeader>
                  <TableHeader className="text-right">Gain/Loss</TableHeader>
                  <TableHeader className="text-right">Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {topAssets.map((asset) => {
                  const portfolioSlug = activePortfolio ? createSlug(activePortfolio.name) : '';
                  const assetUrl = portfolioSlug ? getAssetUrl(portfolioSlug, asset.symbol) : `/assets/${asset.id}`;
                  
                  return (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <Link href={assetUrl} className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                          {asset.symbol}
                        </Link>
                      </TableCell>
                      <TableCell>{asset.name}</TableCell>
                      <TableCell>{asset.type}</TableCell>
                      <TableCell className="text-right">
                        <CurrencyDisplay 
                          amount={asset.value} 
                          currency={asset.currency}
                          format="inline"
                        />
                      </TableCell>
                      <TableCell
                        className={clsx(
                          'text-right',
                          asset.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                        )}
                      >
                        {asset.gainLoss >= 0 ? '+' : ''}
                        <CurrencyDisplay 
                          amount={Math.abs(asset.gainLoss)} 
                          currency={asset.currency}
                          format="converted-only"
                        />
                        {asset.gainLossPercentage !== 0 && ` (${asset.gainLossPercentage.toFixed(2)}%)`}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`${assetUrl}/transactions/new?type=BUY`}>
                            <Button plain className="text-green-600 hover:text-green-700 dark:text-green-400">
                              <ArrowUpIcon className="mr-1 size-4" />
                              Buy
                            </Button>
                          </Link>
                          <Link href={`${assetUrl}/transactions/new?type=SELL`}>
                            <Button plain className="text-red-600 hover:text-red-700 dark:text-red-400">
                              <ArrowDownIcon className="mr-1 size-4" />
                              Sell
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {portfolios.length === 0 && (
        <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <Heading level={2}>No Portfolios Yet</Heading>
          <Text className="mt-2">Get started by creating your first portfolio.</Text>
          <Link
            href="/portfolios/new"
            className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Create Portfolio
          </Link>
        </div>
      )}
      
      {portfolios.length > 0 && !activePortfolioId && (
        <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <Heading level={2}>No Active Portfolio</Heading>
          <Text className="mt-2">Please select a portfolio from the dropdown above.</Text>
        </div>
      )}
    </div>
  );
}
