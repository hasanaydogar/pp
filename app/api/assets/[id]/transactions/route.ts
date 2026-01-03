import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/actions';
import {
  unauthorized,
  badRequest,
  internalServerError,
} from '@/lib/api/errors';
import {
  validateUUIDOrThrow,
  validateWithZod,
  validateCurrencyOrThrow,
} from '@/lib/api/utils';
import { CreateTransactionSchema } from '@/lib/types/portfolio';
import {
  calculateAverageBuyPrice,
  calculateSellTransaction,
  calculateRealizedGainLoss,
  validateSufficientQuantity,
} from '@/lib/api/business-logic';
import {
  createCostBasisLot,
  calculateFIFOCostBasis,
} from '@/lib/api/cost-basis';
import { TransactionType } from '@/lib/types/portfolio';
import { z } from 'zod';

/**
 * GET /api/assets/[assetId]/transactions
 * List all transactions for an asset with pagination
 */
export async function GET(
  request: NextRequest,
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

    // Get pagination parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const order = searchParams.get('order') || 'desc';

    // Get Supabase client
    const supabase = await createClient();

    // Get transactions with pagination
    const { data, error, count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('asset_id', id)
      .order('date', { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    // Handle errors
    if (error) {
      return internalServerError(error.message);
    }

    // Return success
    return NextResponse.json({ data, count });
  } catch (error) {
    return internalServerError('Internal server error');
  }
}

/**
 * POST /api/assets/[assetId]/transactions
 * Record new transaction (BUY or SELL)
 * For BUY transactions, automatically updates asset's quantity and average_buy_price
 */
export async function POST(
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

    // Parse and validate request body
    const body = await request.json();
    let validatedData;
    try {
      validatedData = validateWithZod(CreateTransactionSchema, body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return badRequest('Validation error', error.issues);
      }
      throw error;
    }

    // Ensure asset_id matches route parameter
    if (validatedData.asset_id !== id) {
      return badRequest('Asset ID mismatch');
    }

    // Validate currency if provided
    if (validatedData.currency) {
      try {
        validateCurrencyOrThrow(validatedData.currency);
      } catch (error) {
        return error as NextResponse;
      }
    }

    // Get Supabase client
    const supabase = await createClient();

    // For BUY transactions, we need to update the asset
    if (validatedData.type === TransactionType.BUY) {
      // Fetch current asset
      const { data: asset, error: assetError } = await supabase
        .from('assets')
        .select('quantity, average_buy_price')
        .eq('id', id)
        .single();

      if (assetError || !asset) {
        return badRequest('Asset not found');
      }

      // Calculate new average buy price
      const { newQuantity, newAveragePrice } = calculateAverageBuyPrice(
        asset.quantity,
        asset.average_buy_price,
        validatedData.amount,
        validatedData.price,
      );

      // Create transaction and update asset atomically
      // Note: Supabase doesn't support transactions directly,
      // but RLS ensures data integrity
      // We'll create the transaction first, then update the asset
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert(validatedData)
        .select()
        .single();

      if (transactionError) {
        return internalServerError(transactionError.message);
      }

      // Create cost basis lot for FIFO tracking
      try {
        await createCostBasisLot(
          supabase,
          id,
          transaction.id,
          validatedData.amount,
          validatedData.price,
        );
      } catch (error) {
        // Log error but don't fail the transaction
        // Cost basis lot creation is optional for now
        console.error('Failed to create cost basis lot:', error);
      }

      // Update asset
      const { error: updateError } = await supabase
        .from('assets')
        .update({
          quantity: newQuantity,
          average_buy_price: newAveragePrice,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        // If asset update fails, we should ideally rollback the transaction
        // But Supabase doesn't support transactions, so we'll just return an error
        // In production, you might want to implement a cleanup mechanism
        return internalServerError(
          'Transaction created but asset update failed',
        );
      }

      return NextResponse.json({ data: transaction }, { status: 201 });
    } else {
      // For SELL transactions, reduce quantity and calculate realized gain/loss
      // Fetch current asset
      const { data: asset, error: assetError } = await supabase
        .from('assets')
        .select('quantity, average_buy_price')
        .eq('id', id)
        .single();

      if (assetError || !asset) {
        return badRequest('Asset not found');
      }

      // Validate sufficient quantity
      try {
        validateSufficientQuantity(asset.quantity, validatedData.amount);
      } catch (error) {
        if (error instanceof Error) {
          return badRequest(error.message);
        }
        return badRequest('Insufficient quantity');
      }

      // Calculate new quantity after sale
      const newQuantity = calculateSellTransaction(
        asset.quantity,
        validatedData.amount,
      );

      // Calculate realized gain/loss using FIFO cost basis
      let realizedGainLoss: number;
      try {
        // Try FIFO method first
        const fifoResult = await calculateFIFOCostBasis(
          supabase,
          id,
          validatedData.amount,
        );
        const saleValue = validatedData.price * validatedData.amount;
        realizedGainLoss = saleValue - fifoResult.costBasis;
      } catch (error) {
        // Fallback to Average Cost method if FIFO fails (e.g., no lots exist)
        realizedGainLoss = calculateRealizedGainLoss(
          asset.average_buy_price,
          validatedData.price,
          validatedData.amount,
        );
      }

      // Create transaction with realized gain/loss
      const transactionData = {
        ...validatedData,
        realized_gain_loss: realizedGainLoss,
      };

      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (transactionError) {
        return internalServerError(transactionError.message);
      }

      // Update asset quantity
      // Note: We keep the asset even if quantity becomes zero for history
      const { error: updateError } = await supabase
        .from('assets')
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        // If asset update fails, we should ideally rollback the transaction
        // But Supabase doesn't support transactions, so we'll just return an error
        // In production, you might want to implement a cleanup mechanism
        return internalServerError(
          'Transaction created but asset update failed',
        );
      }

      return NextResponse.json({ data: transaction }, { status: 201 });
    }
  } catch (error) {
    return internalServerError('Internal server error');
  }
}

