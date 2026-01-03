'use client';

import { createClient } from '@/lib/supabase/client';
import { ApiClient, ApiError, ApiErrorType, ApiResponse, RequestConfig } from './types';

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<Pick<RequestConfig, 'retries' | 'retryDelay' | 'timeout'>> = {
  retries: 3,
  retryDelay: 1000, // 1 second
  timeout: 30000, // 30 seconds
};

/**
 * Get base URL for API requests
 */
function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side: use relative URL
    return '/api';
  }
  // Server-side: use absolute URL
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof ApiError) {
    // Retry on network errors and 5xx server errors
    return (
      error.type === ApiErrorType.NETWORK ||
      (error.status !== undefined && error.status >= 500)
    );
  }
  return false;
}

/**
 * Transform error to ApiError
 */
function transformError(error: unknown, status?: number): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return new ApiError('Network error. Please check your connection.', ApiErrorType.NETWORK);
    }

    // Timeout errors
    if (error.message.includes('timeout')) {
      return new ApiError('Request timeout. Please try again.', ApiErrorType.NETWORK);
    }
  }

  // HTTP status-based errors
  if (status !== undefined) {
    switch (status) {
      case 400:
        return new ApiError('Invalid request. Please check your input.', ApiErrorType.VALIDATION, status);
      case 401:
        return new ApiError('Authentication required. Please log in.', ApiErrorType.AUTHENTICATION, status);
      case 403:
        return new ApiError('You do not have permission to perform this action.', ApiErrorType.AUTHORIZATION, status);
      case 404:
        return new ApiError('Resource not found.', ApiErrorType.NOT_FOUND, status);
      case 422:
        return new ApiError('Validation error. Please check your input.', ApiErrorType.VALIDATION, status);
      case 500:
      case 502:
      case 503:
      case 504:
        return new ApiError('Server error. Please try again later.', ApiErrorType.SERVER, status);
      default:
        return new ApiError('An unexpected error occurred.', ApiErrorType.UNKNOWN, status);
    }
  }

  return new ApiError('An unexpected error occurred.', ApiErrorType.UNKNOWN);
}

/**
 * Create fetch request with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

/**
 * Make API request with retry logic
 */
async function makeRequest<T>(
  url: string,
  config: RequestConfig = {},
): Promise<T> {
  const {
    retries = DEFAULT_CONFIG.retries,
    retryDelay = DEFAULT_CONFIG.retryDelay,
    timeout = DEFAULT_CONFIG.timeout,
    skipAuth = false,
    ...fetchConfig
  } = config;

  const baseUrl = getBaseUrl();
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  // Prepare headers
  const headers = new Headers(fetchConfig.headers);

  // Add authentication token
  if (!skipAuth) {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        headers.set('Authorization', `Bearer ${session.access_token}`);
      }
    } catch (error) {
      // If token fetch fails, continue without auth (will be handled by server)
      console.warn('Failed to get access token:', error);
    }
  }

  // Set content type for JSON requests
  if (fetchConfig.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let lastError: unknown;
  let attempt = 0;

  while (attempt <= retries) {
    try {
      const response = await fetchWithTimeout(
        fullUrl,
        {
          ...fetchConfig,
          headers,
        },
        timeout,
      );

      // Parse response
      let data: ApiResponse<T>;
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { data: text as unknown as T };
      }

      // Handle error responses
      if (!response.ok) {
        const errorMessage = data.error || `HTTP ${response.status}`;
        const error = transformError(new Error(errorMessage), response.status);
        error.details = data.details;

        // Don't retry non-retryable errors
        if (!isRetryableError(error)) {
          throw error;
        }

        lastError = error;
      } else {
        // Success - return data
        return (data.data ?? data) as T;
      }
    } catch (error) {
      lastError = error;

      // Don't retry if not retryable
      if (!isRetryableError(error)) {
        throw transformError(error);
      }

      // Don't retry on last attempt
      if (attempt === retries) {
        break;
      }

      // Wait before retry
      await sleep(retryDelay * (attempt + 1)); // Exponential backoff
    }

    attempt++;
  }

  // All retries exhausted
  throw transformError(lastError);
}

/**
 * Create API client instance
 */
export function createApiClient(): ApiClient {
  return {
    async get<T>(url: string, config?: RequestConfig): Promise<T> {
      return makeRequest<T>(url, { ...config, method: 'GET' });
    },

    async post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
      return makeRequest<T>(url, {
        ...config,
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      });
    },

    async put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
      return makeRequest<T>(url, {
        ...config,
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      });
    },

    async patch<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
      return makeRequest<T>(url, {
        ...config,
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      });
    },

    async delete<T>(url: string, config?: RequestConfig): Promise<T> {
      return makeRequest<T>(url, { ...config, method: 'DELETE' });
    },
  };
}

/**
 * Default API client instance
 */
export const apiClient = createApiClient();

