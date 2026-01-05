'use client';

import React from 'react';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { AssetForm } from '@/components/assets/asset-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePortfolio } from '@/lib/context/portfolio-context';
import { getAssetUrl } from '@/lib/utils/slug';

interface EditAssetPageProps {
  params: Promise<{ slug: string; symbol: string }>;
}

export default function EditAssetPage({ params }: EditAssetPageProps) {
  const [slug, setSlug] = React.useState<string | null>(null);
  const [urlSymbol, setUrlSymbol] = React.useState<string | null>(null);
  const [asset, setAsset] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const { setActivePortfolioId } = usePortfolio();

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
        <Heading level={1}>Edit Asset</Heading>
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
        <Text className="mt-2">The asset you're trying to edit could not be found.</Text>
        <Link href={`/p/${slug}`}>
          <Button>Back to Portfolio</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Heading level={1}>Edit Asset</Heading>
        <Text className="mt-2">Update asset information for {asset.symbol}.</Text>
      </div>

      <div className="max-w-2xl">
        <AssetForm
          assetId={asset.id}
          portfolioId={asset.portfolio_id}
          initialData={{
            symbol: asset.symbol,
            type: asset.type as any,
            quantity: typeof asset.quantity === 'number' ? asset.quantity : parseFloat(String(asset.quantity)) || 0,
            average_buy_price: typeof asset.average_buy_price === 'number' 
              ? asset.average_buy_price 
              : parseFloat(String(asset.average_buy_price)) || 0,
            currency: asset.currency,
            initial_purchase_date: asset.initial_purchase_date || null,
            notes: asset.notes || null,
          }}
          redirectUrl={getAssetUrl(slug, asset.symbol)}
        />
      </div>
    </div>
  );
}
