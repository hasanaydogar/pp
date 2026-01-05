'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency } from '@/lib/utils/currency';

interface ChartDataPoint {
  year: number;
  optimistic?: number;
  base?: number;
  pessimistic?: number;
  value?: number;
}

interface ProjectionChartProps {
  data: ChartDataPoint[];
  showScenarios?: boolean;
  currency: string;
}

export function ProjectionChart({
  data,
  showScenarios = false,
  currency,
}: ProjectionChartProps) {
  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toFixed(0);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-800 shadow-lg rounded-lg p-3 border border-zinc-200 dark:border-zinc-700">
          <p className="font-semibold text-zinc-900 dark:text-white mb-2">
            {label === 0 ? 'Şimdi' : `${label} Yıl Sonra`}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-zinc-500 dark:text-zinc-400">{entry.name}:</span>
              <span className="font-medium text-zinc-900 dark:text-white">
                {formatCurrency(entry.value, currency)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorOptimistic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPessimistic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
          
          <XAxis
            dataKey="year"
            tickFormatter={(value) => value === 0 ? 'Şimdi' : `${value}Y`}
            className="text-zinc-500"
            tick={{ fill: 'currentColor', fontSize: 12 }}
          />
          
          <YAxis
            tickFormatter={formatValue}
            className="text-zinc-500"
            tick={{ fill: 'currentColor', fontSize: 12 }}
            width={60}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          {showScenarios ? (
            <>
              <Legend />
              <Area
                type="monotone"
                dataKey="optimistic"
                name="İyimser (+2%)"
                stroke="#22c55e"
                fillOpacity={1}
                fill="url(#colorOptimistic)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="base"
                name="Baz Senaryo"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorBase)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="pessimistic"
                name="Kötümser (-2%)"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorPessimistic)"
                strokeWidth={2}
              />
            </>
          ) : (
            <Area
              type="monotone"
              dataKey="base"
              name="Tahmini Değer"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorBase)"
              strokeWidth={2}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
