'use client';

import React from 'react';
import { useTransaction } from '@/lib/hooks/use-transaction';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { TransactionType } from '@/lib/types/portfolio';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePortfolio } from '@/lib/context/portfolio-context';
import { getAssetUrl } from '@/lib/utils/slug';

interface EditTransactionPageProps {
  params: Promise<{ slug: string; symbol: string; transactionId: string }>;
}

export default function EditTransactionPage({ params }: EditTransactionPageProps) {
  const [slug, setSlug] = React.useState<string | null>(null);
  const [urlSymbol, setUrlSymbol] = React.useState<string | null>(null);
  const [transactionId, setTransactionId] = React.useState<string | null>(null);
  const [asset, setAsset] = React.useState<any>(null);
  const [assetLoading, setAssetLoading] = React.useState(true);
  const [assetError, setAssetError] = React.useState<string | null>(null);

  const { setActivePortfolioId } = usePortfolio();
  const { transaction, loading: transactionLoading, error: transactionError, refetch } = useTransaction(transactionId || '');

  // Get params
  React.useEffect(() => {
    params.then(({ slug, symbol, transactionId }) => {
      setSlug(slug);
      setUrlSymbol(symbol);
      setTransactionId(transactionId);
    });
  }, [params]);

  // Fetch asset data
  React.useEffect(() => {
    if (!slug || !urlSymbol) return;

    const fetchAsset = async () => {
      setAssetLoading(true);
      setAssetError(null);

      try {
        const response = await fetch(`/api/portfolios/by-slug/${slug}/assets/${urlSymbol}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setAssetError('Asset not found');
          } else {
            setAssetError('Failed to load asset');
          }
          return;
        }

        const result = await response.json();
        setAsset(result.data);
        
        if (result.data.portfolio?.id) {
          setActivePortfolioId(result.data.portfolio.id);
        }
      } catch (err) {
        setAssetError('Failed to load asset');
        console.error('Error fetching asset:', err);
      } finally {
        setAssetLoading(false);
      }
    };

    fetchAsset();
  }, [slug, urlSymbol, setActivePortfolioId]);

  if (!slug || !urlSymbol || !transactionId) {
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

  if (assetError || transactionError) {
    return (
      <div className="space-y-8">
        <Heading level={1}>Edit Transaction</Heading>
        <ErrorMessage error={assetError || transactionError || 'Unknown error'} onRetry={refetch} />
        <Link href={`/p/${slug}`}>
          <Button>Back to Portfolio</Button>
        </Link>
      </div>
    );
  }

  if (!asset || !transaction) {
    return (
      <div className="space-y-8">
        <Heading level={1}>Transaction Not Found</Heading>
        <Text className="mt-2">The transaction you're trying to edit could not be found.</Text>
        <Link href={slug ? getAssetUrl(slug, urlSymbol) : `/p/${slug}`}>
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
          redirectUrl={getAssetUrl(slug, asset.symbol)}
        />
      </div>
    </div>
  );
}
