import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/actions';
import {
  unauthorized,
  badRequest,
  internalServerError,
} from '@/lib/api/errors';
import { validateUUIDOrThrow, validateWithZod } from '@/lib/api/utils';
import { BulkTransactionImportSchema } from '@/lib/types/portfolio';
import {
  sortTransactionsByDate,
  validateHistoricalDates,
  validateTransactionOrder,
} from '@/lib/api/import-utils';
import { TransactionType } from '@/lib/types/portfolio';
import {
  calculateAverageBuyPrice,
  calculateSellTransaction,
  calculateRealizedGainLoss,
} from '@/lib/api/business-logic';
import { z } from 'zod';

/**
 * POST /api/assets/[assetId]/transactions/import
 * Bulk import historical transactions for an asset
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
      validatedData = validateWithZod(BulkTransactionImportSchema, body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return badRequest('Validation error', error.issues);
      }
      throw error;
    }

    // Get Supabase client
    const supabase = await createClient();

    // Verify asset exists and belongs to user
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .select('id, quantity, average_buy_price')
      .eq('id', id)
      .single();

    if (assetError || !asset) {
      return badRequest('Asset not found');
    }

    // Validate historical dates
    try {
      validateHistoricalDates(validatedData.transactions);
    } catch (error) {
      if (error instanceof Error) {
        return badRequest(error.message);
      }
      return badRequest('Invalid transaction dates');
    }

    // Check for out-of-order transactions (warnings only)
    const warnings = validateTransactionOrder(validatedData.transactions);

    // Sort transactions by date (oldest first)
    const sortedTransactions = sortTransactionsByDate(
      validatedData.transactions,
    );

    // Ensure all transactions have correct asset_id
    const transactionsToInsert = sortedTransactions.map((t) => ({
      ...t,
      asset_id: id,
    }));

    // Process transactions and update asset incrementally
    let currentQuantity = asset.quantity;
    let currentAveragePrice = asset.average_buy_price;
    const createdTransactions: unknown[] = [];
    const errors: string[] = [];

    for (const transaction of transactionsToInsert) {
      try {
        if (transaction.type === TransactionType.BUY) {
          // Calculate new quantity and average price
          const { newQuantity, newAveragePrice } = calculateAverageBuyPrice(
            currentQuantity,
            currentAveragePrice,
            transaction.amount,
            transaction.price,
          );

          // Create transaction
          const { data: createdTransaction, error: transactionError } =
            await supabase
              .from('transactions')
              .insert(transaction)
              .select()
              .single();

          if (transactionError) {
            errors.push(
              `Failed to create transaction: ${transactionError.message}`,
            );
            continue;
          }

          // Update running totals
          currentQuantity = newQuantity;
          currentAveragePrice = newAveragePrice;
          createdTransactions.push(createdTransaction);
        } else if (transaction.type === TransactionType.SELL) {
          // Validate sufficient quantity
          if (currentQuantity < transaction.amount) {
            errors.push(
              `Insufficient quantity for SELL transaction. Current: ${currentQuantity}, Requested: ${transaction.amount}`,
            );
            continue;
          }

          // Calculate realized gain/loss
          const realizedGainLoss = calculateRealizedGainLoss(
            currentAveragePrice,
            transaction.price,
            transaction.amount,
          );

          // Calculate new quantity
          const newQuantity = calculateSellTransaction(
            currentQuantity,
            transaction.amount,
          );

          // Create transaction with realized gain/loss
          const transactionData = {
            ...transaction,
            realized_gain_loss: realizedGainLoss,
          };

          const { data: createdTransaction, error: transactionError } =
            await supabase
              .from('transactions')
              .insert(transactionData)
              .select()
              .single();

          if (transactionError) {
            errors.push(
              `Failed to create transaction: ${transactionError.message}`,
            );
            continue;
          }

          // Update running totals
          currentQuantity = newQuantity;
          createdTransactions.push(createdTransaction);
        }
      } catch (error) {
        if (error instanceof Error) {
          errors.push(`Error processing transaction: ${error.message}`);
        } else {
          errors.push('Unknown error processing transaction');
        }
      }
    }

    // Update asset with final quantity and average price
    const { error: updateError } = await supabase
      .from('assets')
      .update({
        quantity: currentQuantity,
        average_buy_price: currentAveragePrice,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      errors.push(`Failed to update asset: ${updateError.message}`);
    }

    // Return results
    return NextResponse.json(
      {
        data: {
          created: createdTransactions.length,
          failed: errors.length,
          transactions: createdTransactions,
          warnings: warnings.length > 0 ? warnings : undefined,
          errors: errors.length > 0 ? errors : undefined,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return internalServerError('Internal server error');
  }
}

