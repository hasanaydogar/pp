'use client';

import React from 'react';
import { 
  CashTransaction, 
  CashTransactionType, 
  getCashTransactionLabel, 
  getCashTransactionSign 
} from '@/lib/types/cash';
import { formatCurrency } from '@/lib/utils/currency';
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  CalendarIcon,
} from '@heroicons/react/20/solid';
import clsx from 'clsx';

interface CashTransactionsListProps {
  transactions: CashTransaction[];
  currency: string;
  loading?: boolean;
}

function getTransactionIcon(type: CashTransactionType) {
  const sign = getCashTransactionSign(type);
  if (sign === 1) {
    return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
  }
  return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
}

export function CashTransactionsList({
  transactions,
  currency,
  loading = false,
}: CashTransactionsListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex items-center gap-4 p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/4" />
            </div>
            <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
        <CalendarIcon className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-600" />
        <p className="mt-2">Henüz nakit hareketi yok</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {transactions.map((transaction) => {
        const sign = getCashTransactionSign(transaction.type);
        const isPositive = sign === 1;
        
        return (
          <div
            key={transaction.id}
            className="flex items-center gap-4 py-3"
          >
            {/* Icon */}
            <div className={clsx(
              'flex h-10 w-10 items-center justify-center rounded-full',
              isPositive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
            )}>
              {getTransactionIcon(transaction.type)}
            </div>
            
            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-zinc-900 dark:text-white truncate">
                {getCashTransactionLabel(transaction.type)}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {new Date(transaction.date).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
                {transaction.notes && (
                  <span className="ml-2">• {transaction.notes}</span>
                )}
              </p>
            </div>
            
            {/* Amount */}
            <div className={clsx(
              'text-right font-semibold tabular-nums',
              isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            )}>
              {isPositive ? '+' : '-'}
              {formatCurrency(Math.abs(transaction.amount), currency)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
