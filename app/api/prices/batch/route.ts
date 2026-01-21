import { NextResponse } from 'next/server';
import { fetchLivePrice } from '@/lib/services/price-service';
import { LivePrice, PriceError } from '@/lib/types/price';

interface BatchPriceRequest {
  symbol: string;
  currency: string;
}

interface BatchPriceResult {
  symbol: string;
  currency: string;
  success: boolean;
  data?: LivePrice;
  error?: PriceError;
}

/**
 * POST /api/prices/batch
 * Fetch live prices for multiple symbols
 *
 * Request body:
 * {
 *   symbols: [
 *     { symbol: "AAPL", currency: "USD" },
 *     { symbol: "THYAO", currency: "TRY" }
 *   ]
 * }
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     "AAPL": { success: true, data: {...} },
 *     "THYAO": { success: true, data: {...} }
 *   }
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const symbols: BatchPriceRequest[] = body.symbols;

    // Validate request
    if (!Array.isArray(symbols) || symbols.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'symbols must be a non-empty array',
        },
        { status: 400 }
      );
    }

    // Limit batch size to prevent abuse
    if (symbols.length > 50) {
      return NextResponse.json(
        {
          success: false,
          error: 'Maximum 50 symbols per request',
        },
        { status: 400 }
      );
    }

    // Fetch all prices in parallel
    const results = await Promise.all(
      symbols.map(async ({ symbol, currency }): Promise<[string, BatchPriceResult]> => {
        const result = await fetchLivePrice(symbol, currency || 'USD');
        return [
          symbol,
          {
            symbol,
            currency: currency || 'USD',
            success: result.success,
            data: result.success ? result.data : undefined,
            error: !result.success ? result.error : undefined,
          },
        ];
      })
    );

    // Convert to object keyed by symbol
    const priceMap: Record<string, BatchPriceResult> = Object.fromEntries(results);

    return NextResponse.json(
      {
        success: true,
        data: priceMap,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('Batch price API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
