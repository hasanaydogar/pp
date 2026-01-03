'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePortfolio } from '@/lib/context/portfolio-context';
import { Dialog, DialogBody, DialogTitle, DialogDescription, DialogActions } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api/client';
import { ApiError, ApiErrorType } from '@/lib/api/types';
import { ErrorMessage } from '@/components/ui/error-message';
import { Spinner } from '@/components/ui/spinner';
import { TrashIcon } from '@heroicons/react/20/solid';

interface DeletePortfolioDialogProps {
  open: boolean;
  onClose: () => void;
  portfolio: {
    id: string;
    name: string;
  };
}

export function DeletePortfolioDialog({ open, onClose, portfolio }: DeletePortfolioDialogProps) {
  const router = useRouter();
  const { refetch, activePortfolioId, setActivePortfolioId, portfolios } = usePortfolio();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [error, setError] = useState<Error | null>(null);

  const handleDelete = async () => {
    if (confirmName !== portfolio.name) {
      setError(new ApiError('Portfolio name does not match', ApiErrorType.VALIDATION, 400));
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await apiClient.delete(`/portfolios/${portfolio.id}`);
      
      // If deleted portfolio was active, switch to first remaining portfolio
      if (activePortfolioId === portfolio.id) {
        const remaining = portfolios.filter(p => p.id !== portfolio.id);
        if (remaining.length > 0) {
          setActivePortfolioId(remaining[0].id);
        } else {
          setActivePortfolioId(null);
        }
      }
      
      await refetch();
      
      // Redirect to portfolios list
      router.push('/portfolios');
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
      } else {
        setError(err instanceof Error ? err : new Error('Failed to delete portfolio'));
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} size="md">
      <DialogTitle>Delete Portfolio</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete the portfolio and all associated assets and transactions.
      </DialogDescription>
      <DialogBody>
        <div className="space-y-4">
          {error && <ErrorMessage error={error} />}

          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <Text className="text-sm font-medium text-red-800 dark:text-red-200">
              Warning: This will permanently delete the portfolio "{portfolio.name}" and all associated assets and transactions.
            </Text>
          </div>

          <div>
            <Text className="mb-2 text-sm font-medium">
              To confirm, please type the portfolio name: <strong>{portfolio.name}</strong>
            </Text>
            <Input
              type="text"
              value={confirmName}
              onChange={(e) => {
                setConfirmName(e.target.value);
                setError(null);
              }}
              placeholder="Type portfolio name"
              className="border-red-300 dark:border-red-700"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && confirmName === portfolio.name) {
                  handleDelete();
                }
              }}
            />
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
              disabled={isDeleting || confirmName !== portfolio.name}
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
                  Delete Portfolio
                </>
              )}
            </Button>
          </DialogActions>
        </div>
      </DialogBody>
    </Dialog>
  );
}

