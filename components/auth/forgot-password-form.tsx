'use client';

import { Button } from '@/components/ui/button';
import { Field, Label, ErrorMessage } from '@/components/ui/fieldset';
import { Input } from '@/components/ui/input';
import { resetPassword } from '@/lib/auth/actions';
import { getAuthErrorMessage } from '@/lib/auth/errors';
import { useState } from 'react';

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
}

export function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setFieldError('Email adresi gerekli');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError('Geçerli bir email adresi girin');
      return false;
    }
    setFieldError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword(email);

      if (result.success) {
        onSuccess?.();
      }
      // Note: resetPassword always returns success for security reasons
      // (doesn't reveal if email exists or not)
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
            if (fieldError) setFieldError(null);
          }}
          placeholder="ornek@email.com"
          autoComplete="email"
          disabled={isLoading}
          data-invalid={fieldError ? true : undefined}
        />
        {fieldError && <ErrorMessage>{fieldError}</ErrorMessage>}
      </Field>

      {/* Submit Button */}
      <Button
        type="submit"
        color="blue"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Gönderiliyor...' : 'Şifre sıfırlama linki gönder'}
      </Button>
    </form>
  );
}
