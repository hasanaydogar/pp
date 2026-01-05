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
} from 'recharts';
import { PortfolioSnapshot, Period } from '@/lib/types/snapshot';
import { formatCurrency } from '@/lib/utils/currency';

interface PerformanceChartProps {
  snapshots: PortfolioSnapshot[];
  period: Period;
  currency: string;
  height?: number;
}

export function PerformanceChart({
  snapshots,
  period,
  currency,
  height = 300,
}: PerformanceChartProps) {
  // Format data for chart
  const chartData = snapshots.map((snapshot) => ({
    date: snapshot.snapshot_date,
    value: Number(snapshot.total_value),
    change: Number(snapshot.daily_change),
    changePercent: Number(snapshot.daily_change_percent),
  }));

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toFixed(0);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPositive = data.change >= 0;
      
      return (
        <div className="bg-white dark:bg-zinc-800 shadow-lg rounded-lg p-3 border border-zinc-200 dark:border-zinc-700">
          <p className="font-medium text-zinc-900 dark:text-white mb-1">
            {new Date(label).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
          <p className="text-lg font-semibold text-zinc-900 dark:text-white">
            {formatCurrency(data.value, currency)}
          </p>
          {data.change !== 0 && (
            <p className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{formatCurrency(data.change, currency)} ({isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%)
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/50 rounded-lg"
        style={{ height }}
      >
        <p className="text-zinc-500 dark:text-zinc-400">
          Henüz yeterli veri yok
        </p>
      </div>
    );
  }

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-zinc-200 dark:stroke-zinc-700"
            vertical={false}
          />
          
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fill: 'currentColor', fontSize: 11 }}
            className="text-zinc-500"
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          
          <YAxis
            tickFormatter={formatValue}
            tick={{ fill: 'currentColor', fontSize: 11 }}
            className="text-zinc-500"
            axisLine={false}
            tickLine={false}
            width={50}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
