import { getCurrentUser } from '@/lib/auth/actions';
import { createClient } from '@/lib/supabase/server';
import { Heading, Subheading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Avatar } from '@/components/ui/avatar';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const supabase = await createClient();
  
  // Get full user data from Supabase
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  if (!user || !supabaseUser) {
    return null;
  }

  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  // Get avatar URL from Supabase user metadata as fallback
  const metadata = supabaseUser.user_metadata || {};
  const avatarUrl =
    user.avatar_url ||
    metadata.avatar_url ||
    metadata.picture ||
    metadata.photo_url ||
    null;

  return (
    <div className="space-y-8">
      <div>
        <Heading level={1}>My Profile</Heading>
        <Text className="mt-2">Manage your account information and preferences.</Text>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-xs ring-1 ring-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900 dark:ring-white/10">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            {avatarUrl ? (
              <Avatar src={avatarUrl} className="size-20" square alt={user.name || 'User'} />
            ) : (
              <Avatar initials={getUserInitials()} className="size-20 bg-indigo-500 text-white" square />
            )}
          </div>
          <div className="flex-1 space-y-6">
            <div>
              <Subheading level={3}>Profile Information</Subheading>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Display Name
                  </label>
                  <div className="mt-1 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                    {user.name || 'Not set'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Email Address
                  </label>
                  <div className="mt-1 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                    {user.email || 'Not set'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    User ID
                  </label>
                  <div className="mt-1 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-xs font-mono text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                    {user.id}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Subheading level={3}>Account Details</Subheading>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Account Created
                  </label>
                  <div className="mt-1 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                    {supabaseUser.created_at
                      ? new Date(supabaseUser.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Not available'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Last Sign In
                  </label>
                  <div className="mt-1 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                    {supabaseUser.last_sign_in_at
                      ? new Date(supabaseUser.last_sign_in_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Not available'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-xs ring-1 ring-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900 dark:ring-white/10">
        <Subheading level={3}>Authentication Provider</Subheading>
        <div className="mt-4">
          <div className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
            {supabaseUser.app_metadata?.provider || user.provider_type || 'Unknown'}
          </div>
          <Text className="mt-2 text-xs">
            You signed in using {supabaseUser.app_metadata?.provider || user.provider_type || 'an external provider'}. To change your account information, please update it in your provider's settings.
          </Text>
        </div>
      </div>
    </div>
  );
}
