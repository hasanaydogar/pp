'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ExclamationTriangleIcon, BellAlertIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '@/lib/utils/currency';
import clsx from 'clsx';

interface PendingDividend {
  id: string;
  symbol: string;
  grossAmount: number;
  netAmount: number;
  currency: string;
  paymentDate: string;
  daysOverdue: number;
}

interface PendingDividendsBannerProps {
  pendingDividends: PendingDividend[];
  onReviewClick: (dividend: PendingDividend) => void;
  className?: string;
}

export function PendingDividendsBanner({
  pendingDividends,
  onReviewClick,
  className,
}: PendingDividendsBannerProps) {
  if (pendingDividends.length === 0) {
    return null;
  }

  const totalPending = pendingDividends.reduce((sum, d) => sum + d.netAmount, 0);
  const currency = pendingDividends[0]?.currency || 'TRY';

  return (
    <div className={clsx(
      'rounded-lg border-2 border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20 p-4',
      className
    )}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <BellAlertIcon className="h-6 w-6 text-amber-500 dark:text-amber-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
            {pendingDividends.length} Temettü Onay Bekliyor
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
            Aşağıdaki temettü beklentilerinin vadesi doldu. Lütfen gerçekleşip gerçekleşmediğini onaylayın.
          </p>
          
          {/* List pending dividends */}
          <div className="mt-3 space-y-2">
            {pendingDividends.slice(0, 3).map((dividend) => (
              <div
                key={dividend.id}
                className="flex items-center justify-between bg-white dark:bg-zinc-800 rounded-md px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {dividend.symbol}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {new Date(dividend.paymentDate).toLocaleDateString('tr-TR')}
                  </span>
                  {dividend.daysOverdue > 0 && (
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      ({dividend.daysOverdue} gün geçti)
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(dividend.netAmount, dividend.currency)}
                  </span>
                  <Button
                    color="amber"
                    onClick={() => onReviewClick(dividend)}
                    className="text-xs py-1 px-2"
                  >
                    İncele
                  </Button>
                </div>
              </div>
            ))}
            
            {pendingDividends.length > 3 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                +{pendingDividends.length - 3} temettü daha bekliyor
              </p>
            )}
          </div>
          
          {/* Total */}
          <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-700 flex items-center justify-between">
            <span className="text-sm text-amber-700 dark:text-amber-300">
              Toplam Bekleyen:
            </span>
            <span className="font-bold text-lg text-amber-800 dark:text-amber-200">
              {formatCurrency(totalPending, currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
