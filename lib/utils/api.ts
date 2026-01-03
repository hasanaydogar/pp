'use client';

import { getAccessToken } from '@/lib/auth/utils';

interface FetchOptions extends RequestInit {
  retry?: boolean;
  retryCount?: number;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  })
    .then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        return data.access_token;
      }
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export async function apiFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { retry = true, retryCount = 0, ...fetchOptions } = options;

  // Get access token from Supabase (client-side)
  const supabase = await import('@/lib/supabase/client').then(
    (m) => m.createClient()
  );
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(fetchOptions.headers);
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: 'include',
  });

  // Handle 401 Unauthorized - try to refresh token and retry
  if (response.status === 401 && retry && retryCount < 1) {
    const newToken = await refreshToken();

    if (newToken) {
      // Retry the request with new token
      headers.set('Authorization', `Bearer ${newToken}`);
      return fetch(url, {
        ...fetchOptions,
        headers,
        credentials: 'include',
      });
    }
  }

  return response;
}

