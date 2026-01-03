'use client';

import { usePortfolio } from '@/lib/context/portfolio-context';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';

export default function AnalysisPage() {
  const { activePortfolioId, portfolios } = usePortfolio();
  const activePortfolio = portfolios.find(p => p.id === activePortfolioId);

  if (!activePortfolioId) {
    return (
      <div className="space-y-8">
        <div>
          <Heading level={1}>AI Analysis</Heading>
          <Text className="mt-2">Please select a portfolio from the dropdown above.</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Heading level={1}>AI Analysis</Heading>
        <Text className="mt-2">
          {activePortfolio 
            ? `AI-powered analysis for ${activePortfolio.name}` 
            : 'AI-powered portfolio analysis'}
        </Text>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <Heading level={2}>Coming Soon</Heading>
        <Text className="mt-2">
          AI analysis features will be available soon. This will include portfolio insights, 
          risk analysis, and investment recommendations.
        </Text>
      </div>
    </div>
  );
}
