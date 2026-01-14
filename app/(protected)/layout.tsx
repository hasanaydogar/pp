import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth/actions';
import { createClient } from '@/lib/supabase/server';
import { getPortfolios } from '@/lib/api/server';

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';
import { PortfolioProvider } from '@/lib/context/portfolio-context';
import { CurrencyProvider } from '@/lib/context/currency-context';
import { QueryProvider } from '@/lib/providers/query-provider';
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/components/ui/dropdown';
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '@/components/ui/navbar';
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarHeading,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from '@/components/ui/sidebar';
import { SidebarLayout } from '@/components/ui/sidebar-layout';
import {
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Cog8ToothIcon,
  UserCircleIcon,
} from '@heroicons/react/16/solid';
import {
  Cog6ToothIcon,
  HomeIcon,
  WalletIcon,
  ChartBarIcon,
} from '@heroicons/react/20/solid';
import { ApplicationLayoutClient } from './application-layout-client';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch portfolios for the portfolio selector
  let portfolios: Awaited<ReturnType<typeof getPortfolios>> = [];
  try {
    portfolios = await getPortfolios();
  } catch (error) {
    // If portfolios fetch fails, continue with empty array
    console.error('Failed to fetch portfolios:', error);
  }

  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  // Get full Supabase user to extract avatar URL
  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  // Extract avatar URL from various sources
  const metadata = supabaseUser?.user_metadata || {};
  const avatarUrl =
    user.avatar_url ||
    metadata.avatar_url ||
    metadata.picture ||
    metadata.photo_url ||
    null;

  // Get active portfolio ID from cookie or use first portfolio
  // In Next.js 16, cookies() is async and must be awaited
  let activePortfolioIdFromCookie: string | undefined;
  try {
    const cookieStore = await cookies();
    activePortfolioIdFromCookie = cookieStore.get('activePortfolioId')?.value;
  } catch (error) {
    // If cookies() fails, continue without cookie value
    console.error('Failed to read cookies:', error);
  }
  const initialActiveId = activePortfolioIdFromCookie || (portfolios.length > 0 ? portfolios[0].id : null);
  
  // Note: We can't set cookies in Server Components directly
  // Cookie will be set by client-side code in PortfolioContext

  return (
    <QueryProvider>
      <CurrencyProvider>
        <PortfolioProvider initialPortfolios={portfolios} initialActiveId={initialActiveId}>
          <ApplicationLayoutClient
            user={{
              name: user.name,
              email: user.email,
              avatar_url: avatarUrl,
              initials: getUserInitials(),
            }}
          >
            {children}
          </ApplicationLayoutClient>
        </PortfolioProvider>
      </CurrencyProvider>
    </QueryProvider>
  );
}
