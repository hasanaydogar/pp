import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CreateDividendSchema, calculateNetDividend, ReinvestStrategy } from '@/lib/types/dividend';
import { createCashTransactionForDividend } from '@/lib/services/cash-service';

// GET - List dividends for a portfolio
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
    const year = searchParams.get('year');
    const assetId = searchParams.get('asset_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Build query
    let query = supabase
      .from('dividends')
      .select(`
        *,
        asset:assets!dividends_asset_id_fkey(symbol, type)
      `, { count: 'exact' })
      .eq('portfolio_id', portfolioId)
      .order('payment_date', { ascending: false });
    
    // Apply filters
    if (year) {
      query = query
        .gte('payment_date', `${year}-01-01`)
        .lte('payment_date', `${year}-12-31`);
    }
    
    if (assetId) {
      query = query.eq('asset_id', assetId);
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching dividends:', error);
      return NextResponse.json({ error: 'Failed to fetch dividends' }, { status: 500 });
    }
    
    return NextResponse.json({
      data,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('Dividends API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new dividend record
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
    console.log('[Dividend API] Received body:', JSON.stringify(body));
    
    const validated = CreateDividendSchema.safeParse(body);
    
    if (!validated.success) {
      console.error('[Dividend API] Validation failed:', validated.error.issues);
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.issues },
        { status: 400 }
      );
    }
    
    console.log('[Dividend API] Validated data:', JSON.stringify(validated.data));
    
    const { asset_id, gross_amount, tax_amount, ...rest } = validated.data;
    
    // Verify asset belongs to this portfolio
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .select('id')
      .eq('id', asset_id)
      .eq('portfolio_id', portfolioId)
      .single();
    
    if (assetError || !asset) {
      return NextResponse.json({ error: 'Asset not found in this portfolio' }, { status: 400 });
    }
    
    // Calculate net amount
    const netAmount = gross_amount - (tax_amount || 0);
    
    // Insert dividend
    const { data, error } = await supabase
      .from('dividends')
      .insert({
        portfolio_id: portfolioId,
        asset_id,
        gross_amount,
        tax_amount: tax_amount || 0,
        net_amount: netAmount,
        ...rest,
      })
      .select(`
        *,
        asset:assets!dividends_asset_id_fkey(symbol, type)
      `)
      .single();
    
    if (error) {
      console.error('[Dividend API] Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create dividend', details: error.message }, { status: 500 });
    }
    
    console.log('[Dividend API] Created dividend:', data?.id);
    
    // If reinvest strategy is CASH, add to cash balance
    const reinvestStrategy = rest.reinvest_strategy || ReinvestStrategy.CASH;
    if (reinvestStrategy === ReinvestStrategy.CASH && netAmount > 0) {
      // Get asset symbol for the cash transaction
      const { data: assetInfo } = await supabase
        .from('assets')
        .select('symbol, currency')
        .eq('id', asset_id)
        .single();
      
      if (assetInfo) {
        try {
          await createCashTransactionForDividend(
            portfolioId,
            asset_id,
            assetInfo.symbol,
            netAmount,
            rest.payment_date,
            rest.currency || assetInfo.currency || 'TRY'
          );
        } catch (cashError) {
          console.error('Failed to create cash transaction for dividend:', cashError);
          // Don't fail the dividend creation, just log the error
        }
      }
    }
    
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Dividends API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
