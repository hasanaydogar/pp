'use client';

import { signOut } from '@/lib/auth/actions';
import { useState } from 'react';

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
    } catch (error) {
      setIsLoading(false);
      console.error('Sign out error:', error);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      style={{
        padding: '10px 20px',
        fontSize: '14px',
        backgroundColor: isLoading ? '#ccc' : '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: isLoading ? 'not-allowed' : 'pointer',
      }}
    >
      {isLoading ? 'Signing out...' : 'Sign Out'}
    </button>
  );
}

