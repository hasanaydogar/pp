import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('sectors')
      .select('*')
      .order('display_name', { ascending: true });

    if (error) {
      console.error('Error fetching sectors:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error in GET /api/sectors:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
