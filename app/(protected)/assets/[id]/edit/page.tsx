'use client';

import React from 'react';
import { useAsset } from '@/lib/hooks/use-asset';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { AssetForm } from '@/components/assets/asset-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface EditAssetPageProps {
  params: Promise<{ id: string }>;
}

export default function EditAssetPage({ params }: EditAssetPageProps) {
  const [assetId, setAssetId] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    params.then(({ id }) => setAssetId(id));
  }, [params]);

  const { asset, loading, error, refetch } = useAsset(assetId || '');

  if (!assetId) {
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
        <ErrorMessage error={error} onRetry={refetch} />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="space-y-8">
        <Heading level={1}>Asset Not Found</Heading>
        <Text className="mt-2">The asset you're trying to edit could not be found.</Text>
        <Link href="/assets">
          <Button>Back to Assets</Button>
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
        />
      </div>
    </div>
  );
}

