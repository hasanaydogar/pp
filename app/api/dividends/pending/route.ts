import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/dividends/pending?portfolioId=xxx
 * 
 * Get forecasted dividends that are due (payment_date <= today)
 * These need user confirmation to be converted to realized dividends
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const portfolioId = searchParams.get('portfolioId');

    if (!portfolioId) {
      return NextResponse.json({ error: 'portfolioId required' }, { status: 400 });
    }

    // Verify portfolio ownership
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('id, base_currency')
      .eq('id', portfolioId)
      .eq('user_id', user.id)
      .single();

    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Get forecasts that are due (payment_date <= today and is_forecast = true)
    const { data: pendingDividends, error: fetchError } = await supabase
      .from('dividends')
      .select(`
        id,
        asset_id,
        gross_amount,
        tax_amount,
        net_amount,
        currency,
        payment_date,
        ex_dividend_date,
        source,
        is_forecast,
        notes,
        created_at,
        asset:assets!dividends_asset_id_fkey(
          id,
          symbol,
          quantity,
          type
        )
      `)
      .eq('portfolio_id', portfolioId)
      .eq('is_forecast', true)
      .lte('payment_date', today)
      .order('payment_date', { ascending: true });

    if (fetchError) {
      console.error('[Pending Dividends API] Query error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch pending dividends' },
        { status: 500 }
      );
    }

    // Format response
    const formatted = (pendingDividends || []).map(div => ({
      id: div.id,
      assetId: div.asset_id,
      symbol: (div.asset as any)?.symbol || 'Unknown',
      assetType: (div.asset as any)?.type || 'STOCK',
      currentQuantity: (div.asset as any)?.quantity || 0,
      grossAmount: div.gross_amount,
      taxAmount: div.tax_amount,
      netAmount: div.net_amount,
      currency: div.currency,
      paymentDate: div.payment_date,
      exDividendDate: div.ex_dividend_date,
      notes: div.notes,
      createdAt: div.created_at,
      daysOverdue: Math.floor((new Date().getTime() - new Date(div.payment_date).getTime()) / (1000 * 60 * 60 * 24)),
    }));

    return NextResponse.json({
      data: formatted,
      count: formatted.length,
      hasPending: formatted.length > 0,
    });
  } catch (error) {
    console.error('[Pending Dividends API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
