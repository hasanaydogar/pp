import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/actions';
import {
  unauthorized,
  internalServerError,
  badRequest,
} from '@/lib/api/errors';
import { validateWithZod, validateCurrencyOrThrow } from '@/lib/api/utils';
import { CreatePortfolioSchema } from '@/lib/types/portfolio';
import { createSlug } from '@/lib/utils/slug';
import { z } from 'zod';

/**
 * GET /api/portfolios
 * List all portfolios for the authenticated user
 */
export async function GET() {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return unauthorized();
    }

    // Get Supabase client
    const supabase = await createClient();

    // Get portfolios (RLS automatically filters to user's portfolios)
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .order('created_at', { ascending: false });

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
 * POST /api/portfolios
 * Create a new portfolio for the authenticated user
 */
export async function POST(request: Request) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return unauthorized();
    }

    // Parse and validate request body
    const body = await request.json();
    let validatedData;
    try {
      validatedData = validateWithZod(CreatePortfolioSchema, body);
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

    // Generate slug: use provided slug or generate from name
    let slug = validatedData.slug || createSlug(validatedData.name);

    // Check if slug is already taken for this user
    const { data: existingPortfolio } = await supabase
      .from('portfolios')
      .select('id')
      .eq('user_id', user.id)
      .eq('slug', slug)
      .maybeSingle();

    if (existingPortfolio) {
      // Add unique suffix if slug is taken
      const suffix = Date.now().toString(36).slice(-4);
      slug = `${slug}-${suffix}`;
    }

    // Create portfolio
    const { data, error } = await supabase
      .from('portfolios')
      .insert({
        ...validatedData,
        slug,
        user_id: user.id,
      })
      .select()
      .single();

    // Handle errors
    if (error) {
      return internalServerError(error.message);
    }

    // Return success
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return internalServerError('Internal server error');
  }
}

