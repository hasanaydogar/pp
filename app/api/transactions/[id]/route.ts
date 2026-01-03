import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/actions';
import {
  unauthorized,
  badRequest,
  notFound,
  internalServerError,
} from '@/lib/api/errors';
import { validateUUIDOrThrow, validateWithZod } from '@/lib/api/utils';
import { UpdateTransactionSchema } from '@/lib/types/portfolio';
import { z } from 'zod';

/**
 * GET /api/transactions/[id]
 * Get transaction details
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

    // Get transaction
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    // Handle errors
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return notFound('Transaction not found');
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
 * PUT /api/transactions/[id]
 * Update transaction
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
      validatedData = validateWithZod(UpdateTransactionSchema, body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return badRequest('Validation error', error.issues);
      }
      throw error;
    }

    // Get Supabase client
    const supabase = await createClient();

    // Update transaction
    const { data, error } = await supabase
      .from('transactions')
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
        return notFound('Transaction not found');
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
 * DELETE /api/transactions/[id]
 * Delete transaction
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

    // Delete transaction
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    // Handle errors
    if (error) {
      return internalServerError(error.message);
    }

    // Return success
    return NextResponse.json({
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    return internalServerError('Internal server error');
  }
}

