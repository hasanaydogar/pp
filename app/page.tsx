import { getCurrentUser } from '@/lib/auth/actions';
import { redirect } from 'next/navigation';

export default async function Home() {
  const user = await getCurrentUser();

  // Redirect authenticated users to auth-redirect (which handles portfolio routing)
  if (user) {
    redirect('/auth-redirect');
  }

  // Redirect unauthenticated users to login
  redirect('/login');
}

