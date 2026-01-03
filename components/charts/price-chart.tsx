'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  IChartApi,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
} from 'lightweight-charts';
import { TimeRange, TIME_RANGE_CONFIG } from '@/lib/types/chart';
import { useChartData } from '@/lib/hooks/use-chart-data';
import { Text } from '@/components/ui/text';

interface PriceChartProps {
  symbol: string;
  currency: string;
  height?: number;
  showVolume?: boolean;
  showSMA20?: boolean;
  showSMA50?: boolean;
  defaultRange?: TimeRange;
}

const CHART_COLORS = {
  up: '#22c55e',
  down: '#ef4444',
  sma20: '#3b82f6',
  sma50: '#f97316',
};

export function PriceChart({
  symbol,
  currency,
  height = 400,
  showVolume = true,
  showSMA20 = true,
  showSMA50 = true,
  defaultRange = '1M',
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { data, loading, error, range, setRange } = useChartData(symbol, currency, defaultRange);
  const [isDark, setIsDark] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDark();

    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Initialize and update chart
  useEffect(() => {
    if (!chartContainerRef.current || !data || data.candles.length === 0) return;

    // Clear previous chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const backgroundColor = isDark ? '#18181b' : '#ffffff';
    const textColor = isDark ? '#a1a1aa' : '#71717a';
    const gridColor = isDark ? '#27272a' : '#f4f4f5';
    const borderColor = isDark ? '#27272a' : '#e4e4e7';

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height - 60, // Account for header and legend
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: isDark ? '#52525b' : '#d4d4d8',
          labelBackgroundColor: isDark ? '#27272a' : '#e4e4e7',
        },
        horzLine: {
          color: isDark ? '#52525b' : '#d4d4d8',
          labelBackgroundColor: isDark ? '#27272a' : '#e4e4e7',
        },
      },
      rightPriceScale: {
        borderColor,
      },
      timeScale: {
        borderColor,
        timeVisible: range === '1D' || range === '1W',
      },
    });

    chartRef.current = chart;

    // Candlestick series (v5 API)
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: CHART_COLORS.up,
      downColor: CHART_COLORS.down,
      borderUpColor: CHART_COLORS.up,
      borderDownColor: CHART_COLORS.down,
      wickUpColor: CHART_COLORS.up,
      wickDownColor: CHART_COLORS.down,
    });
    candleSeries.setData(data.candles as never[]);

    // Volume series (v5 API)
    if (showVolume && data.volume.length > 0) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: 'volume' },
        priceScaleId: 'volume',
      });
      volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.85, bottom: 0 },
      });
      volumeSeries.setData(data.volume as never[]);
    }

    // SMA 20 (v5 API)
    if (showSMA20 && data.sma20.length > 0) {
      const sma20Series = chart.addSeries(LineSeries, {
        color: CHART_COLORS.sma20,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      sma20Series.setData(data.sma20 as never[]);
    }

    // SMA 50 (v5 API)
    if (showSMA50 && data.sma50.length > 0) {
      const sma50Series = chart.addSeries(LineSeries, {
        color: CHART_COLORS.sma50,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      sma50Series.setData(data.sma50 as never[]);
    }

    chart.timeScale().fitContent();

    // Resize handler
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data, isDark, height, showVolume, showSMA20, showSMA50, range]);

  const timeRanges = Object.keys(TIME_RANGE_CONFIG) as TimeRange[];

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header with time range buttons */}
      <div className="mb-4 flex items-center justify-between">
        <Text className="font-semibold">Price Chart</Text>
        <div className="flex gap-1">
          {timeRanges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              disabled={loading}
              className={`rounded px-2 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                range === r
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
              }`}
            >
              {TIME_RANGE_CONFIG[r].label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart container */}
      {loading && !data ? (
        <div
          className="w-full animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800"
          style={{ height: height - 60 }}
        />
      ) : error ? (
        <div
          className="flex items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800"
          style={{ height: height - 60 }}
        >
          <Text className="text-zinc-500">Chart data unavailable</Text>
        </div>
      ) : data && data.candles.length > 0 ? (
        <div
          ref={chartContainerRef}
          style={{ height: height - 60 }}
          className={loading ? 'opacity-50' : ''}
        />
      ) : (
        <div
          className="flex items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800"
          style={{ height: height - 60 }}
        >
          <Text className="text-zinc-500">No data available</Text>
        </div>
      )}

      {/* Legend */}
      {data && (showSMA20 || showSMA50) && (
        <div className="mt-3 flex gap-4 text-xs">
          {showSMA20 && data.sma20.length > 0 && (
            <div className="flex items-center gap-1.5">
              <div
                className="h-0.5 w-4 rounded"
                style={{ backgroundColor: CHART_COLORS.sma20 }}
              />
              <Text className="text-zinc-500">SMA 20</Text>
            </div>
          )}
          {showSMA50 && data.sma50.length > 0 && (
            <div className="flex items-center gap-1.5">
              <div
                className="h-0.5 w-4 rounded"
                style={{ backgroundColor: CHART_COLORS.sma50 }}
              />
              <Text className="text-zinc-500">SMA 50</Text>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
