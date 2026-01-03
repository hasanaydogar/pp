// Chart data types for Lightweight Charts integration

export type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y' | 'MAX';

export type ChartType = 'candlestick' | 'line' | 'area' | 'bar';

export const CHART_TYPE_CONFIG: Record<ChartType, { label: string; icon: string }> = {
  candlestick: { label: 'Mum', icon: '📊' },
  line: { label: 'Çizgi', icon: '📈' },
  area: { label: 'Alan', icon: '📉' },
  bar: { label: 'Bar', icon: '📶' },
};

export interface TimeRangeConfig {
  label: string;
  yahooRange: string;
  yahooInterval: string;
}

export const TIME_RANGE_CONFIG: Record<TimeRange, TimeRangeConfig> = {
  '1D': { label: '1G', yahooRange: '1d', yahooInterval: '5m' },
  '1W': { label: '1H', yahooRange: '5d', yahooInterval: '1h' },
  '1M': { label: '1A', yahooRange: '1mo', yahooInterval: '1d' },
  '3M': { label: '3A', yahooRange: '3mo', yahooInterval: '1d' },
  '1Y': { label: '1Y', yahooRange: '1y', yahooInterval: '1d' },
  '5Y': { label: '5Y', yahooRange: '5y', yahooInterval: '1wk' },
  'MAX': { label: 'MAX', yahooRange: 'max', yahooInterval: '1mo' },
};

export interface CandlestickData {
  time: string; // 'YYYY-MM-DD' format
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface VolumeData {
  time: string;
  value: number;
  color: string;
}

export interface LineData {
  time: string;
  value: number;
}

export interface ChartMeta {
  currency: string;
  exchangeName: string;
  regularMarketPrice: number;
  previousClose: number;
}

export interface ChartData {
  symbol: string;
  candles: CandlestickData[];
  volume: VolumeData[];
  sma20: LineData[];
  sma50: LineData[];
  meta: ChartMeta;
}

export interface ChartApiResponse {
  success: boolean;
  data?: ChartData;
  error?: string;
}
