'use client';

import React from 'react';
import { Spinner } from './spinner';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children?: React.ReactNode;
}

/**
 * Loading Overlay Component
 * Displays loading overlay with backdrop blur
 */
export function LoadingOverlay({ isLoading, message, children }: LoadingOverlayProps) {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {children && (
        <div className="pointer-events-none opacity-50 blur-sm">
          {children}
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          {message && (
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}

