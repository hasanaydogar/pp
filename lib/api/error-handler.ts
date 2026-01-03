import { ApiError, ApiErrorType } from './types';

/**
 * Error type detection
 */
export function detectErrorType(error: unknown): ApiErrorType {
  if (error instanceof ApiError) {
    return error.type;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return ApiErrorType.NETWORK;
    }

    if (message.includes('validation') || message.includes('invalid')) {
      return ApiErrorType.VALIDATION;
    }

    if (message.includes('auth') || message.includes('unauthorized') || message.includes('401')) {
      return ApiErrorType.AUTHENTICATION;
    }

    if (message.includes('forbidden') || message.includes('403')) {
      return ApiErrorType.AUTHORIZATION;
    }

    if (message.includes('not found') || message.includes('404')) {
      return ApiErrorType.NOT_FOUND;
    }

    if (message.includes('server') || message.includes('500')) {
      return ApiErrorType.SERVER;
    }
  }

  return ApiErrorType.UNKNOWN;
}

/**
 * Extract user-friendly error message
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Extract error details
 */
export function extractErrorDetails(error: unknown): unknown {
  if (error instanceof ApiError && error.details) {
    return error.details;
  }

  if (error instanceof Error && 'details' in error) {
    return (error as Error & { details: unknown }).details;
  }

  return undefined;
}

/**
 * Check if error is retryable
 */
export function isRetryable(error: unknown): boolean {
  const type = detectErrorType(error);
  return type === ApiErrorType.NETWORK || type === ApiErrorType.SERVER;
}

/**
 * Log error (optional - can be extended with logging service)
 */
export function logError(error: unknown, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error${context ? ` in ${context}` : ''}]:`, error);
  }
  // In production, you might want to send to error tracking service
  // e.g., Sentry, LogRocket, etc.
}

