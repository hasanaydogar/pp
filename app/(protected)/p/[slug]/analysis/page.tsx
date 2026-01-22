'use client';

import React, { useMemo } from 'react';
import { usePortfolio } from '@/lib/context/portfolio-context';
import { Heading, Subheading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import {
  SparklesIcon,
  ChartBarIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { useLastVisitedPortfolio } from '@/lib/hooks/use-last-visited-portfolio';

export default function PortfolioAnalysisPage() {
  useLastVisitedPortfolio();

  const { portfolios, activePortfolioId } = usePortfolio();
  
  const activePortfolio = useMemo(() => {
    return portfolios.find(p => p.id === activePortfolioId) || null;
  }, [portfolios, activePortfolioId]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Heading>🤖 AI Portföy Danışmanı</Heading>
        <Text className="mt-1">
          {activePortfolio?.name || 'Portföy'} için yapay zeka destekli analiz ve öneriler
        </Text>
      </div>

      {/* Coming Soon Card */}
      <div className="rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 p-12 text-center">
        <SparklesIcon className="mx-auto h-16 w-16 text-indigo-500" />
        <h3 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-white">
          Yapay Zeka Danışmanı Yakında
        </h3>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
          Portföyünüzü analiz eden, öneriler sunan ve sorularınızı yanıtlayan 
          AI destekli danışman üzerinde çalışıyoruz.
        </p>
      </div>

      {/* Planned Features */}
      <div>
        <Subheading>Planlanan Özellikler</Subheading>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<ChartBarIcon className="h-6 w-6" />}
            title="Portföy Analizi"
            description="Varlık dağılımı, sektör yoğunlaşması ve risk analizi"
          />
          <FeatureCard
            icon={<LightBulbIcon className="h-6 w-6" />}
            title="Akıllı Öneriler"
            description="Alım-satım önerileri ve rebalancing tavsiyeleri"
          />
          <FeatureCard
            icon={<ArrowTrendingUpIcon className="h-6 w-6" />}
            title="Performans İzleme"
            description="Benchmark karşılaştırması ve trend analizi"
          />
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-lg bg-indigo-50 dark:bg-indigo-900/20 p-6 text-center">
        <p className="text-sm text-indigo-700 dark:text-indigo-300">
          Bu özellik hakkında önerileriniz mi var?
        </p>
        <Button className="mt-3" outline>
          Geri Bildirim Gönder
        </Button>
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
        <div className="text-indigo-500">{icon}</div>
        <h4 className="font-medium text-zinc-900 dark:text-white">{title}</h4>
      </div>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
    </div>
  );
}
