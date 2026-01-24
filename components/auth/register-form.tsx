'use client';

import { Button } from '@/components/ui/button';
import { Field, Label, ErrorMessage } from '@/components/ui/fieldset';
import { Input } from '@/components/ui/input';
import { signUpWithEmail } from '@/lib/auth/actions';
import { getAuthErrorMessage } from '@/lib/auth/errors';
import { useState } from 'react';
import { PasswordInput } from './password-input';
import { PasswordStrength, validatePassword } from './password-strength';

interface RegisterFormProps {
  onSuccess?: (needsConfirmation: boolean) => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: {
      fullName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!fullName.trim()) {
      errors.fullName = 'Ad soyad gerekli';
    } else if (fullName.trim().length < 2) {
      errors.fullName = 'Ad soyad en az 2 karakter olmalı';
    }

    if (!email.trim()) {
      errors.email = 'Email adresi gerekli';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Geçerli bir email adresi girin';
    }

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
      const result = await signUpWithEmail(email, password, fullName);

      if (result.success) {
        onSuccess?.(result.needsConfirmation ?? false);
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

      {/* Full Name Field */}
      <Field>
        <Label>Ad Soyad</Label>
        <Input
          type="text"
          name="fullName"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            clearFieldError('fullName');
          }}
          placeholder="Adınız Soyadınız"
          autoComplete="name"
          disabled={isLoading}
          data-invalid={fieldErrors.fullName ? true : undefined}
        />
        {fieldErrors.fullName && (
          <ErrorMessage>{fieldErrors.fullName}</ErrorMessage>
        )}
      </Field>

      {/* Email Field */}
      <Field>
        <Label>Email</Label>
        <Input
          type="email"
          name="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearFieldError('email');
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
        <Label>Şifre</Label>
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
        {isLoading ? 'Hesap oluşturuluyor...' : 'Hesap oluştur'}
      </Button>
    </form>
  );
}
