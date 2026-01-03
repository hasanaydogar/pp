import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function getAccessToken(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token || null;
}

export async function refreshToken(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.refreshSession();

  if (error || !session) {
    return null;
  }

  return session.access_token;
}

export async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getAccessToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}
