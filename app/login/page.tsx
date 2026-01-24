import { AuthDivider, AuthLayout, LoginForm, SocialLoginButtons } from '@/components/auth';
import { Link } from '@/components/ui/link';
import { Text } from '@/components/ui/text';
import { getCurrentUser } from '@/lib/auth/actions';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const user = await getCurrentUser();

  // If already authenticated, redirect to auth-redirect handler
  if (user) {
    redirect('/auth-redirect');
  }

  return (
    <AuthLayout
      title="Hoş geldiniz"
      subtitle="Hesabınıza giriş yapın"
      footer={
        <Text>
          Hesabınız yok mu?{' '}
          <Link
            href="/register"
            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            Kayıt olun
          </Link>
        </Text>
      }
    >
      {/* Social Login */}
      <SocialLoginButtons />

      {/* Divider */}
      <AuthDivider text="veya email ile" />

      {/* Email/Password Form */}
      <LoginForm />
    </AuthLayout>
  );
}
