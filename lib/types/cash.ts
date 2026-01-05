import { z } from 'zod';

// ============================================================================
// CASH TRANSACTION TYPES
// ============================================================================

export enum CashTransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  BUY_ASSET = 'BUY_ASSET',
  SELL_ASSET = 'SELL_ASSET',
  DIVIDEND = 'DIVIDEND',
  FEE = 'FEE',
  INTEREST = 'INTEREST',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
}

// ============================================================================
// CASH POSITION
// ============================================================================

export interface CashPosition {
  id: string;
  portfolio_id: string;
  currency: string;
  amount: number;
  last_updated: string;
  notes?: string | null;
}

export const CashPositionSchema = z.object({
  id: z.string().uuid(),
  portfolio_id: z.string().uuid(),
  currency: z.string().min(1).max(10),
  amount: z.number(),
  last_updated: z.string().datetime(),
  notes: z.string().nullable().optional(),
});

export const CreateCashPositionSchema = z.object({
  currency: z.string().min(1).max(10).default('TRY'),
  amount: z.number().default(0),
  notes: z.string().optional(),
});

export const UpdateCashPositionSchema = z.object({
  amount: z.number().optional(),
  notes: z.string().nullable().optional(),
});

export type CreateCashPosition = z.infer<typeof CreateCashPositionSchema>;
export type UpdateCashPosition = z.infer<typeof UpdateCashPositionSchema>;

// ============================================================================
// CASH TRANSACTION
// ============================================================================

export interface CashTransaction {
  id: string;
  cash_position_id: string;
  type: CashTransactionType;
  amount: number;
  related_transaction_id?: string | null;
  date: string;
  notes?: string | null;
  created_at: string;
}

export const CashTransactionSchema = z.object({
  id: z.string().uuid(),
  cash_position_id: z.string().uuid(),
  type: z.nativeEnum(CashTransactionType),
  amount: z.number(),
  related_transaction_id: z.string().uuid().nullable().optional(),
  date: z.string().datetime(),
  notes: z.string().nullable().optional(),
  created_at: z.string().datetime(),
});

export const CreateCashTransactionSchema = z.object({
  type: z.nativeEnum(CashTransactionType),
  amount: z.number(),
  date: z.string().datetime().optional(),
  notes: z.string().optional(),
  related_transaction_id: z.string().uuid().optional(),
});

export type CreateCashTransaction = z.infer<typeof CreateCashTransactionSchema>;

// ============================================================================
// CASH SUMMARY (for portfolio dashboard)
// ============================================================================

export interface CashSummary {
  total_cash: number;
  total_cash_in_display_currency: number;
  positions: CashPosition[];
  cash_percentage: number;
  target_percentage: number;
  status: 'below_target' | 'on_target' | 'above_target';
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getCashTransactionSign(type: CashTransactionType): 1 | -1 {
  switch (type) {
    case CashTransactionType.DEPOSIT:
    case CashTransactionType.SELL_ASSET:
    case CashTransactionType.DIVIDEND:
    case CashTransactionType.INTEREST:
    case CashTransactionType.TRANSFER_IN:
      return 1; // Increases cash
    case CashTransactionType.WITHDRAW:
    case CashTransactionType.BUY_ASSET:
    case CashTransactionType.FEE:
    case CashTransactionType.TRANSFER_OUT:
      return -1; // Decreases cash
  }
}

export function getCashTransactionLabel(type: CashTransactionType): string {
  switch (type) {
    case CashTransactionType.DEPOSIT:
      return 'Para Yatırma';
    case CashTransactionType.WITHDRAW:
      return 'Para Çekme';
    case CashTransactionType.BUY_ASSET:
      return 'Varlık Alımı';
    case CashTransactionType.SELL_ASSET:
      return 'Varlık Satışı';
    case CashTransactionType.DIVIDEND:
      return 'Temettü';
    case CashTransactionType.FEE:
      return 'Komisyon/Ücret';
    case CashTransactionType.INTEREST:
      return 'Faiz Geliri';
    case CashTransactionType.TRANSFER_IN:
      return 'Transfer (Gelen)';
    case CashTransactionType.TRANSFER_OUT:
      return 'Transfer (Giden)';
  }
}
