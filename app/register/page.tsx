'use client';

import { AuthDivider, AuthLayout, SocialLoginButtons } from '@/components/auth';
import { RegisterForm } from '@/components/auth/register-form';
import { Link } from '@/components/ui/link';
import { Text } from '@/components/ui/text';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function RegisterPage() {
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const handleSuccess = (needsEmailConfirmation: boolean) => {
    setNeedsConfirmation(needsEmailConfirmation);
    setRegistrationComplete(true);
  };

  if (registrationComplete) {
    return (
      <AuthLayout
        title="Kayıt başarılı!"
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
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="mt-4">
            {needsConfirmation ? (
              <>
                <Text className="mb-2">
                  Hesabınız oluşturuldu!
                </Text>
                <Text>
                  Email adresinize bir doğrulama linki gönderdik. Lütfen email&apos;inizi kontrol edin ve hesabınızı doğrulayın.
                </Text>
              </>
            ) : (
              <Text>
                Hesabınız başarıyla oluşturuldu. Şimdi giriş yapabilirsiniz.
              </Text>
            )}
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Hesap oluştur"
      subtitle="Portföyünüzü yönetmeye başlayın"
      footer={
        <Text>
          Zaten hesabınız var mı?{' '}
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            Giriş yapın
          </Link>
        </Text>
      }
    >
      {/* Social Login */}
      <SocialLoginButtons />

      {/* Divider */}
      <AuthDivider text="veya email ile" />

      {/* Register Form */}
      <RegisterForm onSuccess={handleSuccess} />
    </AuthLayout>
  );
}
