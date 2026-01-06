import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { UpdateCashPositionSchema } from '@/lib/types/cash';

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

    const { data, error } = await supabase
      .from('cash_positions')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .eq('currency', currency.toUpperCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Cash position not found' }, { status: 404 });
      }
      console.error('Error fetching cash position:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/portfolios/[id]/cash/[currency]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
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

    const body = await request.json();
    const validated = UpdateCashPositionSchema.safeParse(body);
    
    if (!validated.success) {
      return NextResponse.json({ error: validated.error.issues }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('cash_positions')
      .update({
        ...validated.data,
        last_updated: new Date().toISOString(),
      })
      .eq('portfolio_id', portfolioId)
      .eq('currency', currency.toUpperCase())
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Cash position not found' }, { status: 404 });
      }
      console.error('Error updating cash position:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PUT /api/portfolios/[id]/cash/[currency]:', error);
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

    const { error } = await supabase
      .from('cash_positions')
      .delete()
      .eq('portfolio_id', portfolioId)
      .eq('currency', currency.toUpperCase());

    if (error) {
      console.error('Error deleting cash position:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/portfolios/[id]/cash/[currency]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
