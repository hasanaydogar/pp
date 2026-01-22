'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLastVisitedPortfolio } from '@/lib/hooks/use-last-visited-portfolio';
import { Spinner } from '@/components/ui/spinner';

/**
 * Auth Redirect Page
 *
 * Handles post-login redirection:
 * 1. Check if user has a last visited portfolio in localStorage
 * 2. If yes, redirect to that portfolio
 * 3. If no, fetch user's portfolios from API
 * 4. If user has portfolios, redirect to the first one
 * 5. If no portfolios, redirect to /portfolios page
 */
export default function AuthRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleRedirect() {
      // Check for last visited portfolio in localStorage
      const lastVisited = getLastVisitedPortfolio();

      if (lastVisited) {
        // Redirect to last visited portfolio
        router.replace(lastVisited);
        return;
      }

      // No last visited portfolio, fetch user's portfolios
      try {
        const response = await fetch('/api/portfolios');

        if (!response.ok) {
          // API error, fallback to portfolios list
          router.replace('/portfolios');
          return;
        }

        const { data: portfolios } = await response.json();

        if (portfolios && portfolios.length > 0) {
          // Redirect to first portfolio
          const firstPortfolio = portfolios[0];
          router.replace(`/p/${firstPortfolio.slug}`);
        } else {
          // No portfolios, redirect to portfolios page
          router.replace('/portfolios');
        }
      } catch (error) {
        // Network error, fallback to portfolios list
        console.error('Error fetching portfolios:', error);
        router.replace('/portfolios');
      }
    }

    handleRedirect();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Redirecting...
        </p>
      </div>
    </div>
  );
}
