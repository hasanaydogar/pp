import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { createCashTransactionForDividend } from '@/lib/services/cash-service';

/**
 * POST /api/dividends/confirm
 * 
 * Confirm a forecasted dividend as realized
 * - Updates is_forecast to false
 * - Updates amounts if different from forecast
 * - Adds cash transaction to portfolio
 */

const ConfirmDividendSchema = z.object({
  dividend_id: z.string().uuid(),
  actual_gross_amount: z.number().positive(),
  actual_tax_amount: z.number().min(0),
  actual_payment_date: z.string().optional(), // Can adjust date if needed
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
    const validated = ConfirmDividendSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.issues },
        { status: 400 }
      );
    }

    const { dividend_id, actual_gross_amount, actual_tax_amount, actual_payment_date, notes } = validated.data;

    // Get the dividend forecast
    const { data: dividend, error: fetchError } = await supabase
      .from('dividends')
      .select(`
        id,
        asset_id,
        portfolio_id,
        gross_amount,
        tax_amount,
        net_amount,
        currency,
        payment_date,
        is_forecast,
        source,
        notes,
        portfolio:portfolios(user_id),
        asset:assets!dividends_asset_id_fkey(symbol)
      `)
      .eq('id', dividend_id)
      .single();

    if (fetchError || !dividend) {
      return NextResponse.json({ error: 'Dividend not found' }, { status: 404 });
    }

    // Verify ownership
    const portfolioData = dividend.portfolio as any;
    if (portfolioData?.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Verify it's a forecast
    if (!dividend.is_forecast) {
      return NextResponse.json(
        { error: 'This dividend is already confirmed' },
        { status: 400 }
      );
    }

    // Calculate actual net amount
    const actualNetAmount = actual_gross_amount - actual_tax_amount;

    // Update the dividend record
    const { data: updatedDividend, error: updateError } = await supabase
      .from('dividends')
      .update({
        gross_amount: actual_gross_amount,
        tax_amount: actual_tax_amount,
        net_amount: actualNetAmount,
        payment_date: actual_payment_date || dividend.payment_date,
        is_forecast: false,
        source: 'MANUAL', // Convert from MANUAL_FORECAST to MANUAL
        notes: notes || dividend.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dividend_id)
      .select()
      .single();

    if (updateError) {
      console.error('[Confirm Dividend API] Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to confirm dividend', details: updateError.message },
        { status: 500 }
      );
    }

    // Add cash transaction
    const symbol = (dividend.asset as any)?.symbol || 'Unknown';
    const cashResult = await createCashTransactionForDividend(
      dividend.portfolio_id,
      dividend.asset_id,
      symbol,
      actualNetAmount,
      actual_payment_date || dividend.payment_date,
      dividend.currency
    );

    if (!cashResult.success) {
      console.error('[Confirm Dividend API] Cash transaction error:', cashResult.error);
      // Don't fail the whole operation, just log it
    }

    // Calculate difference from forecast
    const forecastGross = dividend.gross_amount;
    const difference = actual_gross_amount - forecastGross;
    const differencePercent = forecastGross > 0 ? (difference / forecastGross) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: updatedDividend,
      cashTransactionCreated: cashResult.success,
      comparison: {
        forecastGross,
        actualGross: actual_gross_amount,
        difference,
        differencePercent: Math.round(differencePercent * 100) / 100,
      },
    });
  } catch (error) {
    console.error('[Confirm Dividend API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/dividends/confirm?id=xxx
 * 
 * Cancel/dismiss a pending dividend (delete the forecast)
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

    // Verify it's a forecast
    if (!dividend.is_forecast) {
      return NextResponse.json(
        { error: 'Can only dismiss pending forecasts' },
        { status: 400 }
      );
    }

    // Delete the forecast
    const { error: deleteError } = await supabase
      .from('dividends')
      .delete()
      .eq('id', dividendId);

    if (deleteError) {
      console.error('[Confirm Dividend API] Delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to dismiss forecast', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, dismissed: true });
  } catch (error) {
    console.error('[Confirm Dividend API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
