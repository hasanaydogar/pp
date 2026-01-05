'use client';

import React, { useState, useEffect } from 'react';
import { usePortfolio } from '@/lib/context/portfolio-context';
import { useCurrency } from '@/lib/context/currency-context';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { PlusIcon, BanknotesIcon } from '@heroicons/react/20/solid';
import { CashSummaryCards } from '@/components/cash/cash-summary-cards';
import { CashTransactionDialog } from '@/components/cash/cash-transaction-dialog';
import { CashTransactionsList } from '@/components/cash/cash-transactions-list';
import { DividendDialog } from '@/components/dividends/dividend-dialog';
import { DividendCalendar } from '@/components/dividends/dividend-calendar';
import { CashTransaction, CashTransactionType } from '@/lib/types/cash';
import { DividendSummary, ReinvestStrategy } from '@/lib/types/dividend';

interface CashPageProps {
  params: Promise<{ slug: string }>;
}

export default function CashPage({ params }: CashPageProps) {
  const [slug, setSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [portfolioId, setPortfolioId] = useState<string | null>(null);
  const [cashBalance, setCashBalance] = useState(0);
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [dividendSummary, setDividendSummary] = useState<DividendSummary | null>(null);
  const [assets, setAssets] = useState<{ id: string; symbol: string }[]>([]);
  
  const [showCashDialog, setShowCashDialog] = useState(false);
  const [showDividendDialog, setShowDividendDialog] = useState(false);
  
  const { portfolios, setActivePortfolioId } = usePortfolio();
  const { currency } = useCurrency();

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
        setAssets(portfolioData.data.assets?.map((a: any) => ({ id: a.id, symbol: a.symbol })) || []);

        // Fetch cash positions
        const cashRes = await fetch(`/api/portfolios/${pid}/cash`);
        if (cashRes.ok) {
          const cashData = await cashRes.json();
          const total = (cashData.data || []).reduce((sum: number, pos: any) => sum + Number(pos.amount), 0);
          setCashBalance(total);
        }

        // Fetch dividend summary
        const divRes = await fetch(`/api/portfolios/${pid}/dividends/summary`);
        if (divRes.ok) {
          const divData = await divRes.json();
          setDividendSummary(divData.data);
        }

        // Fetch recent cash transactions (simplified - would need proper API)
        // For now, we'll show empty state
        setTransactions([]);
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
    let positionId = cashData.data?.[0]?.id;
    
    if (!positionId) {
      // Create cash position
      const createRes = await fetch(`/api/portfolios/${portfolioId}/cash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: baseCurrency, amount: 0 }),
      });
      const created = await createRes.json();
      positionId = created.data.id;
    }
    
    // Add transaction
    await fetch(`/api/portfolios/${portfolioId}/cash/${baseCurrency}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
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
    if (!portfolioId) return;
    
    await fetch(`/api/portfolios/${portfolioId}/dividends`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
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
  const monthlyDividend = dividendSummary?.monthly_average || 0;
  const yearlyDividend = dividendSummary?.total_yearly || 0;
  const dividendYield = dividendSummary?.dividend_yield || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Heading level={1}>💰 Nakit ve Temettü</Heading>
          <Text className="mt-1">Nakit hareketleri ve temettü takibi</Text>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCashDialog(true)}>
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Nakit Ekle
          </Button>
          <Button onClick={() => setShowDividendDialog(true)} color="green">
            <BanknotesIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Temettü Kaydet
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <CashSummaryCards
        cashBalance={cashBalance}
        monthlyDividend={monthlyDividend}
        yearlyDividend={yearlyDividend}
        dividendYield={dividendYield}
        displayCurrency={displayCurrency}
      />

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
          />
        </div>

        {/* Dividend Calendar */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
            Aylık Temettü Takvimi
          </h2>
          <DividendCalendar
            byMonth={dividendSummary?.by_month || []}
            currency={displayCurrency}
          />
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
    </div>
  );
}
