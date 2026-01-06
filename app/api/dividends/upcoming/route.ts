import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchMultipleDividendInfo } from '@/lib/services/dividend-service';
import { UpcomingDividend } from '@/lib/types/dividend';

/**
 * GET /api/dividends/upcoming?portfolioId={id}&days=90
 * 
 * Returns list of upcoming dividends sorted by date
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const portfolioId = searchParams.get('portfolioId');
    const days = parseInt(searchParams.get('days') || '90');

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
          dividends: [],
          count: 0,
          totalExpected: 0,
        },
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
    const upcoming: UpcomingDividend[] = [];

    for (const [symbol, info] of dividendInfoMap) {
      if (info.exDividendDate) {
        const exDate = new Date(info.exDividendDate);
        const daysUntil = Math.ceil((exDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Include if within specified days range
        if (daysUntil >= 0 && daysUntil <= days) {
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

    // Sort by ex-dividend date (nearest first)
    upcoming.sort((a, b) => a.daysUntil - b.daysUntil);

    // Calculate total
    const totalExpected = upcoming.reduce((sum, d) => sum + d.expectedTotal, 0);

    return NextResponse.json({
      data: {
        dividends: upcoming,
        count: upcoming.length,
        totalExpected,
      },
    });
  } catch (error) {
    console.error('Upcoming dividends API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
