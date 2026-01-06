import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { detectPolicyViolations } from '@/lib/api/summary';
import { DEFAULT_POLICY } from '@/lib/types/policy';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: portfolioId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch portfolio with assets and cash positions
    const { data: portfolio, error: portfolioError } = await supabase
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
      .eq('id', portfolioId)
      .eq('user_id', user.id)
      .single();

    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // Fetch policy
    const { data: policy } = await supabase
      .from('portfolio_policies')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .single();

    // Calculate total portfolio value
    const assets = portfolio.assets || [];
    const cashPositions = portfolio.cash_positions || [];

    const totalAssetsValue = assets.reduce(
      (sum: number, asset: { quantity: number; average_buy_price: number }) => 
        sum + asset.quantity * asset.average_buy_price,
      0
    );
    const totalCash = cashPositions.reduce(
      (sum: number, cp: { amount: number }) => sum + cp.amount,
      0
    );
    const totalValue = totalAssetsValue + totalCash;

    // Detect violations
    const violations = detectPolicyViolations(
      portfolioId,
      assets,
      cashPositions,
      totalValue,
      policy || DEFAULT_POLICY
    );

    return NextResponse.json({
      portfolio_id: portfolioId,
      total_value: totalValue,
      total_cash: totalCash,
      cash_percentage: totalValue > 0 ? totalCash / totalValue : 0,
      policy: policy || { ...DEFAULT_POLICY, is_default: true },
      violations,
      violation_count: violations.length,
      critical_count: violations.filter(v => v.severity === 'critical').length,
      warning_count: violations.filter(v => v.severity === 'warning').length,
    });
  } catch (error) {
    console.error('Error in GET /api/portfolios/[id]/violations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
