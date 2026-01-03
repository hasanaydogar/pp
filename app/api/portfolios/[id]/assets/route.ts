import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/actions';
import {
  unauthorized,
  badRequest,
  internalServerError,
} from '@/lib/api/errors';
import {
  validateUUIDOrThrow,
  validateWithZod,
  validateCurrencyOrThrow,
} from '@/lib/api/utils';
import { CreateAssetSchema } from '@/lib/types/portfolio';
import { z } from 'zod';

/**
 * GET /api/portfolios/[portfolioId]/assets
 * List all assets in a portfolio
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return unauthorized();
    }

    // Await params
    const { id } = await params;

    // Validate UUID
    try {
      validateUUIDOrThrow(id);
    } catch {
      return badRequest('Invalid UUID format');
    }

    // Get Supabase client
    const supabase = await createClient();

    // Get assets in portfolio (RLS ensures user can only access their portfolios)
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('portfolio_id', id);

    // Handle errors
    if (error) {
      return internalServerError(error.message);
    }

    // Return success
    return NextResponse.json({ data });
  } catch (error) {
    return internalServerError('Internal server error');
  }
}

/**
 * POST /api/portfolios/[portfolioId]/assets
 * Add new asset to portfolio
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return unauthorized();
    }

    // Await params
    const { id } = await params;

    // Validate UUID
    try {
      validateUUIDOrThrow(id);
    } catch {
      return badRequest('Invalid UUID format');
    }

    // Parse and validate request body
    const body = await request.json();
    let validatedData;
    try {
      validatedData = validateWithZod(CreateAssetSchema, body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return badRequest('Validation error', error.issues);
      }
      throw error;
    }

    // Ensure portfolio_id matches route parameter
    if (validatedData.portfolio_id !== id) {
      return badRequest('Portfolio ID mismatch');
    }

    // Validate currency if provided
    if (validatedData.currency) {
      try {
        validateCurrencyOrThrow(validatedData.currency);
      } catch (error) {
        return error as NextResponse;
      }
    }

    // Get Supabase client
    const supabase = await createClient();

    // Create asset (RLS ensures user can only create in their portfolios)
    const { data, error } = await supabase
      .from('assets')
      .insert(validatedData)
      .select()
      .single();

    // Handle errors
    if (error) {
      // Check for duplicate asset constraint
      if (error.code === '23505') {
        // Unique violation
        return badRequest(
          'Asset with this symbol and type already exists in this portfolio',
        );
      }
      return internalServerError(error.message);
    }

    // Return success
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return internalServerError('Internal server error');
  }
}

