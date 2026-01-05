'use client';

import React, { useState } from 'react';
import { AssetWithMetrics } from '@/lib/types/asset-metrics';
import { calculateAssetDistribution } from '@/lib/utils/asset-sorting';
import { formatCurrency } from '@/lib/utils/currency';
import clsx from 'clsx';

interface AssetDistributionBarProps {
  assets: AssetWithMetrics[];
  totalValue: number;
  maxItems?: number;
  displayCurrency: string;
}

export function AssetDistributionBar({
  assets,
  totalValue,
  maxItems = 6,
  displayCurrency,
}: AssetDistributionBarProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const distribution = calculateAssetDistribution(assets, maxItems);
  
  if (distribution.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-3">
      {/* Distribution Bar */}
      <div className="relative h-4 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div className="absolute inset-0 flex">
          {distribution.map((item, index) => (
            <div
              key={item.symbol}
              className={clsx(
                'relative h-full transition-opacity duration-150',
                hoveredIndex !== null && hoveredIndex !== index && 'opacity-50'
              )}
              style={{
                width: `${item.weight * 100}%`,
                backgroundColor: item.color,
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip */}
              {hoveredIndex === index && (
                <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 transform">
                  <div className="whitespace-nowrap rounded-md bg-zinc-900 px-3 py-2 text-sm text-white shadow-lg dark:bg-zinc-700">
                    <div className="font-semibold">{item.symbol}</div>
                    <div className="text-zinc-300">
                      {formatCurrency(item.value, displayCurrency)}
                    </div>
                    <div className="text-zinc-400">
                      {(item.weight * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="absolute left-1/2 top-full -mt-1 -translate-x-1/2 transform">
                    <div className="border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-700" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {distribution.map((item, index) => (
          <div
            key={item.symbol}
            className={clsx(
              'flex items-center gap-1.5 text-sm transition-opacity duration-150',
              hoveredIndex !== null && hoveredIndex !== index && 'opacity-50'
            )}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-medium text-zinc-900 dark:text-white">
              {item.symbol}
            </span>
            <span className="text-zinc-500 dark:text-zinc-400">
              {(item.weight * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
