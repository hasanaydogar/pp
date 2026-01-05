import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/actions';
import {
  unauthorized,
  notFound,
  internalServerError,
} from '@/lib/api/errors';
import { createSlug, urlToSymbol } from '@/lib/utils/slug';

/**
 * GET /api/portfolios/by-slug/[slug]/assets/[symbol]
 * Get asset by portfolio slug and asset symbol
 * 
 * Example: /api/portfolios/by-slug/borsa-istanbul/assets/doas
 * Returns the DOAS asset from "Borsa İstanbul" portfolio
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; symbol: string }> },
) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return unauthorized();
    }

    // Await params
    const { slug, symbol } = await params;

    if (!slug || !symbol) {
      return notFound('Portfolio slug and asset symbol are required');
    }

    // Convert URL symbol to uppercase for database lookup
    const assetSymbol = urlToSymbol(symbol);

    // Get Supabase client
    const supabase = await createClient();

    // Get all portfolios for user
    const { data: portfolios, error: portfolioError } = await supabase
      .from('portfolios')
      .select('id, name, base_currency')
      .eq('user_id', user.id);

    if (portfolioError) {
      return internalServerError(portfolioError.message);
    }

    // Find portfolio where createSlug(name) matches the provided slug
    const portfolio = portfolios?.find(p => createSlug(p.name) === slug);

    if (!portfolio) {
      return notFound('Portfolio not found');
    }

    // Get asset with transactions from the matched portfolio
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .select(`
        *,
        transactions (*)
      `)
      .eq('portfolio_id', portfolio.id)
      .ilike('symbol', assetSymbol)
      .single();

    if (assetError) {
      if (assetError.code === 'PGRST116') {
        return notFound(`Asset ${assetSymbol} not found in portfolio`);
      }
      return internalServerError(assetError.message);
    }

    // Return asset with portfolio info
    return NextResponse.json({
      data: {
        ...asset,
        portfolio: {
          id: portfolio.id,
          name: portfolio.name,
          slug: slug,
          base_currency: portfolio.base_currency,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching asset by slug and symbol:', error);
    return internalServerError('Internal server error');
  }
}
