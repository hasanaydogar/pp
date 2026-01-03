import { cookies } from 'next/headers';

/**
 * Get active portfolio ID from cookies (for Server Components)
 * Falls back to first portfolio if no active portfolio is set
 */
export async function getActivePortfolioId(): Promise<string | null> {
  const cookieStore = await cookies();
  const activePortfolioId = cookieStore.get('activePortfolioId')?.value;
  return activePortfolioId || null;
}

/**
 * Set active portfolio ID in cookies (for Server Actions)
 */
export async function setActivePortfolioId(portfolioId: string | null) {
  const cookieStore = await cookies();
  if (portfolioId) {
    cookieStore.set('activePortfolioId', portfolioId, {
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  } else {
    cookieStore.delete('activePortfolioId');
  }
}

