import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/actions';
import {
  unauthorized,
  badRequest,
  internalServerError,
} from '@/lib/api/errors';
import { validateUUIDOrThrow } from '@/lib/api/utils';
import { calculateAssetPerformance } from '@/lib/api/analytics';

/**
 * GET /api/assets/[assetId]/performance
 * Get asset performance metrics
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

    // Verify asset exists and belongs to user
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .select('id')
      .eq('id', id)
      .single();

    if (assetError || !asset) {
      return badRequest('Asset not found');
    }

    // Calculate performance
    try {
      const performance = await calculateAssetPerformance(supabase, id);
      return NextResponse.json({ data: performance });
    } catch (error) {
      if (error instanceof Error) {
        return internalServerError(error.message);
      }
      return internalServerError('Failed to calculate performance');
    }
  } catch (error) {
    return internalServerError('Internal server error');
  }
}

