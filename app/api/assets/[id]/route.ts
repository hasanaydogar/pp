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
import { UpdateAssetSchema } from '@/lib/types/portfolio';
import { z } from 'zod';

/**
 * GET /api/assets/[id]
 * Get asset details with nested transactions
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

    // Get asset with nested transactions
    const { data, error } = await supabase
      .from('assets')
      .select(`
        *,
        transactions (*)
      `)
      .eq('id', id)
      .single();

    // Handle errors
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return notFound('Asset not found');
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
 * PUT /api/assets/[id]
 * Update asset (quantity, price, symbol, type)
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
      validatedData = validateWithZod(UpdateAssetSchema, body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return badRequest('Validation error', error.issues);
      }
      throw error;
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

    // Update asset
    const { data, error } = await supabase
      .from('assets')
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
        return notFound('Asset not found');
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
 * DELETE /api/assets/[id]
 * Delete asset (cascade deletes transactions)
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

    // Delete asset (cascade handled by database)
    const { error } = await supabase.from('assets').delete().eq('id', id);

    // Handle errors
    if (error) {
      return internalServerError(error.message);
    }

    // Return success
    return NextResponse.json({
      message: 'Asset deleted successfully',
    });
  } catch (error) {
    return internalServerError('Internal server error');
  }
}

