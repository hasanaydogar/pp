'use client';

import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Avatar } from '@/components/ui/avatar';
import { usePortfolio } from '@/lib/context/portfolio-context';
import { useCurrency } from '@/lib/context/currency-context';
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
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from '@/components/ui/sidebar';
import { SidebarLayout } from '@/components/ui/sidebar-layout';
import { signOut } from '@/lib/auth/actions';
import {
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Cog8ToothIcon,
  LightBulbIcon,
  PlusIcon,
  ShieldCheckIcon,
  UserIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/16/solid';
import {
  Cog6ToothIcon,
  HomeIcon,
  WalletIcon,
  ChartBarIcon,
} from '@heroicons/react/20/solid';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { useExchangeRates, formatLastUpdate } from '@/lib/hooks/use-exchange-rates';

function AccountDropdownMenu({ anchor }: { anchor: 'top start' | 'bottom end' }) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  }

  return (
    <DropdownMenu className="min-w-64" anchor={anchor}>
      <DropdownItem href="/profile">
        <UserIcon />
        <DropdownLabel>My profile</DropdownLabel>
      </DropdownItem>
      <DropdownItem href="/settings">
        <Cog8ToothIcon />
        <DropdownLabel>Settings</DropdownLabel>
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem href="/privacy-policy">
        <ShieldCheckIcon />
        <DropdownLabel>Privacy policy</DropdownLabel>
      </DropdownItem>
      <DropdownItem href="/share-feedback">
        <LightBulbIcon />
        <DropdownLabel>Share feedback</DropdownLabel>
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem onClick={handleLogout}>
        <ArrowRightStartOnRectangleIcon />
        <DropdownLabel>Sign out</DropdownLabel>
      </DropdownItem>
    </DropdownMenu>
  );
}

export function ApplicationLayoutClient({
  children,
  user,
}: {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    avatar_url?: string | null;
    initials: string;
  };
}) {
  let pathname = usePathname();
  const router = useRouter();
  const { portfolios, activePortfolioId, setActivePortfolioId, refetch } = usePortfolio();
  const { currency, setCurrency, supportedCurrencies } = useCurrency();
  const { data: exchangeRates } = useExchangeRates();
  
  const activePortfolio = portfolios.find(p => p.id === activePortfolioId);

  // Refresh portfolios when pathname changes (e.g., after creating a new portfolio)
  React.useEffect(() => {
    if (pathname === '/portfolios/new' || pathname.startsWith('/portfolios/')) {
      refetch();
    }
  }, [pathname, refetch]);

  // Sync active portfolio ID to cookie for Server Components
  React.useEffect(() => {
    if (activePortfolioId) {
      document.cookie = `activePortfolioId=${activePortfolioId}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
      // Refresh Server Components when portfolio changes
      router.refresh();
    } else {
      document.cookie = 'activePortfolioId=; path=/; max-age=0';
    }
  }, [activePortfolioId, router]);

  return (
    <ErrorBoundary>
      <SidebarLayout
        navbar={
        <Navbar>
          <NavbarSpacer />
          <NavbarSection>
            {/* Currency Selector */}
            <Dropdown>
              <DropdownButton as={NavbarItem}>
                <CurrencyDollarIcon />
                <span className="font-medium">{currency}</span>
              </DropdownButton>
              <DropdownMenu className="min-w-48 max-h-96 overflow-y-auto" anchor="bottom end">
                <DropdownLabel>Para Birimi Seçin</DropdownLabel>
                {exchangeRates && (
                  <div className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {exchangeRates.isFallback ? (
                      <span className="text-yellow-600 dark:text-yellow-400">
                        ⚠️ Static rates
                      </span>
                    ) : (
                      <span>
                        Updated: {formatLastUpdate(exchangeRates)}
                      </span>
                    )}
                  </div>
                )}
                <DropdownDivider />
                {supportedCurrencies.map((curr) => (
                  <DropdownItem
                    key={curr}
                    onClick={() => setCurrency(curr)}
                  >
                    <DropdownLabel className={currency === curr ? "font-semibold text-indigo-600 dark:text-indigo-400" : ""}>
                      {curr} {currency === curr && '✓'}
                    </DropdownLabel>
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            {/* User Account Dropdown */}
            <Dropdown>
              <DropdownButton as={NavbarItem}>
                {user?.avatar_url ? (
                  <Avatar src={user.avatar_url} square />
                ) : (
                  <Avatar initials={user.initials} square />
                )}
              </DropdownButton>
              <AccountDropdownMenu anchor="bottom end" />
            </Dropdown>
          </NavbarSection>
        </Navbar>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <Dropdown>
              <DropdownButton as={SidebarItem} className="mb-2.5">
                <Avatar 
                  initials={activePortfolio?.name?.substring(0, 2).toUpperCase() || 'P'} 
                  className="bg-indigo-500 text-white" 
                />
                <SidebarLabel>{activePortfolio?.name || 'Portfoy'}</SidebarLabel>
                <ChevronDownIcon />
              </DropdownButton>
              <DropdownMenu className="min-w-64" anchor="bottom start">
                <DropdownItem href="/portfolios">
                  <Cog8ToothIcon />
                  <DropdownLabel>ALL</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                {portfolios.map((portfolio) => (
                  <DropdownItem
                    key={portfolio.id}
                    onClick={() => {
                      setActivePortfolioId(portfolio.id);
                      // Refresh the page to update Server Components with new portfolio
                      router.refresh();
                      // If on a portfolio-specific page, navigate to the active portfolio
                      if (pathname.startsWith('/portfolios/')) {
                        router.push(`/portfolios/${portfolio.id}`);
                      }
                    }}
                  >
                    <Avatar 
                      slot="icon" 
                      initials={portfolio.name.substring(0, 2).toUpperCase()} 
                      className={activePortfolioId === portfolio.id ? "bg-indigo-500 text-white" : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200"} 
                    />
                    <DropdownLabel className={activePortfolioId === portfolio.id ? "font-semibold" : ""}>
                      {portfolio.name}
                    </DropdownLabel>
                  </DropdownItem>
                ))}
                {portfolios.length > 0 && <DropdownDivider />}
                <DropdownItem href="/portfolios/new">
                  <PlusIcon />
                  <DropdownLabel>New Portfolio&hellip;</DropdownLabel>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </SidebarHeader>

          <SidebarBody>
            <SidebarSection>
              <SidebarItem href="/dashboard" current={pathname === '/dashboard'}>
                <HomeIcon />
                <SidebarLabel>Dashboard</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/assets" current={pathname.startsWith('/assets')}>
                <WalletIcon />
                <SidebarLabel>My Assets</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/analysis" current={pathname.startsWith('/analysis')}>
                <ChartBarIcon />
                <SidebarLabel>AI Analysis</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/settings" current={pathname.startsWith('/settings')}>
                <Cog6ToothIcon />
                <SidebarLabel>Settings</SidebarLabel>
              </SidebarItem>
            </SidebarSection>

            <SidebarSpacer />

            {/* Currency Selector - Desktop Only */}
            <SidebarSection className="max-lg:hidden">
              <Dropdown>
                <DropdownButton as={SidebarItem}>
                  <CurrencyDollarIcon />
                  <SidebarLabel>Currency: {currency}</SidebarLabel>
                  <ChevronDownIcon />
                </DropdownButton>
                <DropdownMenu className="min-w-64 max-h-96 overflow-y-auto" anchor="top start">
                  <DropdownLabel>Para Birimi Seçin</DropdownLabel>
                  {exchangeRates && (
                    <div className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">
                      {exchangeRates.isFallback ? (
                        <span className="text-yellow-600 dark:text-yellow-400">
                          ⚠️ Static rates (API unavailable)
                        </span>
                      ) : (
                        <span>
                          Updated: {formatLastUpdate(exchangeRates)}
                        </span>
                      )}
                    </div>
                  )}
                  <DropdownDivider />
                  {supportedCurrencies.map((curr) => (
                    <DropdownItem
                      key={curr}
                      onClick={() => setCurrency(curr)}
                    >
                      <DropdownLabel className={currency === curr ? "font-semibold text-indigo-600 dark:text-indigo-400" : ""}>
                        {curr} {currency === curr && '✓'}
                      </DropdownLabel>
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </SidebarSection>
          </SidebarBody>

          <SidebarFooter>
            <Dropdown>
              <DropdownButton as={SidebarItem}>
                <span className="flex min-w-0 items-center gap-3">
                  {user?.avatar_url ? (
                    <Avatar src={user.avatar_url} className="size-10" square alt="" />
                  ) : (
                    <Avatar initials={user.initials} className="size-10" square alt="" />
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
                      {user?.name || 'User'}
                    </span>
                    <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                      {user?.email || ''}
                    </span>
                  </span>
                </span>
                <ChevronUpIcon />
              </DropdownButton>
              <AccountDropdownMenu anchor="top start" />
            </Dropdown>
          </SidebarFooter>
        </Sidebar>
      }
    >
      {children}
    </SidebarLayout>
    </ErrorBoundary>
  );
}

