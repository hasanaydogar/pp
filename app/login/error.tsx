'use client';

import { useEffect } from 'react';

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Login error:', error);
  }, [error]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '20px',
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '20px',
          maxWidth: '500px',
          width: '100%',
        }}
      >
        <h2 style={{ color: '#dc2626', marginBottom: '12px' }}>
          Authentication Error
        </h2>
        <p style={{ color: '#991b1b', marginBottom: '16px' }}>
          {error.message || 'An error occurred during authentication'}
        </p>
        <button
          onClick={reset}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

