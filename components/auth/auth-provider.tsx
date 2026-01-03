'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { createClient } from '@/lib/supabase/client';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    async function checkAuth() {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser({
          id: user.id,
          provider_id: user.id,
          provider_type:
            (user.app_metadata?.provider as 'google' | 'apple' | 'github') ||
            'google',
          email: user.email || '',
          avatar_url: user.user_metadata?.avatar_url,
          name:
            user.user_metadata?.full_name || user.user_metadata?.name,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    }

    checkAuth();

    // Listen for auth changes
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const user = session.user;
        setUser({
          id: user.id,
          provider_id: user.id,
          provider_type:
            (user.app_metadata?.provider as 'google' | 'apple' | 'github') ||
            'google',
          email: user.email || '',
          avatar_url: user.user_metadata?.avatar_url,
          name: user.user_metadata?.full_name || user.user_metadata?.name,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setLoading]);

  return <>{children}</>;
}

