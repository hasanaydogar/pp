'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/20/solid';
import { usePortfolio } from '@/lib/context/portfolio-context';
import { useCurrency } from '@/lib/context/currency-context';
import { useLivePrices } from '@/lib/hooks/use-live-prices';
import { usePerformance } from '@/lib/hooks/use-performance';
import { PortfolioSummaryCards } from '@/components/portfolio/portfolio-summary-cards';
import { AssetDistributionBar } from '@/components/portfolio/asset-distribution-bar';
import { SortableAssetsTable } from '@/components/portfolio/sortable-assets-table';
import { PerformanceChart } from '@/components/portfolio/performance-chart';
import { PerformanceSummary } from '@/components/portfolio/performance-summary';
import { PeriodSelector } from '@/components/portfolio/period-selector';
import { BackfillButton } from '@/components/portfolio/backfill-button';
import { SortColumn, SortDirection } from '@/lib/types/asset-metrics';
import { Period } from '@/lib/types/snapshot';
import { PortfolioPolicy, PolicyViolation, DEFAULT_POLICY } from '@/lib/types/policy';
import { calculateAssetMetrics, sortAssets } from '@/lib/utils/asset-sorting';
import { createSnapshot } from '@/lib/services/snapshot-service';
import { LivePrice } from '@/lib/types/price';
import clsx from 'clsx';

interface PortfolioDashboardPageProps {
  params: Promise<{ slug: string }>;
}

export default function PortfolioDashboardPage({ params }: PortfolioDashboardPageProps) {
  const [slug, setSlug] = React.useState<string | null>(null);
  const [portfolio, setPortfolio] = React.useState<any>(null);
  const [assets, setAssets] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  // Policy state
  const [policy, setPolicy] = React.useState<PortfolioPolicy | null>(null);
  const [violations, setViolations] = React.useState<PolicyViolation[]>([]);
  const [cashAmount, setCashAmount] = React.useState(0);
  
  // Sorting state
  const [sortColumn, setSortColumn] = useState<SortColumn>('weight');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Performance period state
  const [performancePeriod, setPerformancePeriod] = useState<Period>('30d');
  
  const { setActivePortfolioId } = usePortfolio();
  const { currency } = useCurrency();
  
  // Extract symbols for live price fetching
  const symbols = useMemo(() => assets.map(a => a.symbol), [assets]);
  const baseCurrency = portfolio?.base_currency || 'TRY';
  
  // Fetch live prices for all assets
  const { 
    prices: livePrices, 
    loading: pricesLoading, 
    refetch: refetchPrices,
    lastUpdated: pricesLastUpdated 
  } = useLivePrices(symbols, baseCurrency, {
    enabled: symbols.length > 0 && !loading,
    refreshInterval: 60000, // Auto-refresh every minute
  });
  
  // Fetch performance data
  const {
    snapshots,
    summary: performanceSummary,
    loading: performanceLoading,
    refetch: refetchPerformance,
  } = usePerformance(portfolio?.id || null, performancePeriod);

  // Get slug from params
  React.useEffect(() => {
    params.then(({ slug }) => setSlug(slug));
  }, [params]);

  // Fetch portfolio data when slug changes
  React.useEffect(() => {
    if (!slug) return;

    const fetchPortfolioData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch portfolio with assets
        const response = await fetch(`/api/portfolios/by-slug/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Portfolio not found');
          } else {
            setError('Failed to load portfolio');
          }
          return;
        }

        const result = await response.json();
        const portfolioData = result.data;
        setPortfolio(portfolioData);
        setAssets(portfolioData.assets || []);
        
        // Set as active portfolio in context
        if (portfolioData.id) {
          setActivePortfolioId(portfolioData.id);
          
          // Fetch policy
          try {
            const policyRes = await fetch(`/api/portfolios/${portfolioData.id}/policy`);
            if (policyRes.ok) {
              const policyData = await policyRes.json();
              setPolicy(policyData.data);
            }
          } catch (e) {
            console.error('Error fetching policy:', e);
          }
          
          // Fetch cash positions
          try {
            const cashRes = await fetch(`/api/portfolios/${portfolioData.id}/cash`);
            if (cashRes.ok) {
              const cashData = await cashRes.json();
              const totalCash = (cashData.data || []).reduce((sum: number, pos: any) => {
                return sum + Number(pos.amount || 0);
              }, 0);
              setCashAmount(totalCash);
            }
          } catch (e) {
            console.error('Error fetching cash:', e);
          }
          
          // Fetch violations
          try {
            const violationsRes = await fetch(`/api/portfolios/${portfolioData.id}/violations`);
            if (violationsRes.ok) {
              const violationsData = await violationsRes.json();
              setViolations(violationsData.data || []);
            }
          } catch (e) {
            console.error('Error fetching violations:', e);
          }
        }
      } catch (err) {
        setError('Failed to load portfolio');
        console.error('Error fetching portfolio:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [slug, setActivePortfolioId]);

  // Handle sort
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // Convert live prices to full LivePrice map for daily change data
  const livePriceMap = useMemo(() => {
    const map: Record<string, LivePrice> = {};
    Object.entries(livePrices).forEach(([symbol, priceData]) => {
      map[symbol] = priceData;
    });
    return map;
  }, [livePrices]);

  // Calculate metrics and sort assets
  const { assetsWithMetrics, totalValue, totalCostBasis, cashPercent, dailyChange, dailyChangePercent } = useMemo(() => {
    // Calculate metrics for each asset with live prices
    const withMetrics = calculateAssetMetrics(assets, 0, policy, livePriceMap);
    
    // Calculate totals
    const totalAssetsValue = withMetrics.reduce((sum, a) => sum + a.currentValue, 0);
    const totalCostBasis = withMetrics.reduce((sum, a) => sum + a.costBasis, 0);
    const totalValue = totalAssetsValue + cashAmount;
    const cashPercent = totalValue > 0 ? cashAmount / totalValue : 0;
    
    // Recalculate weights with cash included
    const assetsWithCorrectWeights = withMetrics.map(asset => ({
      ...asset,
      weight: totalValue > 0 ? asset.currentValue / totalValue : 0,
    }));
    
    // Sort
    const sorted = sortAssets(assetsWithCorrectWeights, sortColumn, sortDirection);
    
    // Calculate daily change from live prices
    let dailyChange = 0;
    let previousTotal = 0;
    
    Object.entries(livePrices).forEach(([symbol, priceData]) => {
      const asset = assets.find(a => a.symbol === symbol);
      if (asset && priceData.change !== undefined) {
        dailyChange += priceData.change * Number(asset.quantity);
        previousTotal += priceData.previousClose * Number(asset.quantity);
      }
    });
    
    const dailyChangePercent = previousTotal > 0 ? (dailyChange / previousTotal) * 100 : 0;
    
    return {
      assetsWithMetrics: sorted,
      totalValue,
      totalAssetsValue,
      totalCostBasis,
      cashPercent,
      dailyChange,
      dailyChangePercent,
    };
  }, [assets, cashAmount, policy, livePriceMap, livePrices, sortColumn, sortDirection]);

  // Create snapshot when we have valid data
  // Note: dailyChange is calculated server-side based on previous snapshot
  useEffect(() => {
    if (portfolio?.id && totalValue > 0 && !pricesLoading) {
      const assetsValue = totalValue - cashAmount;
      createSnapshot({
        portfolioId: portfolio.id,
        totalValue,
        assetsValue,
        cashValue: cashAmount,
        // Don't send dailyChange - API calculates it from previous snapshot
      }).then(() => {
        // Refetch performance data after snapshot created
        refetchPerformance();
      });
    }
  }, [portfolio?.id, totalValue, cashAmount, pricesLoading]);

  if (!slug) {
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
        <Heading level={1}>Portfolio</Heading>
        <ErrorMessage error={error} />
        <Link href="/portfolios">
          <Button>Back to Portfolios</Button>
        </Link>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="space-y-8">
        <Heading level={1}>Portfolio Not Found</Heading>
        <Text>The portfolio you're looking for could not be found.</Text>
        <Link href="/portfolios">
          <Button>Back to Portfolios</Button>
        </Link>
      </div>
    );
  }

  const displayCurrency = currency || portfolio.base_currency || 'USD';
  const p = policy || DEFAULT_POLICY;
  const hasLivePrices = Object.keys(livePrices).length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Heading level={1}>{portfolio.name}</Heading>
          {portfolio.description && (
            <Text className="mt-1">{portfolio.description}</Text>
          )}
        </div>
        
        {/* Price refresh indicator */}
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          {pricesLoading && (
            <span className="flex items-center gap-1">
              <Spinner size="sm" />
              Fiyatlar güncelleniyor...
            </span>
          )}
          {!pricesLoading && pricesLastUpdated && (
            <button
              onClick={() => refetchPrices()}
              className="flex items-center gap-1 hover:text-zinc-700 dark:hover:text-zinc-200"
              title="Fiyatları yenile"
            >
              <ArrowPathIcon className={clsx('h-4 w-4', pricesLoading && 'animate-spin')} />
              {pricesLastUpdated.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </button>
          )}
          {!hasLivePrices && !pricesLoading && assets.length > 0 && (
            <span className="text-amber-600 dark:text-amber-400">
              Maliyet bazlı (fiyat alınamadı)
            </span>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <PortfolioSummaryCards
        totalValue={totalValue}
        dailyChange={dailyChange}
        dailyChangePercent={dailyChangePercent}
        cashAmount={cashAmount}
        cashPercent={cashPercent}
        cashTarget={p.cash_target_percent}
        policyViolations={violations}
        assetCount={assets.length}
        displayCurrency={displayCurrency}
      />

      {/* Performance Summary */}
      <PerformanceSummary
        summary={performanceSummary}
        todayChange={dailyChange}
        todayChangePercent={dailyChangePercent}
        period={performancePeriod}
        currency={displayCurrency}
      />

      {/* Performance Chart */}
      <div className="rounded-lg bg-white p-4 shadow ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-zinc-900 dark:text-white">
            Portföy Performansı
          </h3>
          <div className="flex items-center gap-2">
            <BackfillButton portfolioId={portfolio.id} />
            <PeriodSelector
              value={performancePeriod}
              onChange={setPerformancePeriod}
              size="sm"
            />
          </div>
        </div>
        {performanceLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Spinner size="md" />
          </div>
        ) : (
          <PerformanceChart
            snapshots={snapshots}
            period={performancePeriod}
            currency={displayCurrency}
          />
        )}
      </div>

      {/* Asset Distribution Bar */}
      {assetsWithMetrics.length > 0 && (
        <div className="rounded-lg bg-white p-4 shadow ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
          <h3 className="mb-3 text-sm font-medium text-zinc-900 dark:text-white">
            Varlık Dağılımı
          </h3>
          <AssetDistributionBar
            assets={assetsWithMetrics}
            totalValue={totalValue}
            displayCurrency={displayCurrency}
          />
        </div>
      )}

      {/* Assets Table Header */}
      <div className="flex items-center justify-between">
        <Heading level={2}>Varlıklar ({assets.length})</Heading>
        <Link href={`/p/${slug}/assets/new`}>
          <Button>
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Varlık Ekle
          </Button>
        </Link>
      </div>

      {/* Sortable Assets Table */}
      <SortableAssetsTable
        assets={assetsWithMetrics}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        policy={policy}
        slug={slug}
        displayCurrency={displayCurrency}
      />
    </div>
  );
}
