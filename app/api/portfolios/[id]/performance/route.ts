import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PortfolioSnapshot, PerformanceSummary, formatSnapshotDate } from '@/lib/types/snapshot';

// GET - Get performance data for a portfolio
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
    
    // Parse query params
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    
    // Calculate date range
    let startDate: Date | null = null;
    switch (period) {
      case '7d':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '365d':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 365);
        break;
      case 'all':
      default:
        startDate = null;
    }
    
    // Build query
    let query = supabase
      .from('portfolio_snapshots')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('snapshot_date', { ascending: true });
    
    if (startDate) {
      query = query.gte('snapshot_date', formatSnapshotDate(startDate));
    }
    
    const { data: snapshots, error } = await query;
    
    if (error) {
      console.error('Error fetching snapshots:', error);
      return NextResponse.json({ error: 'Failed to fetch performance data' }, { status: 500 });
    }
    
    // Calculate performance summary
    const summary = calculatePerformanceSummary(snapshots || []);
    
    return NextResponse.json({
      data: {
        snapshots: snapshots || [],
        summary,
        period,
      },
    });
  } catch (error) {
    console.error('Performance API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculatePerformanceSummary(snapshots: PortfolioSnapshot[]): PerformanceSummary {
  if (snapshots.length === 0) {
    return {
      startValue: 0,
      endValue: 0,
      totalChange: 0,
      totalChangePercent: 0,
      bestDay: null,
      worstDay: null,
    };
  }
  
  const startValue = Number(snapshots[0].total_value);
  const endValue = Number(snapshots[snapshots.length - 1].total_value);
  const totalChange = endValue - startValue;
  const totalChangePercent = startValue > 0 ? (totalChange / startValue) * 100 : 0;
  
  // Find best and worst days
  // Best day: highest positive daily_change
  // Worst day: lowest negative daily_change
  let bestDay: PerformanceSummary['bestDay'] = null;
  let worstDay: PerformanceSummary['worstDay'] = null;
  
  for (const snapshot of snapshots) {
    const change = Number(snapshot.daily_change);
    const changePercent = Number(snapshot.daily_change_percent);
    
    // Best day: only consider positive changes
    if (change > 0) {
      if (bestDay === null || change > bestDay.change) {
        bestDay = {
          date: snapshot.snapshot_date,
          change,
          changePercent,
        };
      }
    }
    
    // Worst day: only consider negative changes
    if (change < 0) {
      if (worstDay === null || change < worstDay.change) {
        worstDay = {
          date: snapshot.snapshot_date,
          change,
          changePercent,
        };
      }
    }
  }
  
  return {
    startValue,
    endValue,
    totalChange: Math.round(totalChange * 100) / 100,
    totalChangePercent: Math.round(totalChangePercent * 100) / 100,
    bestDay,
    worstDay,
  };
}
