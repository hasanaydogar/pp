'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { usePortfolio } from '@/lib/context/portfolio-context';
import { useCurrency } from '@/lib/context/currency-context';
import { Heading, Subheading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { ProjectionChart } from '@/components/projection/projection-chart';
import { ProjectionSettings } from '@/components/projection/projection-settings';
import { ProjectionTable } from '@/components/projection/projection-table';
import { ScenarioComparison } from '@/components/projection/scenario-comparison';
import { formatCurrency } from '@/lib/utils/currency';
import { 
  generateProjections, 
  generateScenarios, 
  generateScenarioChartData 
} from '@/lib/utils/projection';
import { DEFAULT_PORTFOLIO_SETTINGS, DEFAULT_PROJECTION_PERIODS } from '@/lib/types/portfolio-settings';
import { useLivePrices } from '@/lib/hooks/use-live-prices';
import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/20/solid';

interface ProjectionPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProjectionPage({ params }: ProjectionPageProps) {
  const [slug, setSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [portfolioId, setPortfolioId] = useState<string | null>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [cashValue, setCashValue] = useState(0);
  
  // Settings state
  const [monthlyInvestment, setMonthlyInvestment] = useState(DEFAULT_PORTFOLIO_SETTINGS.monthly_investment);
  const [expectedReturnRate, setExpectedReturnRate] = useState(DEFAULT_PORTFOLIO_SETTINGS.expected_return_rate);
  const [withdrawalRate, setWithdrawalRate] = useState(DEFAULT_PORTFOLIO_SETTINGS.withdrawal_rate);
  const [includeDividends, setIncludeDividends] = useState(DEFAULT_PORTFOLIO_SETTINGS.include_dividends_in_projection);
  const [showScenarios, setShowScenarios] = useState(true);
  
  const { setActivePortfolioId } = usePortfolio();
  const { currency } = useCurrency();
  
  // Get asset symbols for live price fetching
  const assetSymbols = useMemo(() => assets.map(a => a.symbol), [assets]);
  
  // Fetch live prices
  const { 
    prices: livePrices, 
    loading: pricesLoading, 
    refetch: refetchPrices,
    lastUpdated: pricesLastUpdated 
  } = useLivePrices(assetSymbols, currency || 'TRY');
  
  // Calculate current value using live prices
  const currentValue = useMemo(() => {
    const assetsValue = assets.reduce((sum: number, asset: any) => {
      const livePrice = livePrices[asset.symbol];
      const price = typeof livePrice === 'number' ? livePrice : Number(asset.average_buy_price); // Fallback to cost basis
      return sum + (Number(asset.quantity) * price);
    }, 0);
    return assetsValue + cashValue;
  }, [assets, livePrices, cashValue]);
  
  // Check if using fallback (cost basis) values
  const usingFallback = assetSymbols.length > 0 && Object.keys(livePrices).length === 0;

  // Get slug from params
  useEffect(() => {
    params.then(({ slug }) => setSlug(slug));
  }, [params]);

  // Fetch data
  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      setLoading(true);

      try {
        // Get portfolio by slug
        const portfolioRes = await fetch(`/api/portfolios/by-slug/${slug}`);
        if (!portfolioRes.ok) return;
        
        const portfolioData = await portfolioRes.json();
        const pid = portfolioData.data.id;
        setPortfolioId(pid);
        setActivePortfolioId(pid);

        // Store assets for live price calculation
        setAssets(portfolioData.data.assets || []);

        // Get cash positions
        const cashRes = await fetch(`/api/portfolios/${pid}/cash`);
        if (cashRes.ok) {
          const cashData = await cashRes.json();
          const totalCash = (cashData.data || []).reduce((sum: number, pos: any) => sum + Number(pos.amount), 0);
          setCashValue(totalCash);
        }

        // Get settings
        const settingsRes = await fetch(`/api/portfolios/${pid}/settings`);
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          const s = settingsData.data;
          setMonthlyInvestment(Number(s.monthly_investment) || 0);
          setExpectedReturnRate(Number(s.expected_return_rate) || 0.10);
          setWithdrawalRate(Number(s.withdrawal_rate) || 0.04);
          setIncludeDividends(s.include_dividends_in_projection ?? true);
        }
      } catch (err) {
        console.error('Error fetching projection data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, setActivePortfolioId]);

  // Save settings
  const saveSettings = async () => {
    if (!portfolioId) return;
    
    setSaving(true);
    try {
      await fetch(`/api/portfolios/${portfolioId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthly_investment: monthlyInvestment,
          expected_return_rate: expectedReturnRate,
          withdrawal_rate: withdrawalRate,
          include_dividends_in_projection: includeDividends,
        }),
      });
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  // Calculate projections
  const { projections, scenarios, chartData } = useMemo(() => {
    const projections = generateProjections(
      currentValue,
      monthlyInvestment,
      expectedReturnRate,
      withdrawalRate,
      DEFAULT_PROJECTION_PERIODS
    );

    const scenarios = generateScenarios(
      currentValue,
      monthlyInvestment,
      expectedReturnRate,
      withdrawalRate,
      DEFAULT_PROJECTION_PERIODS
    );

    const chartData = generateScenarioChartData(
      currentValue,
      monthlyInvestment,
      expectedReturnRate,
      25
    );

    return { projections, scenarios, chartData };
  }, [currentValue, monthlyInvestment, expectedReturnRate, withdrawalRate]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const displayCurrency = currency || 'TRY';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Heading level={1}>📈 Performans Projeksiyonu</Heading>
          <div className="flex items-center gap-3 mt-1">
            <Text>
              Mevcut Değer: <span className="font-semibold">{formatCurrency(currentValue, displayCurrency)}</span>
            </Text>
            {/* Price refresh indicator */}
            <button
              onClick={() => refetchPrices()}
              disabled={pricesLoading}
              className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              title="Fiyatları yenile"
            >
              <ArrowPathIcon className={`h-3.5 w-3.5 ${pricesLoading ? 'animate-spin' : ''}`} />
              {pricesLastUpdated && (
                <span>{new Date(pricesLastUpdated).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
              )}
            </button>
          </div>
          {/* Fallback warning */}
          {usingFallback && !pricesLoading && (
            <div className="flex items-center gap-1 mt-1 text-xs text-amber-600 dark:text-amber-400">
              <ExclamationTriangleIcon className="h-3.5 w-3.5" />
              <span>Maliyet bazlı (fiyat alınamadı)</span>
            </div>
          )}
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
        </Button>
      </div>

      {/* Settings Panel */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
        <Subheading className="mb-4">Projeksiyon Ayarları</Subheading>
        <ProjectionSettings
          monthlyInvestment={monthlyInvestment}
          expectedReturnRate={expectedReturnRate}
          withdrawalRate={withdrawalRate}
          includeDividends={includeDividends}
          onMonthlyInvestmentChange={setMonthlyInvestment}
          onExpectedReturnRateChange={setExpectedReturnRate}
          onWithdrawalRateChange={setWithdrawalRate}
          onIncludeDividendsChange={setIncludeDividends}
          currency={displayCurrency}
        />
      </div>

      {/* Chart */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
        <div className="flex items-center justify-between mb-4">
          <Subheading>Büyüme Grafiği</Subheading>
          <label className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <Switch checked={showScenarios} onChange={setShowScenarios} />
            Senaryoları Göster
          </label>
        </div>
        <ProjectionChart
          data={chartData}
          showScenarios={showScenarios}
          currency={displayCurrency}
        />
      </div>

      {/* Table */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
        <Subheading className="mb-4">Projeksiyon Tablosu</Subheading>
        <ProjectionTable
          projections={projections}
          currency={displayCurrency}
        />
      </div>

      {/* Scenario Comparison */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
        <ScenarioComparison
          scenarios={scenarios}
          targetYears={20}
          currency={displayCurrency}
          baseRate={expectedReturnRate}
        />
      </div>
    </div>
  );
}
