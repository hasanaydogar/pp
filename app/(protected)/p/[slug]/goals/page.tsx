'use client';

import React from 'react';
import { usePortfolio } from '@/lib/context/portfolio-context';
import { Heading, Subheading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { PolicyEditorCard } from '@/components/policy/policy-editor-card';
import {
  FlagIcon,
  ScaleIcon,
  BanknotesIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { useLastVisitedPortfolio } from '@/lib/hooks/use-last-visited-portfolio';

export default function PortfolioGoalsPage() {
  useLastVisitedPortfolio();

  const { portfolios, activePortfolioId } = usePortfolio();
  const activePortfolio = portfolios.find(p => p.id === activePortfolioId);

  if (!activePortfolioId) {
    return (
      <div className="space-y-8">
        <div>
          <Heading>🎯 Portföy Amacı</Heading>
          <Text className="mt-1">
            Portföy hedefleri ve yatırım politikaları
          </Text>
        </div>
        <div className="rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 p-12 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">
            Lütfen bir portföy seçin
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Heading>🎯 Portföy Amacı</Heading>
        <Text className="mt-1">
          {activePortfolio?.name} portföyü için hedefler ve yatırım politikaları
        </Text>
      </div>

      {/* Policy Editor Card */}
      <PolicyEditorCard portfolioId={activePortfolioId} />

      {/* Coming Soon Features */}
      <div>
        <Subheading>Yakında Gelecek Özellikler</Subheading>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FeatureCard
            icon={<BanknotesIcon className="h-6 w-6" />}
            title="Hedef Değer"
            description="Portföy için hedef toplam değer belirleme"
          />
          <FeatureCard
            icon={<CalendarDaysIcon className="h-6 w-6" />}
            title="Zaman Çerçevesi"
            description="Hedef tarihi ve yatırım süresi planlama"
          />
          <FeatureCard
            icon={<ScaleIcon className="h-6 w-6" />}
            title="Varlık Dağılımı"
            description="Hisse, tahvil, nakit hedef dağılımı"
          />
          <FeatureCard
            icon={<FlagIcon className="h-6 w-6" />}
            title="Hedef Takibi"
            description="Hedefe ne kadar yaklaştığınızı görün"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800/50 p-4 opacity-60">
      <div className="flex items-center gap-3">
        <div className="text-zinc-400 dark:text-zinc-500">{icon}</div>
        <h4 className="font-medium text-zinc-600 dark:text-zinc-400">{title}</h4>
      </div>
      <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
        {description}
      </p>
    </div>
  );
}
