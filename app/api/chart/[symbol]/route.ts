import { NextResponse } from 'next/server';
import { fetchChartData } from '@/lib/services/chart-data-service';
import { TimeRange } from '@/lib/types/chart';

const VALID_RANGES: TimeRange[] = ['1D', '1W', '1M', '3M', '1Y', '5Y', 'MAX'];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const { searchParams } = new URL(request.url);
    
    const rangeParam = searchParams.get('range') || '1M';
    const currency = searchParams.get('currency') || 'USD';

    // Validate range
    if (!VALID_RANGES.includes(rangeParam as TimeRange)) {
      return NextResponse.json(
        { success: false, error: `Invalid range. Valid values: ${VALID_RANGES.join(', ')}` },
        { status: 400 }
      );
    }

    const range = rangeParam as TimeRange;

    if (!symbol) {
      return NextResponse.json(
        { success: false, error: 'Symbol is required' },
        { status: 400 }
      );
    }

    const data = await fetchChartData(symbol, currency, range);

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('Chart API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isNotFound = errorMessage.includes('No chart data') || errorMessage.includes('No valid price');
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: isNotFound ? 404 : 500 }
    );
  }
}
