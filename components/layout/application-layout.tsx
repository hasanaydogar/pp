'use client'

import { Avatar } from '@/components/ui/avatar'
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/components/ui/dropdown'
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '@/components/ui/navbar'
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
} from '@/components/ui/sidebar'
import { SidebarLayout } from '@/components/ui/sidebar-layout'
import { signOut } from '@/lib/auth/actions'
import {
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Cog8ToothIcon,
  UserCircleIcon,
} from '@heroicons/react/16/solid'
import {
  Cog6ToothIcon,
  HomeIcon,
  WalletIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  FlagIcon,
} from '@heroicons/react/20/solid'
import { usePathname, useRouter } from 'next/navigation'

function AccountDropdownMenu({ anchor }: { anchor: 'top start' | 'bottom end' }) {
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <DropdownMenu className="min-w-64" anchor={anchor}>
      <DropdownItem href="/profile">
        <UserCircleIcon />
        <DropdownLabel>My account</DropdownLabel>
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem href="/settings">
        <Cog8ToothIcon />
        <DropdownLabel>Settings</DropdownLabel>
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem onClick={handleLogout}>
        <ArrowRightStartOnRectangleIcon />
        <DropdownLabel>Sign out</DropdownLabel>
      </DropdownItem>
    </DropdownMenu>
  )
}

export function ApplicationLayout({
  children,
  user,
}: {
  children: React.ReactNode
  user: {
    name?: string | null
    email?: string | null
    avatar_url?: string | null
  } | null
}) {
  let pathname = usePathname()

  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return 'U'
  }

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSpacer />
          <NavbarSection>
            <Dropdown>
              <DropdownButton as={NavbarItem}>
                {user?.avatar_url ? (
                  <Avatar src={user.avatar_url} square />
                ) : (
                  <Avatar initials={getUserInitials()} square />
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
              <DropdownButton as={SidebarItem}>
                <Avatar initials="P" className="bg-indigo-500 text-white" />
                <SidebarLabel>Portfoy</SidebarLabel>
                <ChevronDownIcon />
              </DropdownButton>
              <DropdownMenu className="min-w-80 lg:min-w-64" anchor="bottom start">
                <DropdownItem href="/settings">
                  <Cog8ToothIcon />
                  <DropdownLabel>Settings</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem href="#">
                  <Avatar slot="icon" initials="P" className="bg-indigo-500 text-white" />
                  <DropdownLabel>Personal Portfoy</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem href="#">
                  <UserCircleIcon />
                  <DropdownLabel>New Portfolio&hellip;</DropdownLabel>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </SidebarHeader>

          <SidebarBody>
            <SidebarSection>
              <SidebarItem href="/portfolios" current={pathname === '/portfolios' || pathname.startsWith('/p/')}>
                <HomeIcon />
                <SidebarLabel>Varlıklar</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/cash" current={pathname.startsWith('/cash')}>
                <CurrencyDollarIcon />
                <SidebarLabel>Nakit & Temettü</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/projection" current={pathname.startsWith('/projection')}>
                <ArrowTrendingUpIcon />
                <SidebarLabel>Projeksiyon</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/analysis" current={pathname.startsWith('/analysis')}>
                <SparklesIcon />
                <SidebarLabel>AI Danışmanı</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/goals" current={pathname.startsWith('/goals')}>
                <FlagIcon />
                <SidebarLabel>Portföy Amacı</SidebarLabel>
              </SidebarItem>
            </SidebarSection>

            <SidebarSpacer />
          </SidebarBody>

          <SidebarFooter className="max-lg:hidden">
            <Dropdown>
              <DropdownButton as={SidebarItem}>
                <span className="flex min-w-0 items-center gap-3">
                  {user?.avatar_url ? (
                    <Avatar src={user.avatar_url} className="size-10" square alt="" />
                  ) : (
                    <Avatar initials={getUserInitials()} className="size-10" square alt="" />
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
  )
}
