import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { AssetForm } from '@/components/assets/asset-form';

interface NewAssetPageProps {
  params: Promise<{ id: string }>;
}

export default async function NewAssetPage({ params }: NewAssetPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-8">
      <div>
        <Heading level={1}>Add New Asset</Heading>
        <Text className="mt-2">Create a new asset for this portfolio.</Text>
      </div>

      <div className="max-w-2xl">
        <AssetForm portfolioId={id} />
      </div>
    </div>
  );
}

