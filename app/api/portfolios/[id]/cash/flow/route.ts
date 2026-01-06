import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCashFlowData, CashFlowDataPoint } from '@/lib/services/cash-service';

/**
 * GET /api/portfolios/[id]/cash/flow?period=30d&includeForecast=true
 * 
 * Returns cash flow data for charting, optionally including future dividend forecasts
 */
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

    // Verify portfolio ownership
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('id')
      .eq('id', portfolioId)
      .eq('user_id', user.id)
      .single();

    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // Parse period and options
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    const includeForecast = searchParams.get('includeForecast') !== 'false'; // Default true

    // Calculate date range
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const startDate = new Date();
    let endDate = new Date();

    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '365d':
        startDate.setDate(startDate.getDate() - 365);
        break;
      case 'all':
        startDate.setFullYear(2020); // Far back enough
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    let endDateStr = endDate.toISOString().split('T')[0];

    // Get cash flow data (historical)
    const result = await getCashFlowData(portfolioId, startDateStr, endDateStr);

    if (!result) {
      return NextResponse.json({
        data: {
          data: [],
          summary: {
            startBalance: 0,
            endBalance: 0,
            totalDeposits: 0,
            totalWithdrawals: 0,
            totalDividends: 0,
            totalPurchases: 0,
            totalSales: 0,
            netChange: 0,
          },
        },
      });
    }

    // If includeForecast, fetch future dividend data (both forecasts and upcoming from DB)
    // and use the dividend calendar API for consistency
    if (includeForecast) {
      const futureEndDate = new Date();
      futureEndDate.setDate(futureEndDate.getDate() + 365);
      const futureEndDateStr = futureEndDate.toISOString().split('T')[0];

      // Fetch ALL future dividends from database (is_forecast = true OR payment_date >= today)
      const { data: futureDividends } = await supabase
        .from('dividends')
        .select(`
          id,
          net_amount,
          gross_amount,
          payment_date,
          currency,
          is_forecast,
          source,
          assets!dividends_asset_id_fkey(symbol)
        `)
        .eq('portfolio_id', portfolioId)
        .gte('payment_date', todayStr)
        .lte('payment_date', futureEndDateStr)
        .order('payment_date', { ascending: true });

      if (futureDividends && futureDividends.length > 0) {
        // Get current balance (last data point or 0)
        let runningBalance = result.summary.endBalance;
        
        // Group by date
        const forecastByDate = new Map<string, number>();
        for (const f of futureDividends) {
          const amount = Number(f.net_amount || f.gross_amount || 0);
          const existing = forecastByDate.get(f.payment_date) || 0;
          forecastByDate.set(f.payment_date, existing + amount);
        }

        // Add forecast data points
        const forecastDates = Array.from(forecastByDate.keys()).sort();
        for (const date of forecastDates) {
          const dividendAmount = forecastByDate.get(date) || 0;
          runningBalance += dividendAmount;
          
          result.data.push({
            date,
            balance: runningBalance,
            change: dividendAmount,
            deposits: 0,
            withdrawals: 0,
            dividends: dividendAmount,
            purchases: 0,
            sales: 0,
            isForecast: true, // Mark as forecast for special styling
          } as CashFlowDataPoint & { isForecast: boolean });
        }

        // Update end date if we have future data
        if (forecastDates.length > 0) {
          endDateStr = forecastDates[forecastDates.length - 1];
        }
      }
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Cash flow API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
