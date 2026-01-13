'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePortfolio } from '@/lib/context/portfolio-context';
import { apiClient } from '@/lib/api/client';
import { ApiError, ApiErrorType } from '@/lib/api/types';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Spinner } from '@/components/ui/spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import Link from 'next/link';
import clsx from 'clsx';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/20/solid';
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/components/ui/dropdown';

interface Portfolio {
  id: string;
  name: string;
  base_currency: string;
  benchmark_symbol?: string | null;
  created_at: string;
}

export default function PortfoliosPage() {
  const router = useRouter();
  const { portfolios, refetch, activePortfolioId, setActivePortfolioId } = usePortfolio();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleEdit = (portfolio: Portfolio) => {
    router.push(`/portfolios/${portfolio.id}/edit`);
  };

  const handleDeleteClick = (portfolio: Portfolio) => {
    setDeleteConfirmId(portfolio.id);
    setDeleteConfirmName('');
  };

  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
    setDeleteConfirmName('');
  };

  const handleConfirmDelete = async (portfolioId: string) => {
    if (deleteConfirmName !== portfolios.find(p => p.id === portfolioId)?.name) {
      setError(new ApiError('Portfolio name does not match', ApiErrorType.VALIDATION, 400));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/portfolios/${portfolioId}`);
      
      // If deleted portfolio was active, switch to first remaining portfolio
      if (activePortfolioId === portfolioId) {
        const remaining = portfolios.filter(p => p.id !== portfolioId);
        if (remaining.length > 0) {
          setActivePortfolioId(remaining[0].id);
        } else {
          setActivePortfolioId(null);
        }
      }
      
      await refetch();
      setDeleteConfirmId(null);
      setDeleteConfirmName('');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
      } else {
        setError(new ApiError('Failed to delete portfolio', ApiErrorType.UNKNOWN, undefined, err));
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && portfolios.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <Text>Loading portfolios...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Heading level={1}>All Portfolios</Heading>
          <Text className="mt-2">Manage your portfolios</Text>
        </div>
        <Link href="/portfolios/new">
          <Button>
            <PlusIcon className="-mx-0.5 my-0.5 size-5 shrink-0 self-center sm:my-1 sm:size-4" data-slot="icon" />
            New Portfolio
          </Button>
        </Link>
      </div>

      {error && (
        <ErrorMessage error={error} onRetry={() => refetch()} />
      )}

      {portfolios.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <Heading level={2}>No Portfolios Yet</Heading>
          <Text className="mt-2">Get started by creating your first portfolio.</Text>
          <Link href="/portfolios/new">
            <Button className="mt-6">
              <PlusIcon className="mr-2 size-5" />
              Create Portfolio
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-lg bg-white shadow-xs ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Name</TableHeader>
                <TableHeader>Base Currency</TableHeader>
                <TableHeader>Benchmark</TableHeader>
                <TableHeader>Created</TableHeader>
                <TableHeader className="text-right">Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {portfolios.map((portfolio) => (
                <TableRow key={portfolio.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/portfolios/${portfolio.id}`}
                        className={clsx(
                          'hover:text-indigo-600 dark:hover:text-indigo-400',
                          activePortfolioId === portfolio.id ? 'font-semibold' : ''
                        )}
                      >
                        {portfolio.name}
                      </Link>
                      {activePortfolioId === portfolio.id && (
                        <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                          Active
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{portfolio.base_currency}</TableCell>
                  <TableCell>{portfolio.benchmark_symbol || '-'}</TableCell>
                  <TableCell>
                    {new Date(portfolio.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    {deleteConfirmId === portfolio.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <input
                          type="text"
                          placeholder="Type portfolio name"
                          value={deleteConfirmName}
                          onChange={(e) => setDeleteConfirmName(e.target.value)}
                          className="rounded-lg border border-red-300 px-2 py-1 text-sm dark:border-red-700 dark:bg-zinc-800"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && deleteConfirmName === portfolio.name) {
                              handleConfirmDelete(portfolio.id);
                            } else if (e.key === 'Escape') {
                              handleCancelDelete();
                            }
                          }}
                        />
                        <Button
                          onClick={() => handleConfirmDelete(portfolio.id)}
                          disabled={loading || deleteConfirmName !== portfolio.name}
                        >
                          Confirm
                        </Button>
                        <Button
                          plain
                          onClick={handleCancelDelete}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          plain
                          onClick={() => handleEdit(portfolio)}
                          disabled={loading}
                        >
                          <PencilIcon className="size-4" />
                        </Button>
                        <Button
                          plain
                          onClick={() => handleDeleteClick(portfolio)}
                          disabled={loading}
                        >
                          <TrashIcon className="size-4 text-red-600 dark:text-red-400" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

