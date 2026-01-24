'use client';

import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import clsx from 'clsx';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8 ring-1 ring-zinc-950/5 dark:ring-white/10">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2">
              <svg
                className="h-8 w-8 text-blue-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              <span className="text-xl font-bold text-zinc-950 dark:text-white">
                Portföy
              </span>
            </div>
          </div>

          {/* Title */}
          <Heading level={1} className="text-center mb-2">
            {title}
          </Heading>

          {subtitle && (
            <Text className="text-center mb-8">
              {subtitle}
            </Text>
          )}

          {/* Content */}
          <div className={clsx(!subtitle && 'mt-6')}>
            {children}
          </div>
        </div>

        {/* Footer (outside card) */}
        {footer && (
          <div className="mt-6 text-center">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
