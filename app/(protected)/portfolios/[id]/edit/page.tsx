import { redirect } from 'next/navigation';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { PortfolioForm } from '@/components/portfolios/portfolio-form';
import { getPortfolio } from '@/lib/api/server';
import { ErrorMessage } from '@/components/ui/error-message';

interface EditPortfolioPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPortfolioPage({ params }: EditPortfolioPageProps) {
  const { id } = await params;
  let portfolio;
  let error: Error | null = null;

  try {
    portfolio = await getPortfolio(id);
  } catch (err) {
    error = err instanceof Error ? err : new Error('Failed to load portfolio');
  }

  if (error) {
    return (
      <div className="space-y-8">
        <Heading level={1}>Edit Portfolio</Heading>
        <ErrorMessage error={error} />
      </div>
    );
  }

  if (!portfolio) {
    redirect('/portfolios');
  }

  return (
    <div className="space-y-8">
      <div>
        <Heading level={1}>Edit Portfolio</Heading>
        <Text className="mt-2">Update your portfolio information.</Text>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-xs ring-1 ring-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900 dark:ring-white/10">
        <PortfolioForm
          portfolioId={id}
          initialData={{
            name: portfolio.name,
            base_currency: portfolio.base_currency,
            benchmark_symbol: portfolio.benchmark_symbol || undefined,
          }}
        />
      </div>
    </div>
  );
}

