'use client';

import React from 'react';
import { ApiError } from '@/lib/api/types';
import { extractErrorMessage, extractErrorDetails, isRetryable } from '@/lib/api/error-handler';
import { Text } from './text';
import { Button } from './button';

interface ErrorMessageProps {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}

/**
 * Error Message Component
 * Displays user-friendly error messages with optional retry functionality
 */
export function ErrorMessage({ error, onRetry, className }: ErrorMessageProps) {
  const message = extractErrorMessage(error);
  const details = extractErrorDetails(error);
  const canRetry = isRetryable(error) && onRetry !== undefined;

  return (
    <div className={`rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20 ${className || ''}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="size-5 text-red-600 dark:text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1">
          <Text className="font-medium text-red-800 dark:text-red-200">{message}</Text>
          {details !== null && details !== undefined && (
            <div className="mt-2">
              <Text className="text-sm text-red-700 dark:text-red-300">
                {typeof details === 'string' ? details : JSON.stringify(details)}
              </Text>
            </div>
          )}
          {canRetry && (
            <div className="mt-4">
              <Button onClick={onRetry}>
                Retry
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

