import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/actions';
import {
  unauthorized,
  notFound,
  internalServerError,
} from '@/lib/api/errors';
import { createSlug } from '@/lib/utils/slug';

/**
 * GET /api/portfolios/by-slug/[slug]
 * Get portfolio by URL slug (derived from portfolio name)
 * 
 * The slug is matched against portfolio names by converting them to slugs
 * Example: slug "borsa-istanbul" matches portfolio named "Borsa İstanbul"
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return unauthorized();
    }

    // Await params
    const { slug } = await params;

    if (!slug) {
      return notFound('Portfolio slug is required');
    }

    // Get Supabase client
    const supabase = await createClient();

    // Get all portfolios for user
    const { data: portfolios, error } = await supabase
      .from('portfolios')
      .select(`
        *,
        assets (
          *,
          transactions (*)
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      return internalServerError(error.message);
    }

    // Find portfolio where createSlug(name) matches the provided slug
    const portfolio = portfolios?.find(p => createSlug(p.name) === slug);

    if (!portfolio) {
      return notFound('Portfolio not found');
    }

    // Return portfolio with assets
    return NextResponse.json({ data: portfolio });
  } catch (error) {
    console.error('Error fetching portfolio by slug:', error);
    return internalServerError('Internal server error');
  }
}
