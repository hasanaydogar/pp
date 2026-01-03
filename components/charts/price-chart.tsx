'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  IChartApi,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  AreaSeries,
  BarSeries,
} from 'lightweight-charts';
import { TimeRange, TIME_RANGE_CONFIG, ChartType, CHART_TYPE_CONFIG } from '@/lib/types/chart';
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
  defaultChartType?: ChartType;
}

const CHART_COLORS = {
  up: '#22c55e',
  down: '#ef4444',
  sma20: '#3b82f6',
  sma50: '#f97316',
  line: '#8b5cf6',
  area: '#06b6d4',
};

export function PriceChart({
  symbol,
  currency,
  height = 400,
  showVolume = true,
  showSMA20 = true,
  showSMA50 = true,
  defaultRange = '1M',
  defaultChartType = 'candlestick',
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { data, loading, error, range, setRange } = useChartData(symbol, currency, defaultRange);
  const [isDark, setIsDark] = useState(false);
  const [chartType, setChartType] = useState<ChartType>(defaultChartType);

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
      height: height - 80, // Account for header and legend
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

    // Convert candle data to line/area format
    const lineData = data.candles.map((c) => ({ time: c.time, value: c.close }));

    // Add main price series based on chart type
    switch (chartType) {
      case 'candlestick': {
        const candleSeries = chart.addSeries(CandlestickSeries, {
          upColor: CHART_COLORS.up,
          downColor: CHART_COLORS.down,
          borderUpColor: CHART_COLORS.up,
          borderDownColor: CHART_COLORS.down,
          wickUpColor: CHART_COLORS.up,
          wickDownColor: CHART_COLORS.down,
        });
        candleSeries.setData(data.candles as never[]);
        break;
      }
      case 'bar': {
        const barSeries = chart.addSeries(BarSeries, {
          upColor: CHART_COLORS.up,
          downColor: CHART_COLORS.down,
        });
        barSeries.setData(data.candles as never[]);
        break;
      }
      case 'line': {
        const lineSeries = chart.addSeries(LineSeries, {
          color: CHART_COLORS.line,
          lineWidth: 2,
        });
        lineSeries.setData(lineData as never[]);
        break;
      }
      case 'area': {
        const areaSeries = chart.addSeries(AreaSeries, {
          lineColor: CHART_COLORS.area,
          topColor: isDark ? 'rgba(6, 182, 212, 0.4)' : 'rgba(6, 182, 212, 0.3)',
          bottomColor: isDark ? 'rgba(6, 182, 212, 0.0)' : 'rgba(6, 182, 212, 0.0)',
          lineWidth: 2,
        });
        areaSeries.setData(lineData as never[]);
        break;
      }
    }

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
  }, [data, isDark, height, showVolume, showSMA20, showSMA50, range, chartType]);

  const timeRanges = Object.keys(TIME_RANGE_CONFIG) as TimeRange[];
  const chartTypes = Object.keys(CHART_TYPE_CONFIG) as ChartType[];

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header with controls */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Text className="font-semibold">Price Chart</Text>
          {/* Chart type selector */}
          <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700">
            {chartTypes.map((type) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                disabled={loading}
                title={CHART_TYPE_CONFIG[type].label}
                className={`px-2 py-1 text-sm transition-colors first:rounded-l-md last:rounded-r-md disabled:opacity-50 ${
                  chartType === type
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                }`}
              >
                {CHART_TYPE_CONFIG[type].icon}
              </button>
            ))}
          </div>
        </div>
        {/* Time range selector */}
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
          style={{ height: height - 80 }}
        />
      ) : error ? (
        <div
          className="flex items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800"
          style={{ height: height - 80 }}
        >
          <Text className="text-zinc-500">Chart data unavailable</Text>
        </div>
      ) : data && data.candles.length > 0 ? (
        <div
          ref={chartContainerRef}
          style={{ height: height - 80 }}
          className={loading ? 'opacity-50' : ''}
        />
      ) : (
        <div
          className="flex items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800"
          style={{ height: height - 80 }}
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
