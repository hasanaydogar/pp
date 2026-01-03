import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/actions';
import {
  unauthorized,
  badRequest,
  internalServerError,
} from '@/lib/api/errors';
import { validateUUIDOrThrow } from '@/lib/api/utils';
import { getCostBasisInfo } from '@/lib/api/cost-basis';

/**
 * GET /api/assets/[assetId]/cost-basis
 * Get cost basis information for an asset
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
      .select('id, average_buy_price')
      .eq('id', id)
      .single();

    if (assetError || !asset) {
      return badRequest('Asset not found');
    }

    // Get cost basis information
    try {
      const costBasisInfo = await getCostBasisInfo(supabase, id);

      // Calculate average cost basis for comparison
      const averageCostBasis =
        asset.average_buy_price * costBasisInfo.remainingQuantity;

      return NextResponse.json({
        data: {
          ...costBasisInfo,
          averageCostBasis,
          method: 'FIFO',
        },
      });
    } catch (error) {
      // If no cost basis lots exist, return average cost method info
      return NextResponse.json({
        data: {
          totalLots: 0,
          totalQuantity: 0,
          totalCostBasis: 0,
          remainingQuantity: asset.average_buy_price ? 0 : 0,
          remainingCostBasis: 0,
          lots: [],
          averageCostBasis: asset.average_buy_price || 0,
          method: 'Average Cost',
          note: 'No cost basis lots found. Using average cost method.',
        },
      });
    }
  } catch (error) {
    return internalServerError('Internal server error');
  }
}

