'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

/**
 * React Query Provider Component
 * 
 * Wraps the application with QueryClientProvider to enable React Query hooks
 * 
 * Features:
 * - Automatic caching and background refetching
 * - Optimistic updates support
 * - DevTools in development mode
 * 
 * @example
 * ```tsx
 * <QueryProvider>
 *   <App />
 * </QueryProvider>
 * ```
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create QueryClient instance once per component mount
  // This ensures each user session has its own cache
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default stale time: 5 minutes
            staleTime: 5 * 60 * 1000,
            // Default garbage collection time: 10 minutes
            gcTime: 10 * 60 * 1000,
            // Retry failed requests twice
            retry: 2,
            // Refetch on window focus if data is stale
            refetchOnWindowFocus: true,
            // Refetch on reconnect if data is stale
            refetchOnReconnect: true,
            // Don't refetch on mount if data is fresh
            refetchOnMount: false,
          },
          mutations: {
            // Retry failed mutations once
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show DevTools in development mode */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      )}
    </QueryClientProvider>
  );
}
