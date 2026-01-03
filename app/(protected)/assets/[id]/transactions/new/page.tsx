import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { TransactionType } from '@/lib/types/portfolio';

interface NewTransactionPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}

export default async function NewTransactionPage({ params, searchParams }: NewTransactionPageProps) {
  const { id } = await params;
  const { type } = await searchParams;
  
  const initialType = type === 'BUY' || type === 'SELL' ? (type as TransactionType) : undefined;

  return (
    <div className="space-y-8">
      <div>
        <Heading level={1}>Record Transaction</Heading>
        <Text className="mt-2">Record a buy or sell transaction for this asset.</Text>
      </div>

      <div className="max-w-2xl">
        <TransactionForm assetId={id} initialData={initialType ? { type: initialType } : undefined} />
      </div>
    </div>
  );
}

