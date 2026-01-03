'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePortfolio } from '@/lib/context/portfolio-context';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/types';
import { ErrorMessage } from '@/components/ui/error-message';
import { Spinner } from '@/components/ui/spinner';
import { SUPPORTED_CURRENCIES } from '@/lib/types/currency';

interface PortfolioFormData {
  name: string;
  base_currency: string;
  benchmark_symbol?: string;
}

interface PortfolioFormProps {
  initialData?: PortfolioFormData;
  portfolioId?: string;
  onSuccess?: () => void;
}

export function PortfolioForm({ initialData, portfolioId, onSuccess }: PortfolioFormProps) {
  const router = useRouter();
  const { refetch, setActivePortfolioId } = usePortfolio();
  const [formData, setFormData] = useState<PortfolioFormData>({
    name: initialData?.name || '',
    base_currency: initialData?.base_currency || 'USD',
    benchmark_symbol: initialData?.benchmark_symbol || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<Error | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Portfolio name is required';
    }

    if (!formData.base_currency) {
      newErrors.base_currency = 'Base currency is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        base_currency: formData.base_currency,
        benchmark_symbol: formData.benchmark_symbol?.trim() || null,
      };

      if (portfolioId) {
        // Update existing portfolio
        await apiClient.put(`/portfolios/${portfolioId}`, payload);
        await refetch(); // Refresh portfolio list
      } else {
        // Create new portfolio
        // API returns { data: { id, name, ... } }, client extracts data automatically
        const newPortfolio = await apiClient.post<{ id: string }>('/portfolios', payload);
        await refetch(); // Refresh portfolio list
        setActivePortfolioId(newPortfolio.id); // Set as active portfolio
        router.push(`/portfolios/${newPortfolio.id}`);
        return; // Early return to prevent double navigation
      }

      if (onSuccess) {
        onSuccess();
      } else if (!portfolioId) {
        // Only redirect if creating new (edit will use onSuccess callback)
        router.push(`/portfolios`);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.type === 'VALIDATION' && error.details) {
          // Handle validation errors
          const validationErrors = error.details as Record<string, string | string[]>;
          const formattedErrors: Record<string, string> = {};
          Object.keys(validationErrors).forEach((key) => {
            const value = validationErrors[key];
            formattedErrors[key] = Array.isArray(value) ? value[0] : value;
          });
          setErrors(formattedErrors);
        } else {
          setSubmitError(error);
        }
      } else {
        setSubmitError(error instanceof Error ? error : new Error('An error occurred'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <ErrorMessage error={submitError} />
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Portfolio Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm ${
            errors.name
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-zinc-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900'
          }`}
          placeholder="e.g., My Investment Portfolio"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="base_currency" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Base Currency <span className="text-red-500">*</span>
        </label>
        <select
          id="base_currency"
          name="base_currency"
          value={formData.base_currency}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm ${
            errors.base_currency
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-zinc-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900'
          }`}
        >
          {SUPPORTED_CURRENCIES.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
        {errors.base_currency && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.base_currency}</p>
        )}
      </div>

      <div>
        <label htmlFor="benchmark_symbol" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Benchmark Symbol (Optional)
        </label>
        <input
          type="text"
          id="benchmark_symbol"
          name="benchmark_symbol"
          value={formData.benchmark_symbol}
          onChange={handleChange}
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
          placeholder="e.g., SPY, BIST100"
        />
        <Text className="mt-1 text-xs">Compare your portfolio performance against a benchmark index.</Text>
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="mr-2" />
              {portfolioId ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            portfolioId ? 'Update Portfolio' : 'Create Portfolio'
          )}
        </Button>
        <Button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

