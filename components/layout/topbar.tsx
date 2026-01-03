'use client';

import { useState, useEffect, useRef } from 'react';
import { Menu, LogOut, User, Settings as SettingsIcon } from 'lucide-react';
import { signOut } from '@/lib/auth/actions';
import { useRouter } from 'next/navigation';

interface TopbarProps {
  onMenuToggle: () => void;
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string; avatar_url?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch user data
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/test-auth');
        if (response.ok) {
          const data = await response.json();
          // Extract user data from response
          if (data.user) {
            const metadata = data.user.user_metadata || {};
            const rawMetadata = data.user.raw_user_meta_data || {};
            
            // Try to get full name from various sources
            let fullName = 
              metadata.full_name || 
              metadata.name ||
              rawMetadata.full_name ||
              rawMetadata.name ||
              (rawMetadata.given_name && rawMetadata.family_name 
                ? `${rawMetadata.given_name} ${rawMetadata.family_name}`
                : rawMetadata.given_name || rawMetadata.family_name) ||
              data.user.email?.split('@')[0] ||
              'User';
            
            setUser({
              name: fullName,
              email: data.user.email,
              avatar_url: metadata.avatar_url || metadata.picture || rawMetadata.picture,
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile Menu Button */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onClick={onMenuToggle}
        aria-label="Open sidebar"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Spacer */}
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1" />
      </div>

      {/* User Menu */}
      <div className="relative flex items-center gap-x-4 lg:gap-x-6" ref={menuRef}>
        <button
          type="button"
          className="flex items-center gap-x-3 rounded-full p-1.5 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50"
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          aria-expanded={userMenuOpen}
          aria-haspopup="true"
        >
          {/* User Avatar */}
          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
          ) : user?.avatar_url ? (
            <img
              className="h-8 w-8 rounded-full"
              src={user.avatar_url}
              alt={user.name || 'User'}
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
              {getUserInitials()}
            </div>
          )}

          {/* User Name */}
          <span className="hidden lg:block">
            {loading ? (
              <span className="text-gray-400">Loading...</span>
            ) : (
              user?.name || user?.email || 'User'
            )}
          </span>
        </button>

        {/* Dropdown Menu */}
        {userMenuOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
              <div className="font-semibold">{user?.name || 'User'}</div>
              <div className="text-xs text-gray-500">{user?.email}</div>
            </div>
            <a
              href="/settings"
              className="flex items-center gap-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setUserMenuOpen(false)}
            >
              <User className="h-4 w-4" />
              Profile
            </a>
            <a
              href="/settings"
              className="flex items-center gap-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setUserMenuOpen(false)}
            >
              <SettingsIcon className="h-4 w-4" />
              Settings
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-x-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

