import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/actions';
import {
  unauthorized,
  badRequest,
  internalServerError,
} from '@/lib/api/errors';
import { validateUUIDOrThrow } from '@/lib/api/utils';
import { calculateTransactionAnalytics } from '@/lib/api/analytics';

/**
 * GET /api/portfolios/[portfolioId]/transactions/analytics
 * Get transaction analytics for a portfolio
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return unauthorized();
    }

    // Await params
    const { id } = await params;

    // Validate UUID
    try {
      validateUUIDOrThrow(id);
    } catch {
      return badRequest('Invalid UUID format');
    }

    // Get Supabase client
    const supabase = await createClient();

    // Verify portfolio exists and belongs to user
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('id')
      .eq('id', id)
      .single();

    if (portfolioError || !portfolio) {
      return badRequest('Portfolio not found');
    }

    // Calculate analytics
    try {
      const analytics = await calculateTransactionAnalytics(supabase, id);
      return NextResponse.json({ data: analytics });
    } catch (error) {
      if (error instanceof Error) {
        return internalServerError(error.message);
      }
      return internalServerError('Failed to calculate transaction analytics');
    }
  } catch (error) {
    return internalServerError('Internal server error');
  }
}

