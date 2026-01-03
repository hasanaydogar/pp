'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogBody, DialogTitle, DialogDescription, DialogActions } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { apiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/types';
import { ErrorMessage } from '@/components/ui/error-message';
import { Spinner } from '@/components/ui/spinner';
import { TrashIcon } from '@heroicons/react/20/solid';

interface DeleteAssetDialogProps {
  open: boolean;
  onClose: () => void;
  asset: {
    id: string;
    symbol: string;
    portfolio_id: string;
  };
}

export function DeleteAssetDialog({ open, onClose, asset }: DeleteAssetDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await apiClient.delete(`/assets/${asset.id}`);
      
      // Redirect to assets list or portfolio
      router.push(`/assets`);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
      } else {
        setError(err instanceof Error ? err : new Error('Failed to delete asset'));
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} size="md">
      <DialogTitle>Delete Asset</DialogTitle>
      <DialogDescription>
        Are you sure you want to delete this asset? This action cannot be undone.
      </DialogDescription>
      <DialogBody>
        <div className="space-y-4">
          {error && <ErrorMessage error={error} />}

          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <Text className="text-sm font-medium text-red-800 dark:text-red-200">
              Warning: This will permanently delete the asset "{asset.symbol}" and all associated transactions.
            </Text>
          </div>

          <DialogActions>
            <Button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              plain
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-500"
            >
              {isDeleting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <TrashIcon className="mr-2 size-4" />
                  Delete Asset
                </>
              )}
            </Button>
          </DialogActions>
        </div>
      </DialogBody>
    </Dialog>
  );
}

