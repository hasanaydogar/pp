'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { AuthProvider } from '@/lib/types/auth';

export async function signInWithProvider(provider: AuthProvider) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback?next=/auth-redirect`,
    },
  });

  if (error) {
    throw new Error(`Failed to sign in with ${provider}: ${error.message}`);
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(`Failed to sign out: ${error.message}`);
  }

  redirect('/login');
}

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Extract full name from various sources
  const metadata = user.user_metadata || {};

  const fullName =
    metadata.full_name ||
    metadata.name ||
    (metadata.given_name && metadata.family_name
      ? `${metadata.given_name} ${metadata.family_name}`
      : metadata.given_name || metadata.family_name) ||
    null;

  // Extract avatar URL from various sources
  const avatarUrl =
    metadata.avatar_url ||
    metadata.picture ||
    metadata.photo_url ||
    null;

  return {
    id: user.id,
    provider_id: user.id,
    provider_type: (user.app_metadata?.provider as AuthProvider) || 'google',
    email: user.email || '',
    avatar_url: avatarUrl,
    name: fullName,
  };
}

