'use client';

import React from 'react';
import { usePortfolio } from '@/lib/context/portfolio-context';
import { Heading, Subheading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { 
  FlagIcon,
  ScaleIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

export default function PortfolioGoalsPage() {
  const { portfolios, activePortfolioId } = usePortfolio();
  const activePortfolio = portfolios.find(p => p.id === activePortfolioId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Heading>🎯 Portföy Amacı</Heading>
        <Text className="mt-1">
          {activePortfolio?.name} portföyü için hedefler ve yatırım politikaları
        </Text>
      </div>

      {/* Coming Soon Card */}
      <div className="rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 p-12 text-center">
        <FlagIcon className="mx-auto h-16 w-16 text-green-500" />
        <h3 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-white">
          Portföy Hedefleri Yakında
        </h3>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
          Portföyünüz için hedef değer, zaman çerçevesi ve yatırım politikaları 
          belirleyebileceğiniz özellik üzerinde çalışıyoruz.
        </p>
      </div>

      {/* Planned Features */}
      <div>
        <Subheading>Planlanan Özellikler</Subheading>
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
            title="Ağırlık Limitleri"
            description="Maksimum hisse/sektör ağırlıkları belirleme"
          />
          <FeatureCard
            icon={<Cog6ToothIcon className="h-6 w-6" />}
            title="Nakit Politikası"
            description="Minimum/maksimum nakit oranları ayarlama"
          />
        </div>
      </div>

      {/* Policy Preview */}
      <div>
        <Subheading>Mevcut Politika Ayarları</Subheading>
        <div className="mt-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <PolicyItem label="Maks. Hisse Ağırlığı" value="%12" />
            <PolicyItem label="Maks. Sektör Ağırlığı" value="%25" />
            <PolicyItem label="Nakit Hedefi" value="%7" />
            <PolicyItem label="Min. Nakit" value="%5" />
            <PolicyItem label="Maks. Nakit" value="%10" />
            <PolicyItem label="Ana Pozisyon Aralığı" value="%8-12" />
          </div>
          <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <Button outline disabled>
              Politikaları Düzenle (Yakında)
            </Button>
          </div>
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
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4">
      <div className="flex items-center gap-3">
        <div className="text-green-500">{icon}</div>
        <h4 className="font-medium text-zinc-900 dark:text-white">{title}</h4>
      </div>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
    </div>
  );
}

function PolicyItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-zinc-900 dark:text-white">{value}</dd>
    </div>
  );
}
