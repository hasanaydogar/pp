import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { CreatePortfolioTypeSchema } from '@/lib/types/policy';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('portfolio_types')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching portfolio types:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/portfolio-types:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = CreatePortfolioTypeSchema.safeParse(body);
    
    if (!validated.success) {
      return NextResponse.json({ error: validated.error.issues }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('portfolio_types')
      .insert({ ...validated.data, user_id: user.id })
      .select()
      .single();

    if (error) {
      console.error('Error creating portfolio type:', error);
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'Portfolio type with this name already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/portfolio-types:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
