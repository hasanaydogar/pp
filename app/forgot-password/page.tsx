'use client';

import { AuthLayout } from '@/components/auth';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { Link } from '@/components/ui/link';
import { Text } from '@/components/ui/text';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false);

  const handleSuccess = () => {
    setEmailSent(true);
  };

  if (emailSent) {
    return (
      <AuthLayout
        title="Email gönderildi"
        footer={
          <Text>
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Giriş sayfasına dön
            </Link>
          </Text>
        }
      >
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <EnvelopeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-4">
            <Text className="mb-2">
              Şifre sıfırlama linki email adresinize gönderildi.
            </Text>
            <Text>
              Lütfen gelen kutunuzu kontrol edin. Email birkaç dakika içinde gelmezse, spam klasörünü de kontrol edin.
            </Text>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Şifremi unuttum"
      subtitle="Email adresinizi girin, size şifre sıfırlama linki gönderelim"
      footer={
        <Text>
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            Giriş sayfasına dön
          </Link>
        </Text>
      }
    >
      <ForgotPasswordForm onSuccess={handleSuccess} />
    </AuthLayout>
  );
}
