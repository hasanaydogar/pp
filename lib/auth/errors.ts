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

// ============================================
// Email/Password Auth Error Handling
// ============================================

export type AuthErrorCode =
  | 'invalid_credentials'
  | 'email_taken'
  | 'weak_password'
  | 'email_not_confirmed'
  | 'rate_limit'
  | 'network_error'
  | 'invalid_email'
  | 'password_mismatch'
  | 'user_not_found'
  | 'expired_token'
  | 'unknown';

const ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  invalid_credentials: 'Email veya şifre hatalı',
  email_taken: 'Bu email adresi zaten kayıtlı',
  weak_password: 'Şifre en az 8 karakter olmalı',
  email_not_confirmed: 'Lütfen email adresinizi doğrulayın',
  rate_limit: 'Çok fazla deneme yaptınız. Lütfen bekleyin.',
  network_error: 'Bağlantı hatası. Lütfen tekrar deneyin.',
  invalid_email: 'Geçerli bir email adresi girin',
  password_mismatch: 'Şifreler eşleşmiyor',
  user_not_found: 'Bu email adresiyle kayıtlı kullanıcı bulunamadı',
  expired_token: 'Oturum süresi doldu. Lütfen tekrar giriş yapın.',
  unknown: 'Bir hata oluştu. Lütfen tekrar deneyin.',
};

/**
 * Supabase Auth hata mesajını AuthErrorCode'a çevirir
 */
function getErrorCode(error: string): AuthErrorCode {
  const errorLower = error.toLowerCase();

  if (errorLower.includes('invalid login credentials') || errorLower.includes('invalid credentials')) {
    return 'invalid_credentials';
  }
  if (errorLower.includes('already registered') || errorLower.includes('already exists')) {
    return 'email_taken';
  }
  if (errorLower.includes('password should be') || errorLower.includes('password is too weak')) {
    return 'weak_password';
  }
  if (errorLower.includes('email not confirmed') || errorLower.includes('confirm your email')) {
    return 'email_not_confirmed';
  }
  if (errorLower.includes('rate limit') || errorLower.includes('too many requests')) {
    return 'rate_limit';
  }
  if (errorLower.includes('network') || errorLower.includes('fetch failed')) {
    return 'network_error';
  }
  if (errorLower.includes('invalid email')) {
    return 'invalid_email';
  }
  if (errorLower.includes('user not found')) {
    return 'user_not_found';
  }
  if (errorLower.includes('expired') || errorLower.includes('token')) {
    return 'expired_token';
  }

  return 'unknown';
}

/**
 * Supabase Auth hata mesajını kullanıcı dostu Türkçe mesaja çevirir
 */
export function getAuthErrorMessage(error: string | Error | unknown): string {
  if (!error) {
    return ERROR_MESSAGES.unknown;
  }

  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorCode = getErrorCode(errorMessage);

  return ERROR_MESSAGES[errorCode];
}

/**
 * Error code'dan mesaj al
 */
export function getErrorMessageByCode(code: AuthErrorCode): string {
  return ERROR_MESSAGES[code];
}

/**
 * Auth sonucu tipi
 */
export interface AuthResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: AuthErrorCode;
}

/**
 * Auth hatasını AuthResult formatına çevirir
 */
export function createAuthError(error: string | Error | unknown): AuthResult {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorCode = getErrorCode(errorMessage);

  return {
    success: false,
    error: ERROR_MESSAGES[errorCode],
    errorCode,
  };
}

/**
 * Başarılı auth sonucu oluşturur
 */
export function createAuthSuccess<T>(data?: T): AuthResult<T> {
  return {
    success: true,
    data,
  };
}

