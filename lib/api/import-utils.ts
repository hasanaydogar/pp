/**
 * Utilities for bulk import operations
 */

import { CreateTransaction } from '@/lib/types/portfolio';

/**
 * Transaction data without asset_id - used for bulk import operations
 * where asset_id is added after validation
 */
export type TransactionImportData = Omit<CreateTransaction, 'asset_id'>;

/**
 * Sorts transactions chronologically (oldest first)
 * @param transactions Array of transactions to sort
 * @returns Sorted array of transactions
 */
export function sortTransactionsByDate<T extends TransactionImportData>(
  transactions: T[],
): T[] {
  return [...transactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateA - dateB;
  });
}

/**
 * Calculates initial quantity and average buy price from historical transactions
 * Processes transactions chronologically and calculates running totals
 *
 * @param transactions Array of transactions sorted by date (oldest first)
 * @returns Object with calculated quantity and average buy price
 */
export function calculateAssetFromTransactions<T extends TransactionImportData>(
  transactions: T[],
): {
  quantity: number;
  averageBuyPrice: number;
  initialPurchaseDate: string | null;
} {
  if (transactions.length === 0) {
    throw new Error('Cannot calculate asset from empty transactions');
  }

  // Sort transactions by date (oldest first)
  const sortedTransactions = sortTransactionsByDate(transactions);

  // Get initial purchase date (first transaction date)
  const initialPurchaseDate = sortedTransactions[0]?.date || null;

  // Process transactions chronologically
  let currentQuantity = 0;
  let totalCostBasis = 0;

  for (const transaction of sortedTransactions) {
    if (transaction.type === 'BUY') {
      // Add to quantity and cost basis
      const transactionCostBasis = transaction.amount * transaction.price;
      totalCostBasis += transactionCostBasis;
      currentQuantity += transaction.amount;
    } else if (transaction.type === 'SELL') {
      // Reduce quantity
      if (currentQuantity < transaction.amount) {
        throw new Error(
          `Insufficient quantity for SELL transaction. Current: ${currentQuantity}, Requested: ${transaction.amount}`,
        );
      }
      // For average cost method, reduce cost basis proportionally to quantity sold
      // This maintains the same average buy price after selling
      const averageCostPerUnit = currentQuantity > 0 ? totalCostBasis / currentQuantity : 0;
      totalCostBasis -= averageCostPerUnit * transaction.amount;
      currentQuantity -= transaction.amount;
    }
  }

  // Calculate average buy price
  // If quantity is zero, we can't calculate average (all sold)
  let averageBuyPrice = 0;
  if (currentQuantity > 0) {
    averageBuyPrice = totalCostBasis / currentQuantity;
  } else {
    // If all sold, use the last average price before selling everything
    // This is a fallback - ideally we'd track this differently
    // For now, we'll use the last BUY transaction price
    const lastBuyTransaction = sortedTransactions
      .reverse()
      .find((t) => t.type === 'BUY');
    if (lastBuyTransaction) {
      averageBuyPrice = lastBuyTransaction.price;
    }
  }

  return {
    quantity: currentQuantity,
    averageBuyPrice,
    initialPurchaseDate,
  };
}

/**
 * Validates that transaction dates are not in the future
 * @param transactions Array of transactions to validate
 * @throws Error if any transaction date is in the future
 */
export function validateHistoricalDates<T extends TransactionImportData>(
  transactions: T[],
): void {
  const now = new Date();
  for (const transaction of transactions) {
    const transactionDate = new Date(transaction.date);
    if (transactionDate > now) {
      throw new Error(
        `Transaction date cannot be in the future: ${transaction.date}`,
      );
    }
  }
}

/**
 * Validates transaction order (warns if out of order, but doesn't fail)
 * @param transactions Array of transactions
 * @returns Array of warnings for out-of-order transactions
 */
export function validateTransactionOrder<T extends TransactionImportData>(
  transactions: T[],
): string[] {
  const warnings: string[] = [];
  const sorted = sortTransactionsByDate(transactions);

  // Check if original order matches sorted order
  for (let i = 0; i < transactions.length; i++) {
    if (transactions[i].date !== sorted[i].date) {
      warnings.push(
        `Transaction at index ${i} is out of chronological order. Will be processed in correct order.`,
      );
    }
  }

  return warnings;
}

