import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/actions';
import {
  unauthorized,
  badRequest,
  notFound,
  internalServerError,
} from '@/lib/api/errors';
import {
  validateUUIDOrThrow,
  validateWithZod,
  validateCurrencyOrThrow,
} from '@/lib/api/utils';
import { UpdatePortfolioSchema } from '@/lib/types/portfolio';
import { z } from 'zod';

/**
 * GET /api/portfolios/[id]
 * Get portfolio details with nested assets and transactions
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

    // Get portfolio with nested assets and transactions
    const { data, error } = await supabase
      .from('portfolios')
      .select(`
        *,
        assets (
          *,
          transactions (*)
        )
      `)
      .eq('id', id)
      .single();

    // Handle errors
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return notFound('Portfolio not found');
      }
      return internalServerError(error.message);
    }

    // Return success
    return NextResponse.json({ data });
  } catch (error) {
    return internalServerError('Internal server error');
  }
}

/**
 * PUT /api/portfolios/[id]
 * Update portfolio (e.g., change name)
 */
export async function PUT(
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
      validatedData = validateWithZod(UpdatePortfolioSchema, body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return badRequest('Validation error', error.issues);
      }
      throw error;
    }

    // Validate currency if provided
    if (validatedData.base_currency) {
      try {
        validateCurrencyOrThrow(validatedData.base_currency);
      } catch (error) {
        return error as NextResponse;
      }
    }

    // Get Supabase client
    const supabase = await createClient();

    // If slug is being updated, check for uniqueness
    if (validatedData.slug) {
      const { data: existingPortfolio } = await supabase
        .from('portfolios')
        .select('id')
        .eq('user_id', user.id)
        .eq('slug', validatedData.slug)
        .neq('id', id)
        .maybeSingle();

      if (existingPortfolio) {
        return NextResponse.json(
          { error: 'Bu URL kısaltması zaten kullanımda' },
          { status: 409 }
        );
      }
    }

    // Update portfolio
    const { data, error } = await supabase
      .from('portfolios')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    // Handle errors
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return notFound('Portfolio not found');
      }
      return internalServerError(error.message);
    }

    // Return success
    return NextResponse.json({ data });
  } catch (error) {
    return internalServerError('Internal server error');
  }
}

/**
 * DELETE /api/portfolios/[id]
 * Delete portfolio (cascade deletes assets and transactions)
 */
export async function DELETE(
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

    // Delete portfolio (cascade handled by database)
    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', id);

    // Handle errors
    if (error) {
      return internalServerError(error.message);
    }

    // Return success
    return NextResponse.json({
      message: 'Portfolio deleted successfully',
    });
  } catch (error) {
    return internalServerError('Internal server error');
  }
}

