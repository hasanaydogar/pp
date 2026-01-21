import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { CreateCashTransactionSchema, getCashTransactionSign } from '@/lib/types/cash';

interface RouteParams {
  params: Promise<{ id: string; currency: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: portfolioId, currency } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
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

    // Get cash position
    const { data: cashPosition, error: cashError } = await supabase
      .from('cash_positions')
      .select('id')
      .eq('portfolio_id', portfolioId)
      .eq('currency', currency.toUpperCase())
      .single();

    if (cashError || !cashPosition) {
      return NextResponse.json({ error: 'Cash position not found' }, { status: 404 });
    }

    // Get transactions with pagination
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const type = url.searchParams.get('type');

    let query = supabase
      .from('cash_transactions')
      .select('*', { count: 'exact' })
      .eq('cash_position_id', cashPosition.id)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching cash transactions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data,
      pagination: {
        total: count,
        limit,
        offset,
        hasMore: (count ?? 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/portfolios/[id]/cash/[currency]/transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id: portfolioId, currency } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
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

    // Get cash position
    const { data: cashPosition, error: cashError } = await supabase
      .from('cash_positions')
      .select('id, amount')
      .eq('portfolio_id', portfolioId)
      .eq('currency', currency.toUpperCase())
      .single();

    if (cashError || !cashPosition) {
      return NextResponse.json({ error: 'Cash position not found' }, { status: 404 });
    }

    const body = await request.json();
    const validated = CreateCashTransactionSchema.safeParse(body);
    
    if (!validated.success) {
      return NextResponse.json({ error: validated.error.issues }, { status: 400 });
    }

    // Calculate signed amount (positive for inflows, negative for outflows)
    const sign = getCashTransactionSign(validated.data.type);
    const signedAmount = validated.data.amount * sign;
    const newAmount = cashPosition.amount + signedAmount;

    // Start transaction: create cash transaction and update position
    // Store signed amount for consistency with getCashFlowData calculations
    const { data: transaction, error: txError } = await supabase
      .from('cash_transactions')
      .insert({
        cash_position_id: cashPosition.id,
        type: validated.data.type,
        amount: signedAmount,
        date: validated.data.date || new Date().toISOString(),
        notes: validated.data.notes,
        related_transaction_id: validated.data.related_transaction_id,
      })
      .select()
      .single();

    if (txError) {
      console.error('Error creating cash transaction:', txError);
      return NextResponse.json({ error: txError.message }, { status: 500 });
    }

    // Update cash position amount
    const { error: updateError } = await supabase
      .from('cash_positions')
      .update({
        amount: newAmount,
        last_updated: new Date().toISOString(),
      })
      .eq('id', cashPosition.id);

    if (updateError) {
      console.error('Error updating cash position:', updateError);
      // Rollback transaction
      await supabase
        .from('cash_transactions')
        .delete()
        .eq('id', transaction.id);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      ...transaction,
      new_position_amount: newAmount,
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/portfolios/[id]/cash/[currency]/transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id: portfolioId, currency } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get transaction ID from query params
    const url = new URL(request.url);
    const transactionId = url.searchParams.get('transactionId');
    
    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 });
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

    // Get cash position
    const { data: cashPosition, error: cashError } = await supabase
      .from('cash_positions')
      .select('id, amount')
      .eq('portfolio_id', portfolioId)
      .eq('currency', currency.toUpperCase())
      .single();

    if (cashError || !cashPosition) {
      return NextResponse.json({ error: 'Cash position not found' }, { status: 404 });
    }

    // Get the transaction to be deleted
    const { data: transaction, error: txError } = await supabase
      .from('cash_transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('cash_position_id', cashPosition.id)
      .single();

    if (txError || !transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Calculate the reversal amount (transaction.amount is already signed)
    // Deleting a deposit (-amount removes positive value)
    // Deleting a withdrawal (-amount adds back the negative, effectively adding)
    const newAmount = cashPosition.amount - transaction.amount;

    // Delete the transaction
    const { error: deleteError } = await supabase
      .from('cash_transactions')
      .delete()
      .eq('id', transactionId);

    if (deleteError) {
      console.error('Error deleting cash transaction:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Update cash position amount
    const { error: updateError } = await supabase
      .from('cash_positions')
      .update({
        amount: newAmount,
        last_updated: new Date().toISOString(),
      })
      .eq('id', cashPosition.id);

    if (updateError) {
      console.error('Error updating cash position after delete:', updateError);
      // Transaction already deleted - log the inconsistency
      return NextResponse.json({ 
        error: 'Transaction deleted but cash position update failed',
        details: updateError.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      deleted_transaction_id: transactionId,
      new_position_amount: newAmount,
    });
  } catch (error) {
    console.error('Error in DELETE /api/portfolios/[id]/cash/[currency]/transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
