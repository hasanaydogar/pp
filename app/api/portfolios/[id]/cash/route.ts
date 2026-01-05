import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { CreateCashPositionSchema } from '@/lib/types/cash';

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
      .order('currency', { ascending: true });

    if (error) {
      console.error('Error fetching cash positions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/portfolios/[id]/cash:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id: portfolioId } = await params;
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
    const validated = CreateCashPositionSchema.safeParse(body);
    
    if (!validated.success) {
      return NextResponse.json({ error: validated.error.issues }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('cash_positions')
      .insert({
        portfolio_id: portfolioId,
        ...validated.data,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating cash position:', error);
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ 
          error: 'Cash position for this currency already exists' 
        }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/portfolios/[id]/cash:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
