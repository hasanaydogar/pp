'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePortfolio } from '@/lib/context/portfolio-context';
import { useAssets } from '@/lib/hooks/use-assets';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Input, InputGroup } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Spinner } from '@/components/ui/spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { Button } from '@/components/ui/button';
import { AssetType } from '@/lib/types/portfolio';
import { SUPPORTED_CURRENCIES } from '@/lib/types/currency';
import Link from 'next/link';
import clsx from 'clsx';
import { MagnifyingGlassIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid';

type SortField = 'symbol' | 'type' | 'quantity' | 'price' | 'value';
type SortDirection = 'asc' | 'desc';

export default function AssetsPage() {
  const { activePortfolioId, portfolios } = usePortfolio();
  const { assets, loading, error } = useAssets(
    activePortfolioId ? { portfolioId: activePortfolioId } : undefined
  );
  
  const activePortfolio = portfolios.find(p => p.id === activePortfolioId);

  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('symbol');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Get unique currencies from assets
  const availableCurrencies = useMemo(() => {
    const currencies = new Set<string>();
    assets.forEach((asset) => {
      if (asset.currency) {
        currencies.add(asset.currency);
      }
    });
    return Array.from(currencies).sort();
  }, [assets]);

  // Filtered and sorted assets
  const filteredAndSortedAssets = useMemo(() => {
    let filtered = [...assets];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (asset) =>
          asset.symbol.toLowerCase().includes(query) ||
          (asset.name && asset.name.toLowerCase().includes(query))
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((asset) => asset.type === typeFilter);
    }

    // Currency filter
    if (currencyFilter !== 'all') {
      filtered = filtered.filter((asset) => asset.currency === currencyFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'symbol':
          aValue = a.symbol.toLowerCase();
          bValue = b.symbol.toLowerCase();
          break;
        case 'type':
          aValue = a.type.toLowerCase();
          bValue = b.type.toLowerCase();
          break;
        case 'quantity':
          aValue = Number(a.quantity);
          bValue = Number(b.quantity);
          break;
        case 'price':
          aValue = Number(a.average_buy_price);
          bValue = Number(b.average_buy_price);
          break;
        case 'value':
          aValue = Number(a.quantity) * Number(a.average_buy_price);
          bValue = Number(b.quantity) * Number(b.average_buy_price);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [assets, searchQuery, typeFilter, currencyFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ArrowUpIcon className="ml-1 size-4" />
    ) : (
      <ArrowDownIcon className="ml-1 size-4" />
    );
  };

  if (!activePortfolioId) {
    return (
      <div className="space-y-8">
        <div>
          <Heading level={1}>My Assets</Heading>
          <Text className="mt-2">Please select a portfolio from the dropdown above.</Text>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <Heading level={1}>My Assets</Heading>
          <Text className="mt-2">Loading assets...</Text>
        </div>
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <Heading level={1}>My Assets</Heading>
          <Text className="mt-2">Failed to load assets.</Text>
        </div>
        <ErrorMessage error={error} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Heading level={1}>My Assets</Heading>
          <Text className="mt-2">
            {activePortfolio 
              ? `Assets in ${activePortfolio.name}` 
              : 'Manage and track your portfolio assets'}
          </Text>
        </div>
        <Link
          href={`/portfolios/${activePortfolioId}/assets/new`}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Add Asset
        </Link>
      </div>

      {/* Filters and Search */}
      {assets.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Search */}
            <div className="flex-1">
              <InputGroup>
                <MagnifyingGlassIcon data-slot="icon" />
                <Input
                  type="search"
                  placeholder="Search by symbol or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </div>

            {/* Type Filter */}
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full sm:w-48"
            >
              <option value="all">All Types</option>
              {Object.values(AssetType).map((type) => (
                <option key={type} value={type}>
                  {type.replace('_', ' ')}
                </option>
              ))}
            </Select>

            {/* Currency Filter */}
            {availableCurrencies.length > 1 && (
              <Select
                value={currencyFilter}
                onChange={(e) => setCurrencyFilter(e.target.value)}
                className="w-full sm:w-32"
              >
                <option value="all">All Currencies</option>
                {availableCurrencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </Select>
            )}
          </div>

          {/* Results count */}
          {filteredAndSortedAssets.length !== assets.length && (
            <Text className="text-sm text-zinc-600 dark:text-zinc-400">
              Showing {filteredAndSortedAssets.length} of {assets.length} assets
            </Text>
          )}
        </div>
      )}

      {assets.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <Heading level={2}>No Assets Yet</Heading>
          <Text className="mt-2">Get started by adding your first asset to this portfolio.</Text>
          <Link
            href={`/portfolios/${activePortfolioId}/assets/new`}
            className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Add Asset
          </Link>
        </div>
      ) : filteredAndSortedAssets.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <Heading level={2}>No Assets Found</Heading>
          <Text className="mt-2">Try adjusting your filters or search query.</Text>
          <Button
            onClick={() => {
              setSearchQuery('');
              setTypeFilter('all');
              setCurrencyFilter('all');
            }}
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="rounded-lg bg-white shadow-xs ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>
                  <button
                    onClick={() => handleSort('symbol')}
                    className="flex items-center hover:text-zinc-900 dark:hover:text-white"
                  >
                    Symbol
                    <SortIcon field="symbol" />
                  </button>
                </TableHeader>
                <TableHeader>Name</TableHeader>
                <TableHeader>
                  <button
                    onClick={() => handleSort('type')}
                    className="flex items-center hover:text-zinc-900 dark:hover:text-white"
                  >
                    Type
                    <SortIcon field="type" />
                  </button>
                </TableHeader>
                <TableHeader className="text-right">
                  <button
                    onClick={() => handleSort('quantity')}
                    className="ml-auto flex items-center hover:text-zinc-900 dark:hover:text-white"
                  >
                    Quantity
                    <SortIcon field="quantity" />
                  </button>
                </TableHeader>
                <TableHeader className="text-right">
                  <button
                    onClick={() => handleSort('price')}
                    className="ml-auto flex items-center hover:text-zinc-900 dark:hover:text-white"
                  >
                    Avg Price
                    <SortIcon field="price" />
                  </button>
                </TableHeader>
                <TableHeader className="text-right">
                  <button
                    onClick={() => handleSort('value')}
                    className="ml-auto flex items-center hover:text-zinc-900 dark:hover:text-white"
                  >
                    Value
                    <SortIcon field="value" />
                  </button>
                </TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedAssets.map((asset) => {
                const value = Number(asset.quantity) * Number(asset.average_buy_price);
                return (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <Link 
                        href={`/assets/${asset.id}`} 
                        className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                      >
                        {asset.symbol}
                      </Link>
                    </TableCell>
                    <TableCell>{asset.name || asset.symbol}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-md px-2 py-1 text-xs/5 font-medium ring-1 ring-inset bg-zinc-50 text-zinc-600 ring-zinc-500/10 dark:bg-zinc-400/10 dark:text-zinc-400 dark:ring-zinc-400/20">
                        {asset.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{asset.quantity}</TableCell>
                    <TableCell className="text-right">
                      {Number(asset.average_buy_price).toLocaleString('en-US', {
                        style: 'currency',
                        currency: asset.currency || 'USD',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {value.toLocaleString('en-US', {
                        style: 'currency',
                        currency: asset.currency || 'USD',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
