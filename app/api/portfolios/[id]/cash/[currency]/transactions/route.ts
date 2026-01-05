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

    // Calculate new amount
    const sign = getCashTransactionSign(validated.data.type);
    const newAmount = cashPosition.amount + (validated.data.amount * sign);

    // Start transaction: create cash transaction and update position
    const { data: transaction, error: txError } = await supabase
      .from('cash_transactions')
      .insert({
        cash_position_id: cashPosition.id,
        type: validated.data.type,
        amount: validated.data.amount,
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
