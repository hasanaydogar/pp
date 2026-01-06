import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

/**
 * POST /api/dividends/forecast
 * 
 * Create a dividend forecast (expected future dividend)
 */

const CreateForecastSchema = z.object({
  asset_id: z.string().uuid(),
  per_share_amount: z.number().positive(),
  expected_payment_date: z.string(), // YYYY-MM-DD
  tax_rate: z.number().min(0).max(1).optional().default(0.15), // Default 15%
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate body
    const body = await request.json();
    const validated = CreateForecastSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.issues },
        { status: 400 }
      );
    }

    const { asset_id, per_share_amount, expected_payment_date, tax_rate, notes } = validated.data;

    // Get asset with portfolio info and quantity
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .select(`
        id,
        symbol,
        quantity,
        currency,
        portfolio_id,
        portfolio:portfolios(user_id)
      `)
      .eq('id', asset_id)
      .single();

    if (assetError || !asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Verify ownership
    const portfolioData = asset.portfolio as any;
    if (portfolioData?.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Calculate gross amount (per_share * quantity)
    const quantity = asset.quantity || 0;
    const grossAmount = per_share_amount * quantity;
    const taxAmount = grossAmount * tax_rate;
    const netAmount = grossAmount - taxAmount;

    if (quantity <= 0) {
      return NextResponse.json(
        { error: 'Asset has no quantity, cannot create forecast' },
        { status: 400 }
      );
    }

    // Create forecast dividend
    const { data: dividend, error: insertError } = await supabase
      .from('dividends')
      .insert({
        asset_id,
        portfolio_id: asset.portfolio_id,
        gross_amount: grossAmount,
        tax_amount: taxAmount,
        net_amount: netAmount,
        currency: asset.currency || 'TRY',
        payment_date: expected_payment_date,
        source: 'MANUAL_FORECAST',
        is_forecast: true,
        notes: notes || `Beklenen temettü - ${asset.symbol}`,
      })
      .select(`
        *,
        asset:assets!dividends_asset_id_fkey(symbol, type)
      `)
      .single();

    if (insertError) {
      console.error('[Forecast API] Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create forecast', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dividend,
      calculated: {
        per_share_amount,
        quantity,
        gross_amount: grossAmount,
        tax_rate,
        tax_amount: taxAmount,
        net_amount: netAmount,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('[Forecast API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/dividends/forecast?id=xxx
 * 
 * Delete a dividend record (forecast or manual)
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dividendId = searchParams.get('id');

    if (!dividendId) {
      return NextResponse.json({ error: 'Dividend id required' }, { status: 400 });
    }

    // Get the dividend to verify ownership
    const { data: dividend, error: fetchError } = await supabase
      .from('dividends')
      .select(`
        id,
        source,
        is_forecast,
        portfolio:portfolios(user_id)
      `)
      .eq('id', dividendId)
      .single();

    if (fetchError || !dividend) {
      return NextResponse.json({ error: 'Dividend not found' }, { status: 404 });
    }

    // Verify ownership
    const portfolioData = dividend.portfolio as any;
    if (portfolioData?.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Allow deletion of manual entries (MANUAL, MANUAL_FORECAST) and forecasts
    const canDelete = dividend.is_forecast || 
                      dividend.source === 'MANUAL' || 
                      dividend.source === 'MANUAL_FORECAST';
    
    if (!canDelete) {
      return NextResponse.json(
        { error: 'Can only delete manual or forecast dividends, not auto-recorded ones' },
        { status: 400 }
      );
    }

    // Delete the dividend
    const { error: deleteError } = await supabase
      .from('dividends')
      .delete()
      .eq('id', dividendId);

    if (deleteError) {
      console.error('[Forecast API] Delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete forecast', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Forecast API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/dividends/forecast?portfolioId=xxx
 * 
 * Get all forecasts for a portfolio
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
      .select('id')
      .eq('id', portfolioId)
      .eq('user_id', user.id)
      .single();

    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // Get forecasts
    const { data: forecasts, error: forecastError } = await supabase
      .from('dividends')
      .select(`
        *,
        asset:assets!dividends_asset_id_fkey(symbol, type, quantity)
      `)
      .eq('portfolio_id', portfolioId)
      .eq('is_forecast', true)
      .gte('payment_date', new Date().toISOString().split('T')[0])
      .order('payment_date', { ascending: true });

    if (forecastError) {
      console.error('[Forecast API] Query error:', forecastError);
      return NextResponse.json(
        { error: 'Failed to fetch forecasts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: forecasts,
      count: forecasts.length,
    });
  } catch (error) {
    console.error('[Forecast API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
