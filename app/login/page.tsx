import { LoginButtons } from '@/components/auth/login-buttons';
import { getCurrentUser } from '@/lib/auth/actions';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const user = await getCurrentUser();

  // If already authenticated, redirect to auth-redirect handler
  if (user) {
    redirect('/auth-redirect');
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '24px',
        padding: '20px',
        backgroundColor: '#f9fafb',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '8px',
            textAlign: 'center',
          }}
        >
          Welcome
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: '#6b7280',
            marginBottom: '32px',
            textAlign: 'center',
          }}
        >
          Sign in to continue
        </p>

        <LoginButtons />
      </div>
    </div>
  );
}
