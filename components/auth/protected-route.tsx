import { getCurrentUser } from '@/lib/auth/actions';
import { redirect } from 'next/navigation';

export async function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <>{children}</>;
}

