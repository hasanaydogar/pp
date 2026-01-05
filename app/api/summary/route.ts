import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { calculatePortfolioSummary, aggregatePortfolioSummaries } from '@/lib/api/summary';
import { DEFAULT_CURRENCY } from '@/lib/types/currency';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get display currency from query params
    const url = new URL(request.url);
    const displayCurrency = url.searchParams.get('currency') || DEFAULT_CURRENCY;

    // Fetch all portfolios with assets and cash positions
    const { data: portfolios, error: portfoliosError } = await supabase
      .from('portfolios')
      .select(`
        *,
        assets (
          *
        ),
        cash_positions (
          *
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (portfoliosError) {
      console.error('Error fetching portfolios:', portfoliosError);
      return NextResponse.json({ error: portfoliosError.message }, { status: 500 });
    }

    if (!portfolios || portfolios.length === 0) {
      return NextResponse.json({
        user_id: user.id,
        display_currency: displayCurrency,
        total_value: 0,
        total_cash: 0,
        total_assets_value: 0,
        portfolio_count: 0,
        total_asset_count: 0,
        daily_change: 0,
        daily_change_percent: 0,
        by_portfolio: [],
        by_asset_type: [],
        by_sector: [],
        all_policy_violations: [],
      });
    }

    // Fetch policies for all portfolios
    const portfolioIds = portfolios.map((p: { id: string }) => p.id);
    const { data: policies } = await supabase
      .from('portfolio_policies')
      .select('*')
      .in('portfolio_id', portfolioIds);

    const policyMap = new Map(
      policies?.map((p: { portfolio_id: string }) => [p.portfolio_id, p]) || []
    );

    // Calculate summaries
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const summaries = portfolios.map((portfolio: any) => {
      const policy = policyMap.get(portfolio.id);
      return calculatePortfolioSummary(portfolio, policy as any);
    });

    // Aggregate all summaries
    const result = aggregatePortfolioSummaries(summaries, user.id, displayCurrency);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
