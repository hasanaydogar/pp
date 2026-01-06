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
  Bar,
  ComposedChart,
  ReferenceLine,
  Line,
} from 'recharts';
import { CashFlowDataPoint } from '@/lib/hooks/use-cash-flow';
import { Period } from '@/lib/utils/period';
import { formatCurrency } from '@/lib/utils/currency';
import clsx from 'clsx';

interface CashFlowChartProps {
  data: CashFlowDataPoint[];
  period: Period;
  currency: string;
  onPeriodChange?: (period: Period) => void;
  height?: number;
  showPeriodSelector?: boolean;
}

export function CashFlowChart({
  data,
  period,
  currency,
  onPeriodChange,
  height = 300,
  showPeriodSelector = false,
}: CashFlowChartProps) {
  // Check if any data point is in the future (for dashed line styling)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  
  // Process data and mark forecast vs actual
  const processedData = data.map(d => {
    const isFuture = new Date(d.date) > today;
    const isForecast = (d as any).isForecast === true || isFuture;
    return {
      ...d,
      isFuture,
      isForecast,
      // Split balance into actual and forecast for dual rendering
      actualBalance: isForecast ? null : d.balance,
      forecastBalance: isForecast ? d.balance : null,
    };
  });
  
  // Check if we have any forecast data
  const hasForecast = processedData.some(d => d.isForecast);
  const formatValue = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1000) {
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
      const d = payload[0].payload as CashFlowDataPoint & { isForecast?: boolean };
      const isForecast = (d as any).isForecast;
      
      return (
        <div className="bg-white dark:bg-zinc-800 shadow-lg rounded-lg p-3 border border-zinc-200 dark:border-zinc-700 min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <p className="font-medium text-zinc-900 dark:text-white">
              {new Date(label).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
            {isForecast && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                Beklenti
              </span>
            )}
          </div>
          
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Bakiye:</span>
              <span className="font-medium">{formatCurrency(d.balance, currency)}</span>
            </div>
            
            {d.change !== 0 && (
              <div className="flex justify-between">
                <span className="text-zinc-500">Günlük:</span>
                <span className={d.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {d.change >= 0 ? '+' : ''}{formatCurrency(d.change, currency)}
                </span>
              </div>
            )}
            
            {d.dividends > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Temettü:</span>
                <span>+{formatCurrency(d.dividends, currency)}</span>
              </div>
            )}
            
            {d.sales > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Satış:</span>
                <span>+{formatCurrency(d.sales, currency)}</span>
              </div>
            )}
            
            {d.purchases > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Alış:</span>
                <span>-{formatCurrency(d.purchases, currency)}</span>
              </div>
            )}
            
            {d.deposits > 0 && (
              <div className="flex justify-between text-blue-600">
                <span>Deposit:</span>
                <span>+{formatCurrency(d.deposits, currency)}</span>
              </div>
            )}
            
            {d.withdrawals > 0 && (
              <div className="flex justify-between text-amber-600">
                <span>Çekim:</span>
                <span>-{formatCurrency(d.withdrawals, currency)}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/50 rounded-lg"
        style={{ height }}
      >
        <p className="text-zinc-500 dark:text-zinc-400">
          Henüz nakit hareketi yok
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend if we have forecasts */}
      {hasForecast && (
        <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-emerald-500" />
            <span>Gerçekleşen</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-indigo-500" style={{ borderTop: '2px dashed' }} />
            <span>Beklenen (Temettü Tahmini)</span>
          </div>
        </div>
      )}
      
      {/* Chart */}
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={processedData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
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
              width={60}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* Today marker line if we have forecast data */}
            {hasForecast && (
              <ReferenceLine 
                x={todayStr} 
                stroke="#6366f1" 
                strokeDasharray="5 5" 
                strokeWidth={1}
                label={{ value: 'Bugün', position: 'top', fontSize: 10, fill: '#6366f1' }}
              />
            )}
            
            {/* Main balance area - solid for actual data */}
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorBalance)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
              connectNulls={false}
            />
            
            {/* Forecast overlay - dashed line and different color for forecast points */}
            {hasForecast && (
              <Line
                type="monotone"
                dataKey="forecastBalance"
                stroke="#6366f1"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={{ fill: '#6366f1', r: 4 }}
                activeDot={{ r: 5, strokeWidth: 2, fill: '#6366f1' }}
                connectNulls={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
