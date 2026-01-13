import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/actions';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const excludeId = searchParams.get('exclude');

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Check if slug exists for this user
    let query = supabase
      .from('portfolios')
      .select('id')
      .eq('user_id', user.id)
      .eq('slug', slug);

    // Exclude current portfolio in edit mode
    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data: existing } = await query.maybeSingle();

    // Generate suggestion if slug is taken
    let suggestion: string | undefined;
    if (existing) {
      const suffix = Date.now().toString(36).slice(-4);
      suggestion = `${slug}-${suffix}`;
    }

    return NextResponse.json({
      available: !existing,
      suggestion,
    });
  } catch (error) {
    console.error('Check slug error:', error);
    return NextResponse.json(
      { error: 'Failed to check slug availability' },
      { status: 500 }
    );
  }
}
