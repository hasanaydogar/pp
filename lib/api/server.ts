import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/actions';
import { notFound, unauthorized } from './errors';

/**
 * Server-side API client utilities
 * These functions are meant to be used in Server Components and Server Actions
 */

/**
 * Get authenticated Supabase client
 * Throws error if user is not authenticated
 */
export async function getAuthenticatedSupabase() {
  const user = await getCurrentUser();
  if (!user) {
    throw unauthorized('Authentication required');
  }
  return createClient();
}

/**
 * Fetch portfolios for the current user
 */
export async function getPortfolios() {
  const supabase = await getAuthenticatedSupabase();
  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch portfolios: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch a single portfolio by ID
 */
export async function getPortfolio(id: string) {
  const supabase = await getAuthenticatedSupabase();
  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw notFound('Portfolio not found');
    }
    throw new Error(`Failed to fetch portfolio: ${error.message}`);
  }

  return data;
}

/**
 * Fetch portfolio with nested assets and transactions
 */
export async function getPortfolioWithDetails(id: string) {
  const supabase = await getAuthenticatedSupabase();
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

  if (error) {
    if (error.code === 'PGRST116') {
      throw notFound('Portfolio not found');
    }
    throw new Error(`Failed to fetch portfolio: ${error.message}`);
  }

  return data;
}

/**
 * Fetch assets for a portfolio
 */
export async function getPortfolioAssets(portfolioId: string) {
  const supabase = await getAuthenticatedSupabase();
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch assets: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch all assets for the current user
 */
export async function getAllAssets() {
  const supabase = await getAuthenticatedSupabase();
  
  // First get user's portfolios
  const { data: portfolios, error: portfoliosError } = await supabase
    .from('portfolios')
    .select('id');

  if (portfoliosError) {
    throw new Error(`Failed to fetch portfolios: ${portfoliosError.message}`);
  }

  if (!portfolios || portfolios.length === 0) {
    return [];
  }

  const portfolioIds = portfolios.map((p) => p.id);

  // Then get all assets from those portfolios
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .in('portfolio_id', portfolioIds)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch assets: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch a single asset by ID
 */
export async function getAsset(id: string) {
  const supabase = await getAuthenticatedSupabase();
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw notFound('Asset not found');
    }
    throw new Error(`Failed to fetch asset: ${error.message}`);
  }

  return data;
}

/**
 * Fetch asset with nested transactions
 */
export async function getAssetWithTransactions(id: string) {
  const supabase = await getAuthenticatedSupabase();
  const { data, error } = await supabase
    .from('assets')
    .select(`
      *,
      transactions (*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw notFound('Asset not found');
    }
    throw new Error(`Failed to fetch asset: ${error.message}`);
  }

  return data;
}

/**
 * Fetch transactions for an asset
 */
export async function getAssetTransactions(assetId: string, limit?: number, offset?: number) {
  const supabase = await getAuthenticatedSupabase();
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('asset_id', assetId)
    .order('date', { ascending: false });

  if (limit !== undefined) {
    query = query.limit(limit);
  }
  if (offset !== undefined) {
    query = query.range(offset, offset + (limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }

  return data || [];
}

