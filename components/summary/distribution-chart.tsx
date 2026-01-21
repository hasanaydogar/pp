'use client';

import { useMemo } from 'react';
import { Text } from '@/components/ui/text';

interface DistributionItem {
  name: string;
  value: number;
  percentage: number;
  color?: string;
}

interface DistributionChartProps {
  title: string;
  data: DistributionItem[];
  currency?: string;
  showValues?: boolean;
  showPercentages?: boolean;
  maxItems?: number;
}

// Default color palette
const DEFAULT_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
  '#14B8A6', // teal
  '#6366F1', // indigo
];

function formatCurrency(value: number, currency: string = 'TRY'): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function DistributionChart({
  title,
  data,
  currency = 'TRY',
  showValues = true,
  showPercentages = true,
  maxItems = 10,
}: DistributionChartProps) {
  const chartData = useMemo(() => {
    // Sort by value descending and limit
    const sorted = [...data].sort((a, b) => b.value - a.value);

    if (sorted.length <= maxItems) {
      return sorted.map((item, index) => ({
        ...item,
        color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      }));
    }

    // Group remaining items as "Diğer"
    const top = sorted.slice(0, maxItems - 1);
    const others = sorted.slice(maxItems - 1);
    const othersTotal = others.reduce((sum, item) => sum + item.value, 0);
    const othersPercentage = others.reduce((sum, item) => sum + item.percentage, 0);

    return [
      ...top.map((item, index) => ({
        ...item,
        color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      })),
      {
        name: 'Diğer',
        value: othersTotal,
        percentage: othersPercentage,
        color: '#6B7280', // gray
      },
    ];
  }, [data, maxItems]);

  const total = useMemo(() => {
    return data.reduce((sum, item) => sum + item.value, 0);
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <Text className="font-medium">{title}</Text>
        <div className="mt-4 flex items-center justify-center py-8">
          <Text className="text-zinc-400">Veri bulunamadı</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <Text className="font-semibold text-zinc-900 dark:text-white">{title}</Text>

      {/* Stacked Bar Chart */}
      <div className="mt-4">
        <div className="flex h-6 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          {chartData.map((item, index) => (
            <div
              key={item.name}
              className="relative transition-all duration-300 hover:opacity-80"
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.color,
              }}
              title={`${item.name}: ${formatCurrency(item.value, currency)} (${item.percentage.toFixed(1)}%)`}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-zinc-700 dark:text-zinc-300">{item.name}</span>
            </div>
            <div className="flex items-center gap-3 text-right">
              {showValues && (
                <span className="font-medium text-zinc-900 dark:text-white">
                  {formatCurrency(item.value, currency)}
                </span>
              )}
              {showPercentages && (
                <span className="w-14 text-zinc-500">
                  {item.percentage.toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      {showValues && (
        <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 text-sm dark:border-zinc-700">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Toplam</span>
          <span className="font-semibold text-zinc-900 dark:text-white">
            {formatCurrency(total, currency)}
          </span>
        </div>
      )}
    </div>
  );
}

// Donut/Pie Chart Alternative
export function DonutChart({
  title,
  data,
  currency = 'TRY',
  size = 160,
}: {
  title: string;
  data: DistributionItem[];
  currency?: string;
  size?: number;
}) {
  const chartData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
    }));
  }, [data]);

  const total = useMemo(() => {
    return data.reduce((sum, item) => sum + item.value, 0);
  }, [data]);

  // Calculate segments for SVG
  const segments = useMemo(() => {
    let cumulativePercent = 0;
    return chartData.map((item) => {
      const start = cumulativePercent;
      cumulativePercent += item.percentage;
      return {
        ...item,
        startPercent: start,
        endPercent: cumulativePercent,
      };
    });
  }, [chartData]);

  const radius = size / 2;
  const strokeWidth = radius * 0.3;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * normalizedRadius;

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <Text className="font-medium">{title}</Text>
        <div className="mt-4 flex items-center justify-center py-8">
          <Text className="text-zinc-400">Veri bulunamadı</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <Text className="font-semibold text-zinc-900 dark:text-white">{title}</Text>

      <div className="mt-4 flex items-center gap-6">
        {/* Donut Chart */}
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            {segments.map((segment, index) => {
              const offset = circumference * (1 - segment.startPercent / 100);
              const length = circumference * (segment.percentage / 100);
              return (
                <circle
                  key={segment.name}
                  cx={radius}
                  cy={radius}
                  r={normalizedRadius}
                  fill="transparent"
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${length} ${circumference - length}`}
                  strokeDashoffset={offset}
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xs text-zinc-500">Toplam</div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                {formatCurrency(total, currency)}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-1.5">
          {chartData.slice(0, 6).map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-zinc-600 dark:text-zinc-400">{item.name}</span>
              </div>
              <span className="text-zinc-500">{item.percentage.toFixed(1)}%</span>
            </div>
          ))}
          {chartData.length > 6 && (
            <div className="text-xs text-zinc-400">+{chartData.length - 6} daha...</div>
          )}
        </div>
      </div>
    </div>
  );
}
