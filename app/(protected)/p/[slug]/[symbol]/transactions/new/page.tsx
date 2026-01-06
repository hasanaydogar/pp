'use client';

import React from 'react';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { TransactionType } from '@/lib/types/portfolio';
import { usePortfolio } from '@/lib/context/portfolio-context';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getAssetUrl } from '@/lib/utils/slug';

interface NewTransactionPageProps {
  params: Promise<{ slug: string; symbol: string }>;
}

export default function NewTransactionPage({ params }: NewTransactionPageProps) {
  const searchParams = useSearchParams();
  const [slug, setSlug] = React.useState<string | null>(null);
  const [urlSymbol, setUrlSymbol] = React.useState<string | null>(null);
  const [asset, setAsset] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const { setActivePortfolioId } = usePortfolio();
  const type = searchParams.get('type');
  const initialType = type === 'BUY' || type === 'SELL' ? (type as TransactionType) : undefined;

  // Get params
  React.useEffect(() => {
    params.then(({ slug, symbol }) => {
      setSlug(slug);
      setUrlSymbol(symbol);
    });
  }, [params]);

  // Fetch asset data
  React.useEffect(() => {
    if (!slug || !urlSymbol) return;

    const fetchAsset = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/portfolios/by-slug/${slug}/assets/${urlSymbol}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Asset not found');
          } else {
            setError('Failed to load asset');
          }
          return;
        }

        const result = await response.json();
        setAsset(result.data);
        
        if (result.data.portfolio?.id) {
          setActivePortfolioId(result.data.portfolio.id);
        }
      } catch (err) {
        setError('Failed to load asset');
        console.error('Error fetching asset:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAsset();
  }, [slug, urlSymbol, setActivePortfolioId]);

  if (!slug || !urlSymbol) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (loading) {
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
        <Heading level={1}>Record Transaction</Heading>
        <ErrorMessage error={error} />
        <Link href={`/p/${slug}`}>
          <Button>Back to Portfolio</Button>
        </Link>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="space-y-8">
        <Heading level={1}>Asset Not Found</Heading>
        <Text className="mt-2">The asset you're trying to add a transaction to could not be found.</Text>
        <Link href={`/p/${slug}`}>
          <Button>Back to Portfolio</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Heading level={1}>Record Transaction</Heading>
        <Text className="mt-2">Record a buy or sell transaction for {asset.symbol}.</Text>
      </div>

      <div className="max-w-2xl">
        <TransactionForm
          assetId={asset.id}
          initialData={initialType ? { type: initialType } : undefined}
          redirectUrl={getAssetUrl(slug, asset.symbol)}
        />
      </div>
    </div>
  );
}
