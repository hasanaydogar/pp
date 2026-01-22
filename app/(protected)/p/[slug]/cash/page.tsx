'use client';

import React, { useState, useEffect } from 'react';
import { usePortfolio } from '@/lib/context/portfolio-context';
import { useCurrency } from '@/lib/context/currency-context';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { PlusIcon, BanknotesIcon, CalendarDaysIcon, ChartBarIcon } from '@heroicons/react/20/solid';
import { CashSummaryCards } from '@/components/cash/cash-summary-cards';
import { CashTransactionDialog } from '@/components/cash/cash-transaction-dialog';
import { CashTransactionsList } from '@/components/cash/cash-transactions-list';
import { CashFlowChart } from '@/components/cash/cash-flow-chart';
import { PeriodPicker } from '@/components/cash/period-picker';
import { DividendDialog } from '@/components/dividends/dividend-dialog';
import { DividendForecastDialog } from '@/components/dividends/dividend-forecast-dialog';
import { DividendCalendar } from '@/components/dividends/dividend-calendar';
import { DividendCalendarView } from '@/components/dividends/dividend-calendar-view';
import { UpcomingDividends } from '@/components/dividends/upcoming-dividends';
import { ConfirmDividendDialog } from '@/components/dividends/confirm-dividend-dialog';
import { PendingDividendsBanner } from '@/components/dividends/pending-dividends-banner';
import { CashTransaction, CashTransactionType } from '@/lib/types/cash';
import { DividendSummary, ReinvestStrategy } from '@/lib/types/dividend';
import { useCashFlow } from '@/lib/hooks/use-cash-flow';
import { useDividendCalendar } from '@/lib/hooks/use-dividend-calendar';
import { useLastVisitedPortfolio } from '@/lib/hooks/use-last-visited-portfolio';
import { Period, formatPeriodLabel } from '@/lib/utils/period';

// Type for pending dividends
interface PendingDividend {
  id: string;
  assetId: string;
  symbol: string;
  grossAmount: number;
  taxAmount: number;
  netAmount: number;
  currency: string;
  paymentDate: string;
  daysOverdue: number;
  notes?: string;
}

interface CashPageProps {
  params: Promise<{ slug: string }>;
}

export default function CashPage({ params }: CashPageProps) {
  useLastVisitedPortfolio();

  const [slug, setSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [portfolioId, setPortfolioId] = useState<string | null>(null);
  const [cashBalance, setCashBalance] = useState(0);
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [dividendSummary, setDividendSummary] = useState<DividendSummary | null>(null);
  const [assets, setAssets] = useState<{ id: string; symbol: string; quantity?: number }[]>([]);
  
  const [showCashDialog, setShowCashDialog] = useState(false);
  const [showDividendDialog, setShowDividendDialog] = useState(false);
  const [showForecastDialog, setShowForecastDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedPendingDividend, setSelectedPendingDividend] = useState<PendingDividend | null>(null);
  const [pendingDividends, setPendingDividends] = useState<PendingDividend[]>([]);
  const [cashFlowPeriod, setCashFlowPeriod] = useState<Period>('30d');
  const [activeTab, setActiveTab] = useState<'transactions' | 'calendar'>('transactions');
  
  const { portfolios, setActivePortfolioId } = usePortfolio();
  const { currency } = useCurrency();
  
  // New hooks for enhanced data
  const { data: cashFlowData, summary: cashFlowSummary, loading: cashFlowLoading } = useCashFlow(portfolioId, cashFlowPeriod);
  const { upcoming: upcomingDividends, byMonth: dividendsByMonth, totalExpected90Days, loading: dividendCalendarLoading } = useDividendCalendar(portfolioId);

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
        setAssets(portfolioData.data.assets?.map((a: any) => ({ id: a.id, symbol: a.symbol, quantity: a.quantity || 0 })) || []);

        // Fetch cash positions
        let cashPositions: any[] = [];
        const cashRes = await fetch(`/api/portfolios/${pid}/cash`);
        if (cashRes.ok) {
          const cashData = await cashRes.json();
          // API returns array directly, not wrapped in { data: ... }
          cashPositions = Array.isArray(cashData) ? cashData : (cashData.data || []);
          const total = cashPositions.reduce((sum: number, pos: any) => sum + Number(pos.amount), 0);
          setCashBalance(total);
        }

        // Fetch dividend summary
        const divRes = await fetch(`/api/portfolios/${pid}/dividends/summary`);
        if (divRes.ok) {
          const divData = await divRes.json();
          setDividendSummary(divData.data);
        }

        // Fetch recent cash transactions from all positions
        if (cashPositions.length > 0) {
          // Get transactions from the first (main) position
          const mainCurrency = cashPositions[0]?.currency || 'TRY';
          const txRes = await fetch(`/api/portfolios/${pid}/cash/${mainCurrency}/transactions?limit=20`);
          if (txRes.ok) {
            const txData = await txRes.json();
            setTransactions(txData.data || []);
          }
        }

        // Trigger auto-record for dividends
        try {
          await fetch(`/api/dividends/auto-record?portfolioId=${pid}`, { method: 'POST' });
        } catch (err) {
          // Silent fail - auto-record is optional
        }

        // Fetch pending dividends (forecasts that are due)
        try {
          const pendingRes = await fetch(`/api/dividends/pending?portfolioId=${pid}`);
          if (pendingRes.ok) {
            const pendingData = await pendingRes.json();
            setPendingDividends(pendingData.data || []);
          }
        } catch (err) {
          console.error('Error fetching pending dividends:', err);
        }
      } catch (err) {
        console.error('Error fetching cash data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, setActivePortfolioId]);

  const handleCashSubmit = async (data: {
    type: CashTransactionType;
    amount: number;
    date: string;
    notes?: string;
  }) => {
    if (!portfolioId) return;
    
    // Get or create cash position for base currency
    const portfolio = portfolios.find(p => p.id === portfolioId);
    const baseCurrency = portfolio?.base_currency || 'TRY';
    
    // First, ensure we have a cash position
    const cashRes = await fetch(`/api/portfolios/${portfolioId}/cash`);
    const cashData = await cashRes.json();
    // API returns array directly, not wrapped in { data: ... }
    let positionId = Array.isArray(cashData) ? cashData[0]?.id : cashData.data?.[0]?.id;
    
    if (!positionId) {
      // Create cash position
      const createRes = await fetch(`/api/portfolios/${portfolioId}/cash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: baseCurrency, amount: 0 }),
      });
      
      if (!createRes.ok) {
        console.error('Failed to create cash position');
        return;
      }
      
      const created = await createRes.json();
      // API returns object directly, not wrapped in { data: ... }
      positionId = created?.id || created.data?.id;
      
      if (!positionId) {
        console.error('Cash position creation returned no ID');
        return;
      }
    }
    
    // Add transaction
    const txRes = await fetch(`/api/portfolios/${portfolioId}/cash/${baseCurrency}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!txRes.ok) {
      const errorData = await txRes.json();
      console.error('Failed to create transaction:', errorData);
      return;
    }
    
    // Refresh data
    window.location.reload();
  };

  const handleDividendSubmit = async (data: {
    asset_id: string;
    gross_amount: number;
    tax_amount: number;
    payment_date: string;
    reinvest_strategy: ReinvestStrategy;
    notes?: string;
  }) => {
    if (!portfolioId) {
      console.error('portfolioId is missing');
      return;
    }
    
    console.log('Submitting dividend:', { portfolioId, data });
    
    const response = await fetch(`/api/portfolios/${portfolioId}/dividends`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    console.log('Dividend API response:', response.status, result);
    
    if (!response.ok) {
      console.error('Failed to create dividend:', result);
      throw new Error(result.error || 'Failed to create dividend');
    }
    
    // Refresh data
    window.location.reload();
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!portfolioId) return;
    
    const response = await fetch(
      `/api/portfolios/${portfolioId}/cash/${displayCurrency}/transactions?transactionId=${transactionId}`,
      { method: 'DELETE' }
    );
    
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'İşlem silinemedi');
    }
    
    // Refresh data
    window.location.reload();
  };

  const handleForecastSubmit = async (data: {
    asset_id: string;
    per_share_amount: number;
    expected_payment_date: string;
    tax_rate: number;
    notes?: string;
  }) => {
    const response = await fetch('/api/dividends/forecast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Beklenti eklenemedi');
    }

    // Refresh data
    window.location.reload();
  };

  const handleDeleteForecast = async (forecastId: string) => {
    const response = await fetch(`/api/dividends/forecast?id=${forecastId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Beklenti silinemedi');
    }

    // Refresh data
    window.location.reload();
  };

  const handleReviewPendingDividend = (dividend: PendingDividend) => {
    setSelectedPendingDividend(dividend);
    setShowConfirmDialog(true);
  };

  const handleConfirmDividend = async (data: {
    dividend_id: string;
    actual_gross_amount: number;
    actual_tax_amount: number;
    actual_payment_date?: string;
    notes?: string;
  }) => {
    const response = await fetch('/api/dividends/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Temettü onaylanamadı');
    }

    // Refresh data
    window.location.reload();
  };

  const handleDismissDividend = async (dividendId: string) => {
    const response = await fetch(`/api/dividends/confirm?id=${dividendId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Beklenti iptal edilemedi');
    }

    // Refresh data
    window.location.reload();
  };

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
      {/* Pending Dividends Banner */}
      {pendingDividends.length > 0 && (
        <PendingDividendsBanner
          pendingDividends={pendingDividends}
          onReviewClick={handleReviewPendingDividend}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Heading level={1}>💰 Nakit ve Temettü</Heading>
          <Text className="mt-1">Nakit hareketleri ve temettü takibi</Text>
        </div>
        <div className="flex items-center gap-3">
          <PeriodPicker
            value={cashFlowPeriod}
            onChange={setCashFlowPeriod}
          />
          <div className="flex gap-2">
            <Button onClick={() => setShowCashDialog(true)}>
              <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
              Nakit Ekle
            </Button>
            <Button onClick={() => setShowDividendDialog(true)} color="green">
              <BanknotesIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
              Temettü Kaydet
            </Button>
            <Button onClick={() => setShowForecastDialog(true)} outline>
              <CalendarDaysIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
              Beklenti Ekle
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards - Enhanced */}
      <CashSummaryCards
        currentBalance={cashBalance}
        summary={cashFlowSummary}
        expectedDividend90Days={totalExpected90Days}
        currency={displayCurrency}
        periodLabel={formatPeriodLabel(cashFlowPeriod)}
      />

      {/* Cash Flow Chart */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
          Nakit Akış Grafiği
        </h2>
        {cashFlowLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="md" />
          </div>
        ) : (
          <CashFlowChart
            data={cashFlowData}
            period={cashFlowPeriod}
            currency={displayCurrency}
            onPeriodChange={setCashFlowPeriod}
            height={280}
          />
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Cash Transactions */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
            Son Nakit Hareketleri
          </h2>
          <CashTransactionsList
            transactions={transactions}
            currency={displayCurrency}
            onDelete={handleDeleteTransaction}
          />
        </div>

        {/* Upcoming Dividends & Calendar */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Temettü Takvimi
            </h2>
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  activeTab === 'transactions'
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                <ChartBarIcon className="h-4 w-4 inline mr-1" />
                Liste
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  activeTab === 'calendar'
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                <CalendarDaysIcon className="h-4 w-4 inline mr-1" />
                Takvim
              </button>
            </div>
          </div>
          
          {dividendCalendarLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="md" />
            </div>
          ) : activeTab === 'transactions' ? (
            <UpcomingDividends
              dividends={upcomingDividends}
              currency={displayCurrency}
              maxItems={5}
              onDeleteForecast={handleDeleteForecast}
            />
          ) : (
            <DividendCalendarView
              byMonth={dividendsByMonth}
              currency={displayCurrency}
            />
          )}
        </div>
      </div>

      {/* Dialogs */}
      <CashTransactionDialog
        isOpen={showCashDialog}
        onClose={() => setShowCashDialog(false)}
        onSubmit={handleCashSubmit}
        currency={displayCurrency}
      />

      <DividendDialog
        isOpen={showDividendDialog}
        onClose={() => setShowDividendDialog(false)}
        onSubmit={handleDividendSubmit}
        assets={assets}
        currency={displayCurrency}
      />

      <DividendForecastDialog
        isOpen={showForecastDialog}
        onClose={() => setShowForecastDialog(false)}
        onSubmit={handleForecastSubmit}
        assets={assets}
        currency={displayCurrency}
      />

      <ConfirmDividendDialog
        isOpen={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false);
          setSelectedPendingDividend(null);
        }}
        dividend={selectedPendingDividend}
        onConfirm={handleConfirmDividend}
        onDismiss={handleDismissDividend}
      />
    </div>
  );
}
