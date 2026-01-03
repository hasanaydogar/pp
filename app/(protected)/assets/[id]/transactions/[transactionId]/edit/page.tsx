'use client';

import React from 'react';
import { useAsset } from '@/lib/hooks/use-asset';
import { useTransaction } from '@/lib/hooks/use-transaction';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { TransactionType } from '@/lib/types/portfolio';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface EditTransactionPageProps {
  params: Promise<{ id: string; transactionId: string }>;
}

export default function EditTransactionPage({ params }: EditTransactionPageProps) {
  const [assetId, setAssetId] = React.useState<string | null>(null);
  const [transactionId, setTransactionId] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    params.then(({ id, transactionId }) => {
      setAssetId(id);
      setTransactionId(transactionId);
    });
  }, [params]);

  const { asset, loading: assetLoading } = useAsset(assetId || '');
  const { transaction, loading: transactionLoading, error, refetch } = useTransaction(transactionId || '');

  if (!assetId || !transactionId) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (assetLoading || transactionLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <Heading level={1}>Edit Transaction</Heading>
        <ErrorMessage error={error} onRetry={refetch} />
      </div>
    );
  }

  if (!asset || !transaction) {
    return (
      <div className="space-y-8">
        <Heading level={1}>Transaction Not Found</Heading>
        <Text className="mt-2">The transaction you're trying to edit could not be found.</Text>
        <Link href={`/assets/${assetId}`}>
          <Button>Back to Asset</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Heading level={1}>Edit Transaction</Heading>
        <Text className="mt-2">Update transaction details for {asset.symbol}.</Text>
      </div>

      <div className="max-w-2xl">
        <TransactionForm
          assetId={asset.id}
          transactionId={transaction.id}
          initialData={{
            type: transaction.type as TransactionType,
            amount: typeof transaction.amount === 'number' ? transaction.amount : parseFloat(String(transaction.amount)) || 0,
            price: typeof transaction.price === 'number' ? transaction.price : parseFloat(String(transaction.price)) || 0,
            date: transaction.date,
            transaction_cost: typeof transaction.transaction_cost === 'number' ? transaction.transaction_cost : parseFloat(String(transaction.transaction_cost)) || 0,
            currency: transaction.currency || null,
            notes: transaction.notes || null,
          }}
        />
      </div>
    </div>
  );
}

