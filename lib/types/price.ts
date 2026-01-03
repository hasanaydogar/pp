/**
 * Live Price Types
 * Types for Yahoo Finance price data
 */

export interface LivePrice {
  symbol: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  currency: string;
  marketState: 'PRE' | 'REGULAR' | 'POST' | 'CLOSED';
  lastUpdated: string;
}

export interface PriceError {
  symbol: string;
  error: string;
  code: 'NOT_FOUND' | 'API_ERROR' | 'RATE_LIMITED' | 'TIMEOUT';
}

export type PriceResult =
  | { success: true; data: LivePrice }
  | { success: false; error: PriceError };
