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

// ============================================
// Email/Password Authentication
// ============================================

export async function signInWithEmail(email: string, password: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, user: data.user };
}

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth-redirect`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Check if user needs email confirmation
  const needsConfirmation = data.user && !data.session;

  return {
    success: true,
    user: data.user,
    needsConfirmation,
  };
}

export async function resetPassword(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  });

  if (error) {
    // Don't expose if email exists or not for security
    console.error('Password reset error:', error.message);
  }

  // Always return success for security (don't reveal if email exists)
  return { success: true };
}

export async function updatePassword(newPassword: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================
// User Management
// ============================================

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

