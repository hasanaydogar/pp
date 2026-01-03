/**
 * Business logic for portfolio tracker
 */

/**
 * Calculates new average buy price after a BUY transaction
 * Formula: (oldTotal + newTotal) / newQuantity
 * 
 * @param oldQuantity - Current asset quantity
 * @param oldAveragePrice - Current average buy price
 * @param transactionAmount - Amount purchased in transaction
 * @param transactionPrice - Price per unit in transaction
 * @returns Object with new quantity and new average buy price
 */
export function calculateAverageBuyPrice(
  oldQuantity: number,
  oldAveragePrice: number,
  transactionAmount: number,
  transactionPrice: number,
): { newQuantity: number; newAveragePrice: number } {
  // Calculate totals
  const oldTotal = oldQuantity * oldAveragePrice;
  const newTotal = transactionAmount * transactionPrice;
  
  // Calculate new quantity
  const newQuantity = oldQuantity + transactionAmount;
  
  // Calculate new average price
  // Avoid division by zero
  if (newQuantity === 0) {
    throw new Error('Cannot calculate average price with zero quantity');
  }
  
  const newAveragePrice = (oldTotal + newTotal) / newQuantity;
  
  return {
    newQuantity,
    newAveragePrice,
  };
}

/**
 * Validates if sufficient quantity exists for a SELL transaction
 * 
 * @param currentQuantity - Current asset quantity
 * @param sellAmount - Amount to sell
 * @throws Error if insufficient quantity
 */
export function validateSufficientQuantity(
  currentQuantity: number,
  sellAmount: number,
): void {
  if (currentQuantity < sellAmount) {
    throw new Error(
      `Insufficient quantity. Current: ${currentQuantity}, Requested: ${sellAmount}`,
    );
  }
}

/**
 * Calculates realized gain/loss for a SELL transaction
 * Formula: (sale_price - average_buy_price) * amount
 * 
 * @param averageBuyPrice - Average buy price of the asset
 * @param sellPrice - Price per unit sold
 * @param sellAmount - Amount sold
 * @returns Realized gain (positive) or loss (negative)
 */
export function calculateRealizedGainLoss(
  averageBuyPrice: number,
  sellPrice: number,
  sellAmount: number,
): number {
  const costBasis = averageBuyPrice * sellAmount;
  const saleValue = sellPrice * sellAmount;
  return saleValue - costBasis;
}

/**
 * Calculates new quantity after a SELL transaction
 * 
 * @param currentQuantity - Current asset quantity
 * @param sellAmount - Amount sold
 * @returns New quantity after sale
 * @throws Error if insufficient quantity
 */
export function calculateSellTransaction(
  currentQuantity: number,
  sellAmount: number,
): number {
  // Validate sufficient quantity
  validateSufficientQuantity(currentQuantity, sellAmount);
  
  // Calculate new quantity
  const newQuantity = currentQuantity - sellAmount;
  
  // Ensure quantity doesn't go negative (shouldn't happen after validation)
  if (newQuantity < 0) {
    throw new Error('Quantity cannot be negative');
  }
  
  return newQuantity;
}

