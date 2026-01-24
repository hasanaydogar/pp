import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getPortfolios } from '@/lib/api/server';

/**
 * Auth Redirect Page
 *
 * Handles post-login redirection (server-side):
 * 1. Check if user has a last visited portfolio in cookie
 * 2. If yes, redirect to that portfolio
 * 3. If no, fetch user's portfolios from server
 * 4. If user has portfolios, redirect to the first one
 * 5. If no portfolios, redirect to /portfolios page
 */
export default async function AuthRedirectPage() {
  // Check for last visited portfolio in cookie
  const cookieStore = await cookies();
  const lastVisited = cookieStore.get('lastVisitedPortfolio')?.value;

  if (lastVisited) {
    redirect(lastVisited);
  }

  // No last visited portfolio, fetch user's portfolios
  let portfolios: Awaited<ReturnType<typeof getPortfolios>> = [];

  try {
    portfolios = await getPortfolios();
  } catch (error) {
    // Error fetching portfolios, fallback to portfolios list
    console.error('Error fetching portfolios:', error);
  }

  // Redirect based on portfolios (outside try-catch to avoid NEXT_REDIRECT error)
  if (portfolios && portfolios.length > 0) {
    const firstPortfolio = portfolios[0];
    redirect(`/p/${firstPortfolio.slug}`);
  }

  // No portfolios or error, redirect to portfolios page
  redirect('/portfolios');
}
