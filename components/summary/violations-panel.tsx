'use client';

import React from 'react';
import { PolicyViolation } from '@/lib/types/policy';
import { Badge } from '@/components/ui/badge';
import { ExclamationTriangleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface ViolationsPanelProps {
  violations: PolicyViolation[];
}

export function ViolationsPanel({ violations }: ViolationsPanelProps) {
  if (violations.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
        <div className="flex items-center gap-2 text-green-600">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">Tüm politikalar uyumlu</span>
        </div>
      </div>
    );
  }

  const criticalViolations = violations.filter(v => v.severity === 'critical');
  const warningViolations = violations.filter(v => v.severity === 'warning');

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white">
          <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
          Politika Uyarıları
        </h3>
        <div className="flex items-center gap-2">
          {criticalViolations.length > 0 && (
            <Badge color="red">{criticalViolations.length} kritik</Badge>
          )}
          {warningViolations.length > 0 && (
            <Badge color="yellow">{warningViolations.length} uyarı</Badge>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {violations.map((violation, index) => (
          <div
            key={index}
            className={`rounded-md p-3 ${
              violation.severity === 'critical'
                ? 'bg-red-50 dark:bg-red-900/20'
                : 'bg-amber-50 dark:bg-amber-900/20'
            }`}
          >
            <div className="flex items-start gap-2">
              {violation.severity === 'critical' ? (
                <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0 text-red-500" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-amber-500" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {violation.asset_symbol && (
                    <span className="font-medium text-zinc-900 dark:text-white">
                      {violation.asset_symbol}
                    </span>
                  )}
                  <Badge color={violation.severity === 'critical' ? 'red' : 'yellow'}>
                    {getViolationTypeLabel(violation.type)}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  Mevcut: %{(violation.current_value * 100).toFixed(1)} | 
                  Limit: %{(violation.limit_value * 100).toFixed(1)}
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  💡 {violation.recommendation}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getViolationTypeLabel(type: string): string {
  switch (type) {
    case 'OVER_WEIGHT':
      return 'Ağırlık Aşımı';
    case 'UNDER_WEIGHT':
      return 'Düşük Ağırlık';
    case 'UNDER_CASH':
      return 'Düşük Nakit';
    case 'OVER_CASH':
      return 'Yüksek Nakit';
    case 'SECTOR_CONCENTRATION':
      return 'Sektör Yoğunlaşması';
    default:
      return type;
  }
}
