import { NextResponse } from 'next/server';
import { fetchLivePrice } from '@/lib/services/price-service';

/**
 * GET /api/prices/[symbol]
 * Fetch live price for a symbol
 *
 * Query params:
 * - currency: Asset currency (default: USD)
 *
 * Examples:
 * - GET /api/prices/AAPL → US stock
 * - GET /api/prices/THYAO?currency=TRY → BIST stock
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get('currency') || 'USD';

    // Validate symbol
    if (!symbol || symbol.length < 1 || symbol.length > 15) {
      return NextResponse.json(
        {
          success: false,
          error: {
            symbol: symbol || '',
            error: 'Invalid symbol: must be 1-15 characters',
            code: 'API_ERROR',
          },
        },
        { status: 400 }
      );
    }

    // Validate currency
    const validCurrencies = ['USD', 'TRY', 'EUR', 'GBP', 'JPY', 'HKD', 'AUD', 'CAD', 'CHF'];
    if (!validCurrencies.includes(currency.toUpperCase())) {
      return NextResponse.json(
        {
          success: false,
          error: {
            symbol,
            error: `Invalid currency: ${currency}. Valid: ${validCurrencies.join(', ')}`,
            code: 'API_ERROR',
          },
        },
        { status: 400 }
      );
    }

    // Fetch live price
    const result = await fetchLivePrice(symbol, currency);

    if (!result.success) {
      const status =
        result.error.code === 'NOT_FOUND'
          ? 404
          : result.error.code === 'RATE_LIMITED'
            ? 429
            : 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Price API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          symbol: 'unknown',
          error: 'Internal server error',
          code: 'API_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
