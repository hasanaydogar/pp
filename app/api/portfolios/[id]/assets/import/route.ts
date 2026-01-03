import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/actions';
import { unauthorized, badRequest, internalServerError } from '@/lib/api/errors';
import { validateUUIDOrThrow } from '@/lib/api/utils';
import { TransactionType } from '@/lib/types/portfolio';

interface ImportAsset {
  symbol: string;
  quantity: number;
  averageBuyPrice: number;
  type?: string;
}

interface ImportResult {
  symbol: string;
  success: boolean;
  assetId?: string;
  error?: string;
}

/**
 * POST /api/portfolios/[id]/assets/import
 * Batch import multiple assets into a portfolio
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return unauthorized();
    }

    // Get and validate portfolio ID
    const { id: portfolioId } = await params;

    try {
      validateUUIDOrThrow(portfolioId);
    } catch {
      return badRequest('Invalid portfolio ID');
    }

    // Parse request body
    let body: { assets: ImportAsset[] };
    try {
      body = await request.json();
    } catch {
      return badRequest('Invalid JSON body');
    }

    const { assets } = body;

    // Validate assets array
    if (!assets || !Array.isArray(assets) || assets.length === 0) {
      return badRequest('No assets provided');
    }

    if (assets.length > 100) {
      return badRequest('Maximum 100 assets can be imported at once');
    }

    // Get Supabase client
    const supabase = await createClient();

    // Verify portfolio exists and belongs to user
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('id')
      .eq('id', portfolioId)
      .single();

    if (portfolioError || !portfolio) {
      return badRequest('Portfolio not found');
    }

    // Process assets sequentially for better error handling
    const results: ImportResult[] = [];
    let imported = 0;
    let failed = 0;

    for (const asset of assets) {
      try {
        // Validate required fields
        if (!asset.symbol || typeof asset.symbol !== 'string') {
          results.push({
            symbol: asset.symbol || 'unknown',
            success: false,
            error: 'Symbol is required',
          });
          failed++;
          continue;
        }

        if (
          asset.quantity === null ||
          asset.quantity === undefined ||
          isNaN(asset.quantity) ||
          asset.quantity <= 0
        ) {
          results.push({
            symbol: asset.symbol,
            success: false,
            error: 'Invalid quantity',
          });
          failed++;
          continue;
        }

        if (
          asset.averageBuyPrice === null ||
          asset.averageBuyPrice === undefined ||
          isNaN(asset.averageBuyPrice) ||
          asset.averageBuyPrice < 0
        ) {
          results.push({
            symbol: asset.symbol,
            success: false,
            error: 'Invalid average buy price',
          });
          failed++;
          continue;
        }

        // Create asset
        const { data: newAsset, error: assetError } = await supabase
          .from('assets')
          .insert({
            portfolio_id: portfolioId,
            symbol: asset.symbol.toUpperCase().trim(),
            quantity: asset.quantity,
            average_buy_price: asset.averageBuyPrice,
            type: asset.type || 'STOCK',
            currency: 'TRY', // Default currency, can be extended
          })
          .select()
          .single();

        if (assetError) {
          // Check for duplicate
          if (assetError.code === '23505') {
            results.push({
              symbol: asset.symbol,
              success: false,
              error: 'Asset already exists in portfolio',
            });
          } else {
            results.push({
              symbol: asset.symbol,
              success: false,
              error: assetError.message,
            });
          }
          failed++;
          continue;
        }

        // Create initial BUY transaction
        const { error: txError } = await supabase.from('transactions').insert({
          asset_id: newAsset.id,
          type: TransactionType.BUY,
          amount: asset.quantity,
          price: asset.averageBuyPrice,
          date: new Date().toISOString(),
          transaction_cost: 0,
        });

        if (txError) {
          // Log but don't fail - asset was created successfully
          console.error(
            `Failed to create transaction for ${asset.symbol}:`,
            txError.message
          );
        }

        results.push({
          symbol: asset.symbol,
          success: true,
          assetId: newAsset.id,
        });
        imported++;
      } catch (e) {
        results.push({
          symbol: asset.symbol,
          success: false,
          error: 'Unexpected error',
        });
        failed++;
      }
    }

    // Return results
    return NextResponse.json(
      {
        success: imported > 0,
        imported,
        failed,
        results,
      },
      { status: imported > 0 ? 201 : 400 }
    );
  } catch (error) {
    console.error('Import error:', error);
    return internalServerError('Import failed');
  }
}
