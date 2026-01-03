import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { PortfolioForm } from '@/components/portfolios/portfolio-form';

export default function NewPortfolioPage() {
  return (
    <div className="space-y-8">
      <div>
        <Heading level={1}>Create New Portfolio</Heading>
        <Text className="mt-2">Create a new portfolio to track your investments.</Text>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-xs ring-1 ring-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900 dark:ring-white/10">
        <PortfolioForm />
      </div>
    </div>
  );
}

