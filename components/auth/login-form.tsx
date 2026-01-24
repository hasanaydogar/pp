'use client';

import { Button } from '@/components/ui/button';
import { Checkbox, CheckboxField } from '@/components/ui/checkbox';
import { Field, Label, ErrorMessage } from '@/components/ui/fieldset';
import { Input } from '@/components/ui/input';
import { Link } from '@/components/ui/link';
import { signInWithEmail } from '@/lib/auth/actions';
import { getAuthErrorMessage } from '@/lib/auth/errors';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PasswordInput } from './password-input';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = 'Email adresi gerekli';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Geçerli bir email adresi girin';
    }

    if (!password) {
      errors.password = 'Şifre gerekli';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await signInWithEmail(email, password);

      if (result.success) {
        router.push('/auth-redirect');
      } else {
        setError(getAuthErrorMessage(result.error));
      }
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Email Field */}
      <Field>
        <Label>Email</Label>
        <Input
          type="email"
          name="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldErrors.email) {
              setFieldErrors((prev) => ({ ...prev, email: undefined }));
            }
          }}
          placeholder="ornek@email.com"
          autoComplete="email"
          disabled={isLoading}
          data-invalid={fieldErrors.email ? true : undefined}
        />
        {fieldErrors.email && <ErrorMessage>{fieldErrors.email}</ErrorMessage>}
      </Field>

      {/* Password Field */}
      <Field>
        <div className="flex items-center justify-between">
          <Label>Şifre</Label>
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Şifremi unuttum
          </Link>
        </div>
        <PasswordInput
          name="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) {
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
            }
          }}
          placeholder="••••••••"
          autoComplete="current-password"
          disabled={isLoading}
          data-invalid={fieldErrors.password ? true : undefined}
        />
        {fieldErrors.password && (
          <ErrorMessage>{fieldErrors.password}</ErrorMessage>
        )}
      </Field>

      {/* Remember Me */}
      <CheckboxField>
        <Checkbox
          checked={rememberMe}
          onChange={setRememberMe}
          disabled={isLoading}
        />
        <Label>Beni hatırla</Label>
      </CheckboxField>

      {/* Submit Button */}
      <Button
        type="submit"
        color="blue"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Giriş yapılıyor...' : 'Giriş yap'}
      </Button>
    </form>
  );
}
