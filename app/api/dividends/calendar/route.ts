import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchMultipleDividendInfo } from '@/lib/services/dividend-service';
import { UpcomingDividend, DividendCalendarResponse } from '@/lib/types/dividend';

/**
 * GET /api/dividends/calendar?portfolioId={id}
 * 
 * Fetches dividend calendar for all assets in a portfolio
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const portfolioId = searchParams.get('portfolioId');

    if (!portfolioId) {
      return NextResponse.json(
        { error: 'portfolioId is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify portfolio ownership and get assets
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select(`
        id,
        base_currency,
        assets (
          id,
          symbol,
          quantity,
          currency
        )
      `)
      .eq('id', portfolioId)
      .eq('user_id', user.id)
      .single();

    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    const assets = portfolio.assets || [];
    if (assets.length === 0) {
      return NextResponse.json({
        data: {
          upcoming: [],
          byMonth: {},
          totalExpected90Days: 0,
          totalExpectedYearly: 0,
        } as DividendCalendarResponse,
      });
    }

    // Fetch dividend info for all assets
    const assetInfos = assets.map((a: any) => ({
      symbol: a.symbol,
      currency: a.currency || portfolio.base_currency || 'TRY',
      assetId: a.id,
      quantity: Number(a.quantity) || 0,
    }));

    const dividendInfoMap = await fetchMultipleDividendInfo(assetInfos);

    // Build upcoming dividends list
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const upcoming: UpcomingDividend[] = [];

    // 1. Add dividends from Yahoo Finance
    for (const [symbol, info] of dividendInfoMap) {
      if (info.exDividendDate) {
        const exDate = new Date(info.exDividendDate);
        const daysUntil = Math.ceil((exDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Include if ex-dividend date is in the future or within the last 7 days
        if (daysUntil >= -7) {
          const dividendPerShare = info.forwardDividend || info.lastDividendValue || 0;
          const expectedTotal = dividendPerShare * info.quantity;

          upcoming.push({
            symbol,
            assetId: info.assetId,
            exDividendDate: info.exDividendDate,
            paymentDate: info.paymentDate,
            dividendPerShare,
            quantity: info.quantity,
            expectedTotal,
            currency: info.currency,
            daysUntil,
          });
        }
      }
    }

    // 2. Add manually recorded dividends from database (both past and future forecasts)
    const { data: manualDividends } = await supabase
      .from('dividends')
      .select(`
        id,
        asset_id,
        net_amount,
        gross_amount,
        currency,
        payment_date,
        ex_dividend_date,
        source,
        is_forecast,
        assets!dividends_asset_id_fkey(symbol)
      `)
      .eq('portfolio_id', portfolioId)
      .or(`payment_date.gte.${todayStr},is_forecast.eq.true`)
      .order('payment_date', { ascending: true });

    if (manualDividends && manualDividends.length > 0) {
      for (const div of manualDividends) {
        const paymentDate = div.payment_date;
        const exDate = div.ex_dividend_date || paymentDate;
        const targetDate = new Date(exDate);
        const daysUntil = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Check if this dividend is already in the list (from Yahoo)
        const symbol = (div.assets as any)?.symbol || 'Unknown';
        const alreadyExists = upcoming.some(
          u => u.symbol === symbol && u.exDividendDate === exDate
        );
        
        // Include if:
        // 1. Is a future dividend (daysUntil >= 0)
        // 2. OR is a forecast (is_forecast = true)
        const shouldInclude = !alreadyExists && (daysUntil >= 0 || div.is_forecast);
        
        if (shouldInclude) {
          upcoming.push({
            id: div.id, // Include ID for deletion
            symbol,
            assetId: div.asset_id,
            exDividendDate: exDate,
            paymentDate: paymentDate,
            dividendPerShare: 0, // Manual entry doesn't have per-share info
            quantity: 0,
            expectedTotal: Number(div.net_amount || div.gross_amount),
            currency: div.currency,
            daysUntil,
            isForecast: div.is_forecast || false,
            source: div.source || 'MANUAL',
          } as UpcomingDividend & { id: string });
        }
      }
    }

    // Sort by ex-dividend date (nearest first)
    upcoming.sort((a, b) => a.daysUntil - b.daysUntil);

    // Group by month
    const byMonth: Record<string, Array<{ date: string; dividends: UpcomingDividend[]; totalExpected: number }>> = {};
    
    for (const dividend of upcoming) {
      if (dividend.daysUntil >= 0) {
        const monthKey = dividend.exDividendDate.substring(0, 7); // YYYY-MM
        if (!byMonth[monthKey]) {
          byMonth[monthKey] = [];
        }
        
        // Find or create day entry
        const existingDay = byMonth[monthKey].find(d => d.date === dividend.exDividendDate);
        if (existingDay) {
          existingDay.dividends.push(dividend);
          existingDay.totalExpected += dividend.expectedTotal;
        } else {
          byMonth[monthKey].push({
            date: dividend.exDividendDate,
            dividends: [dividend],
            totalExpected: dividend.expectedTotal,
          });
        }
      }
    }

    // Sort days within each month
    for (const monthKey of Object.keys(byMonth)) {
      byMonth[monthKey].sort((a, b) => a.date.localeCompare(b.date));
    }

    // Calculate totals
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

    const totalExpected90Days = upcoming
      .filter(d => d.daysUntil >= 0 && d.daysUntil <= 90)
      .reduce((sum, d) => sum + d.expectedTotal, 0);

    const totalExpectedYearly = upcoming
      .filter(d => d.daysUntil >= 0 && d.daysUntil <= 365)
      .reduce((sum, d) => sum + d.expectedTotal, 0);

    const response: DividendCalendarResponse = {
      upcoming: upcoming.filter(d => d.daysUntil >= 0),
      byMonth,
      totalExpected90Days,
      totalExpectedYearly,
    };

    return NextResponse.json({ data: response });
  } catch (error) {
    console.error('Dividend calendar API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
