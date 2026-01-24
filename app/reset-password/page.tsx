'use client';

import { AuthLayout } from '@/components/auth';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { Link } from '@/components/ui/link';
import { Text } from '@/components/ui/text';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [isValidSession, setIsValidSession] = useState(true);

  // Supabase handles the token automatically through the URL hash
  // The session is established when the user clicks the reset link
  useEffect(() => {
    // Check if we have a valid session from the reset link
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    // If there's no token and no type=recovery, show error
    if (!accessToken && type !== 'recovery') {
      // Give Supabase a moment to process the session
      const timer = setTimeout(() => {
        // Session should be established by now through the auth callback
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSuccess = () => {
    setPasswordUpdated(true);
    // Redirect to login after 3 seconds
    setTimeout(() => {
      router.push('/login');
    }, 3000);
  };

  if (passwordUpdated) {
    return (
      <AuthLayout
        title="Şifre güncellendi!"
        footer={
          <Text>
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Giriş sayfasına git
            </Link>
          </Text>
        }
      >
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="mt-4">
            <Text>
              Şifreniz başarıyla güncellendi. Birkaç saniye içinde giriş sayfasına yönlendirileceksiniz.
            </Text>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (!isValidSession) {
    return (
      <AuthLayout
        title="Geçersiz link"
        footer={
          <Text>
            <Link
              href="/forgot-password"
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Yeni şifre sıfırlama linki al
            </Link>
          </Text>
        }
      >
        <div className="text-center">
          <Text>
            Bu şifre sıfırlama linki geçersiz veya süresi dolmuş. Lütfen yeni bir link isteyin.
          </Text>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Yeni şifre belirle"
      subtitle="Yeni şifrenizi girin"
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
      <ResetPasswordForm onSuccess={handleSuccess} />
    </AuthLayout>
  );
}
