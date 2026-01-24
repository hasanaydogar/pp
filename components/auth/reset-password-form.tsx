'use client';

import { Button } from '@/components/ui/button';
import { Field, Label, ErrorMessage } from '@/components/ui/fieldset';
import { updatePassword } from '@/lib/auth/actions';
import { getAuthErrorMessage } from '@/lib/auth/errors';
import { useState } from 'react';
import { PasswordInput } from './password-input';
import { PasswordStrength, validatePassword } from './password-strength';

interface ResetPasswordFormProps {
  onSuccess?: () => void;
}

export function ResetPasswordForm({ onSuccess }: ResetPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: {
      password?: string;
      confirmPassword?: string;
    } = {};

    const passwordError = validatePassword(password);
    if (!password) {
      errors.password = 'Şifre gerekli';
    } else if (passwordError) {
      errors.password = passwordError;
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Şifre tekrarı gerekli';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Şifreler eşleşmiyor';
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
      const result = await updatePassword(password);

      if (result.success) {
        onSuccess?.();
      } else {
        setError(getAuthErrorMessage(result.error));
      }
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const clearFieldError = (field: keyof typeof fieldErrors) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
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

      {/* Password Field */}
      <Field>
        <Label>Yeni Şifre</Label>
        <PasswordInput
          name="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearFieldError('password');
          }}
          placeholder="En az 8 karakter"
          autoComplete="new-password"
          disabled={isLoading}
          data-invalid={fieldErrors.password ? true : undefined}
        />
        <PasswordStrength password={password} />
        {fieldErrors.password && (
          <ErrorMessage>{fieldErrors.password}</ErrorMessage>
        )}
      </Field>

      {/* Confirm Password Field */}
      <Field>
        <Label>Şifre Tekrarı</Label>
        <PasswordInput
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            clearFieldError('confirmPassword');
          }}
          placeholder="Şifrenizi tekrar girin"
          autoComplete="new-password"
          disabled={isLoading}
          data-invalid={fieldErrors.confirmPassword ? true : undefined}
        />
        {fieldErrors.confirmPassword && (
          <ErrorMessage>{fieldErrors.confirmPassword}</ErrorMessage>
        )}
      </Field>

      {/* Submit Button */}
      <Button
        type="submit"
        color="blue"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Güncelleniyor...' : 'Şifreyi güncelle'}
      </Button>
    </form>
  );
}
