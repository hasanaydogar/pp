import { Heading, Subheading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { getPortfolios, getPortfolioAssets, getPortfolioWithDetails } from '@/lib/api/server';
import { cookies } from 'next/headers';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import { ErrorMessage } from '@/components/ui/error-message';
import clsx from 'clsx';
import Link from 'next/link';

export default async function DashboardContent() {
  let portfolios: Awaited<ReturnType<typeof getPortfolios>> = [];
  let assets: Awaited<ReturnType<typeof getPortfolioAssets>> = [];
  let portfolio: Awaited<ReturnType<typeof getPortfolioWithDetails>> | null = null;
  let error: Error | null = null;

  // Get active portfolio ID from cookies (Next.js 16 requires await)
  const cookieStore = await cookies();

  try {
    portfolios = await getPortfolios();
    const activePortfolioId = cookieStore.get('activePortfolioId')?.value || (portfolios.length > 0 ? portfolios[0].id : null);
    
    if (!activePortfolioId) {
      // No portfolios yet
      portfolios = [];
      assets = [];
    } else {
      // Fetch data for active portfolio
      portfolio = await getPortfolioWithDetails(activePortfolioId);
      assets = await getPortfolioAssets(activePortfolioId);
    }
  } catch (err) {
    error = err instanceof Error ? err : new Error('Failed to load dashboard data');
  }

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
  
  // Get active portfolio (already fetched above in try block)
  const activePortfolioId = cookieStore.get('activePortfolioId')?.value || (portfolios.length > 0 ? portfolios[0].id : null);
  const activePortfolio = portfolios.find(p => p.id === activePortfolioId);

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
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
            ${totalGainLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            {totalGainLossPercentage !== 0 && ` (${totalGainLossPercentage.toFixed(2)}%)`}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-xs ring-1 ring-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900 dark:ring-white/10">
          <Subheading level={3}>Base Currency</Subheading>
          <p className="mt-2 text-3xl font-bold text-zinc-950 dark:text-white">
            {activePortfolio?.base_currency || 'N/A'}
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
                {topAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <Link href={`/assets/${asset.id}`} className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                        {asset.symbol}
                      </Link>
                    </TableCell>
                    <TableCell>{asset.name}</TableCell>
                    <TableCell>{asset.type}</TableCell>
                    <TableCell className="text-right">
                      ${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell
                      className={clsx(
                        'text-right',
                        asset.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {asset.gainLoss >= 0 ? '+' : ''}
                      ${asset.gainLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      {asset.gainLossPercentage !== 0 && ` (${asset.gainLossPercentage.toFixed(2)}%)`}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/assets/${asset.id}/transactions/new?type=BUY`}>
                          <Button plain className="text-green-600 hover:text-green-700 dark:text-green-400">
                            <ArrowUpIcon className="mr-1 size-4" />
                            Buy
                          </Button>
                        </Link>
                        <Link href={`/assets/${asset.id}/transactions/new?type=SELL`}>
                          <Button plain className="text-red-600 hover:text-red-700 dark:text-red-400">
                            <ArrowDownIcon className="mr-1 size-4" />
                            Sell
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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

