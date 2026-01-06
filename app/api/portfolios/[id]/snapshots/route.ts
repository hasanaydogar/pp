import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CreateSnapshotSchema, formatSnapshotDate } from '@/lib/types/snapshot';

// GET - List portfolio snapshots
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
    const limit = parseInt(searchParams.get('limit') || '100');
    
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
      .order('snapshot_date', { ascending: true })
      .limit(limit);
    
    if (startDate) {
      query = query.gte('snapshot_date', formatSnapshotDate(startDate));
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching snapshots:', error);
      return NextResponse.json({ error: 'Failed to fetch snapshots' }, { status: 500 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Snapshots API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new snapshot
export async function POST(
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
    
    // Parse and validate body
    const body = await request.json();
    const validated = CreateSnapshotSchema.safeParse(body);
    
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.issues },
        { status: 400 }
      );
    }
    
    const today = formatSnapshotDate(new Date());
    
    // Check if today's snapshot already exists
    const { data: existingSnapshot } = await supabase
      .from('portfolio_snapshots')
      .select('id')
      .eq('portfolio_id', portfolioId)
      .eq('snapshot_date', today)
      .single();
    
    if (existingSnapshot) {
      // Update existing snapshot
      const { data, error } = await supabase
        .from('portfolio_snapshots')
        .update({
          total_value: validated.data.total_value,
          assets_value: validated.data.assets_value,
          cash_value: validated.data.cash_value,
          daily_change: validated.data.daily_change || 0,
          daily_change_percent: validated.data.daily_change_percent || 0,
        })
        .eq('id', existingSnapshot.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating snapshot:', error);
        return NextResponse.json({ error: 'Failed to update snapshot' }, { status: 500 });
      }
      
      return NextResponse.json({ data, updated: true });
    }
    
    // Get yesterday's snapshot to calculate daily change
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatSnapshotDate(yesterday);
    
    const { data: previousSnapshot } = await supabase
      .from('portfolio_snapshots')
      .select('total_value')
      .eq('portfolio_id', portfolioId)
      .lt('snapshot_date', today)
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .single();
    
    let dailyChange = validated.data.daily_change || 0;
    let dailyChangePercent = validated.data.daily_change_percent || 0;
    
    if (previousSnapshot && !validated.data.daily_change) {
      dailyChange = validated.data.total_value - Number(previousSnapshot.total_value);
      dailyChangePercent = Number(previousSnapshot.total_value) > 0
        ? (dailyChange / Number(previousSnapshot.total_value)) * 100
        : 0;
    }
    
    // Insert new snapshot
    const { data, error } = await supabase
      .from('portfolio_snapshots')
      .insert({
        portfolio_id: portfolioId,
        snapshot_date: today,
        total_value: validated.data.total_value,
        assets_value: validated.data.assets_value,
        cash_value: validated.data.cash_value,
        daily_change: dailyChange,
        daily_change_percent: dailyChangePercent,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating snapshot:', error);
      return NextResponse.json({ error: 'Failed to create snapshot' }, { status: 500 });
    }
    
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Snapshots API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
