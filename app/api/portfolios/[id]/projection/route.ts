import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_PORTFOLIO_SETTINGS, DEFAULT_PROJECTION_PERIODS } from '@/lib/types/portfolio-settings';
import { generateProjections, generateScenarios, generateScenarioChartData } from '@/lib/utils/projection';

// GET - Calculate projection for a portfolio
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
    
    // Verify portfolio ownership and get portfolio data
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select(`
        id,
        name,
        base_currency,
        assets(quantity, average_buy_price)
      `)
      .eq('id', portfolioId)
      .eq('user_id', user.id)
      .single();
    
    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }
    
    // Calculate portfolio value
    const assetsValue = (portfolio.assets as any[])?.reduce((sum: number, asset: any) => {
      return sum + (Number(asset.quantity) * Number(asset.average_buy_price));
    }, 0) || 0;
    
    // Get cash positions
    const { data: cashPositions } = await supabase
      .from('cash_positions')
      .select('amount')
      .eq('portfolio_id', portfolioId);
    
    const cashValue = cashPositions?.reduce((sum, pos) => sum + Number(pos.amount), 0) || 0;
    const currentValue = assetsValue + cashValue;
    
    // Get portfolio settings
    const { data: settings } = await supabase
      .from('portfolio_settings')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .single();
    
    const portfolioSettings = settings || DEFAULT_PORTFOLIO_SETTINGS;
    
    // Parse query params
    const { searchParams } = new URL(request.url);
    const includeScenarios = searchParams.get('include_scenarios') === 'true';
    const includeChartData = searchParams.get('include_chart_data') === 'true';
    
    // Generate projections
    const projections = generateProjections(
      currentValue,
      Number(portfolioSettings.monthly_investment),
      Number(portfolioSettings.expected_return_rate),
      Number(portfolioSettings.withdrawal_rate),
      DEFAULT_PROJECTION_PERIODS
    );
    
    // Generate scenarios if requested
    const scenarios = includeScenarios ? generateScenarios(
      currentValue,
      Number(portfolioSettings.monthly_investment),
      Number(portfolioSettings.expected_return_rate),
      Number(portfolioSettings.withdrawal_rate),
      DEFAULT_PROJECTION_PERIODS
    ) : null;
    
    // Generate chart data if requested
    const chartData = includeChartData ? generateScenarioChartData(
      currentValue,
      Number(portfolioSettings.monthly_investment),
      Number(portfolioSettings.expected_return_rate),
      25
    ) : null;
    
    return NextResponse.json({
      data: {
        current_value: Math.round(currentValue),
        assets_value: Math.round(assetsValue),
        cash_value: Math.round(cashValue),
        settings: {
          monthly_investment: Number(portfolioSettings.monthly_investment),
          expected_return_rate: Number(portfolioSettings.expected_return_rate),
          withdrawal_rate: Number(portfolioSettings.withdrawal_rate),
          include_dividends: portfolioSettings.include_dividends_in_projection,
        },
        projections,
        scenarios,
        chart_data: chartData,
      },
    });
  } catch (error) {
    console.error('Projection API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
