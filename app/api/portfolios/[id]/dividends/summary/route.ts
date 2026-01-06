import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DividendSummary, DividendByAsset, DividendByMonth } from '@/lib/types/dividend';

// GET - Get dividend summary for a portfolio
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: portfolioId } = await params;
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify portfolio ownership and get portfolio value
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select(`
        id,
        assets(quantity, average_buy_price)
      `)
      .eq('id', portfolioId)
      .eq('user_id', user.id)
      .single();
    
    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }
    
    // Calculate portfolio value (approximate)
    const portfolioValue = (portfolio.assets as any[])?.reduce((sum: number, asset: any) => {
      return sum + (Number(asset.quantity) * Number(asset.average_buy_price));
    }, 0) || 0;
    
    // Get current year
    const currentYear = new Date().getFullYear();
    const yearStart = `${currentYear}-01-01`;
    const yearEnd = `${currentYear}-12-31`;
    
    // Fetch all dividends for the year
    const { data: dividends, error: dividendsError } = await supabase
      .from('dividends')
      .select(`
        *,
        asset:assets!dividends_asset_id_fkey(symbol)
      `)
      .eq('portfolio_id', portfolioId)
      .gte('payment_date', yearStart)
      .lte('payment_date', yearEnd)
      .order('payment_date', { ascending: false });
    
    if (dividendsError) {
      console.error('Error fetching dividends:', dividendsError);
      return NextResponse.json({ error: 'Failed to fetch dividends' }, { status: 500 });
    }
    
    // Calculate totals
    const totalYearly = dividends?.reduce((sum, d) => sum + Number(d.net_amount), 0) || 0;
    
    // YTD calculation
    const today = new Date().toISOString().split('T')[0];
    const ytdDividends = dividends?.filter(d => d.payment_date <= today) || [];
    const totalYtd = ytdDividends.reduce((sum, d) => sum + Number(d.net_amount), 0);
    
    // Monthly average (based on months elapsed)
    const currentMonth = new Date().getMonth() + 1;
    const monthlyAverage = totalYtd / currentMonth;
    
    // Dividend yield
    const dividendYield = portfolioValue > 0 ? (totalYearly / portfolioValue) * 100 : 0;
    
    // Group by asset
    const byAssetMap = new Map<string, DividendByAsset>();
    dividends?.forEach(d => {
      const key = d.asset_id;
      const existing = byAssetMap.get(key);
      if (existing) {
        existing.amount += Number(d.net_amount);
        existing.count += 1;
      } else {
        byAssetMap.set(key, {
          asset_id: d.asset_id,
          symbol: (d.asset as any)?.symbol || 'Unknown',
          amount: Number(d.net_amount),
          count: 1,
        });
      }
    });
    const byAsset = Array.from(byAssetMap.values()).sort((a, b) => b.amount - a.amount);
    
    // Group by month
    const byMonthMap = new Map<string, DividendByMonth>();
    dividends?.forEach(d => {
      const month = d.payment_date.substring(0, 7); // YYYY-MM
      const existing = byMonthMap.get(month);
      if (existing) {
        existing.amount += Number(d.net_amount);
        existing.count += 1;
      } else {
        byMonthMap.set(month, {
          month,
          amount: Number(d.net_amount),
          count: 1,
        });
      }
    });
    const byMonth = Array.from(byMonthMap.values()).sort((a, b) => b.month.localeCompare(a.month));
    
    // Last dividend
    const lastDividend = dividends?.[0] || null;
    
    const summary: DividendSummary = {
      total_yearly: Math.round(totalYearly * 100) / 100,
      total_ytd: Math.round(totalYtd * 100) / 100,
      monthly_average: Math.round(monthlyAverage * 100) / 100,
      dividend_yield: Math.round(dividendYield * 100) / 100,
      by_asset: byAsset,
      by_month: byMonth,
      last_dividend: lastDividend,
    };
    
    return NextResponse.json({ data: summary });
  } catch (error) {
    console.error('Dividends summary API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
