import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { CreatePortfolioPolicySchema, UpdatePortfolioPolicySchema, DEFAULT_POLICY } from '@/lib/types/policy';

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
      .from('portfolio_policies')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No policy exists, return default values
        return NextResponse.json({
          portfolio_id: portfolioId,
          ...DEFAULT_POLICY,
          is_default: true,
        });
      }
      console.error('Error fetching portfolio policy:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ...data, is_default: false });
  } catch (error) {
    console.error('Error in GET /api/portfolios/[id]/policy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
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
    const validated = UpdatePortfolioPolicySchema.safeParse(body);
    
    if (!validated.success) {
      return NextResponse.json({ error: validated.error.issues }, { status: 400 });
    }

    // Upsert policy
    const { data, error } = await supabase
      .from('portfolio_policies')
      .upsert({
        portfolio_id: portfolioId,
        ...validated.data,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'portfolio_id',
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating portfolio policy:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PUT /api/portfolios/[id]/policy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
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

    const { error } = await supabase
      .from('portfolio_policies')
      .delete()
      .eq('portfolio_id', portfolioId);

    if (error) {
      console.error('Error deleting portfolio policy:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Policy deleted, default values will be used' 
    });
  } catch (error) {
    console.error('Error in DELETE /api/portfolios/[id]/policy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
