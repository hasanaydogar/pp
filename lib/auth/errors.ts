export class AuthError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class TokenError extends AuthError {
  constructor(message: string, code?: string) {
    super(message, code, 401);
    this.name = 'TokenError';
  }
}

export class ProviderError extends AuthError {
  constructor(
    message: string,
    public provider: string,
    code?: string
  ) {
    super(message, code, 400);
    this.name = 'ProviderError';
  }
}

export function formatAuthError(error: unknown): string {
  if (error instanceof AuthError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An authentication error occurred. Please try again.';
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}

