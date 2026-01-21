'use client';

import { useState, useEffect, useRef } from 'react';
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
import { createSlug } from '@/lib/utils/slug';
import { PlusIcon, XMarkIcon } from '@heroicons/react/20/solid';

interface PortfolioType {
  id: string;
  name: string;
  display_name: string;
  icon?: string;
}

interface PortfolioFormData {
  name: string;
  slug: string;
  description: string;
  base_currency: string;
  benchmark_symbol?: string;
  target_value?: string;
  portfolio_type_id?: string;
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
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    base_currency: initialData?.base_currency || 'TRY',
    benchmark_symbol: initialData?.benchmark_symbol || '',
    target_value: initialData?.target_value || '',
    portfolio_type_id: initialData?.portfolio_type_id || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<Error | null>(null);
  const [portfolioTypes, setPortfolioTypes] = useState<PortfolioType[]>([]);

  // New type creation state
  const [showNewTypeInput, setShowNewTypeInput] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeIcon, setNewTypeIcon] = useState('');
  const [creatingType, setCreatingType] = useState(false);
  const newTypeInputRef = useRef<HTMLInputElement>(null);

  // Fetch portfolio types
  const fetchPortfolioTypes = () => {
    fetch('/api/portfolio-types')
      .then(res => res.json())
      .then(data => setPortfolioTypes(data || []))
      .catch(err => console.error('Error fetching portfolio types:', err));
  };

  useEffect(() => {
    fetchPortfolioTypes();
  }, []);

  // Focus input when showing new type form
  useEffect(() => {
    if (showNewTypeInput && newTypeInputRef.current) {
      newTypeInputRef.current.focus();
    }
  }, [showNewTypeInput]);

  // Create new portfolio type
  const handleCreateType = async () => {
    if (!newTypeName.trim()) return;

    setCreatingType(true);
    try {
      const response = await fetch('/api/portfolio-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTypeName.trim().toLowerCase().replace(/\s+/g, '_'),
          display_name: newTypeName.trim(),
          icon: newTypeIcon.trim() || null,
        }),
      });

      if (response.ok) {
        const newType = await response.json();
        fetchPortfolioTypes();
        setFormData(prev => ({ ...prev, portfolio_type_id: newType.id }));
        setNewTypeName('');
        setNewTypeIcon('');
        setShowNewTypeInput(false);
      }
    } catch (err) {
      console.error('Error creating portfolio type:', err);
    } finally {
      setCreatingType(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // For slug field, only allow valid characters
    if (name === 'slug') {
      const sanitizedValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
      setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

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
      newErrors.name = 'Portföy adı gereklidir';
    }

    if (!formData.base_currency) {
      newErrors.base_currency = 'Baz para birimi gereklidir';
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
        slug: formData.slug.trim() || undefined, // Only send if provided
        description: formData.description.trim() || null,
        base_currency: formData.base_currency,
        benchmark_symbol: formData.benchmark_symbol?.trim() || null,
        target_value: formData.target_value ? parseFloat(formData.target_value) : null,
        portfolio_type_id: formData.portfolio_type_id || null,
      };

      if (portfolioId) {
        // Update existing portfolio
        await apiClient.put(`/portfolios/${portfolioId}`, payload);
        await refetch(); // Refresh portfolio list
        router.refresh(); // Refresh Server Components to get updated data
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
          Portföy Adı <span className="text-red-500">*</span>
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
          placeholder="Örn: Uzun Vadeli Yatırımlar"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          URL Kısaltması (Opsiyonel)
        </label>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm text-zinc-500">/p/</span>
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
            placeholder={formData.name ? createSlug(formData.name) : 'my-portfolio'}
          />
        </div>
        <Text className="mt-1 text-xs">
          Boş bırakılırsa portfolio adından otomatik oluşturulur
        </Text>
        {formData.name && (
          <div className="mt-2 rounded bg-zinc-100 p-2 text-sm dark:bg-zinc-800">
            <span className="text-zinc-500">Önizleme: </span>
            <code className="text-zinc-700 dark:text-zinc-300">
              /p/{formData.slug || createSlug(formData.name) || 'slug'}
            </code>
          </div>
        )}
        {errors.slug && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.slug}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Açıklama (Opsiyonel)
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
          placeholder="Örn: Emeklilik için birikim portföyü"
        />
        <Text className="mt-1 text-xs">Portföy için kısa bir açıklama</Text>
      </div>

      <div>
        <label htmlFor="base_currency" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Baz Para Birimi <span className="text-red-500">*</span>
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
          Benchmark Sembolü (Opsiyonel)
        </label>
        <input
          type="text"
          id="benchmark_symbol"
          name="benchmark_symbol"
          value={formData.benchmark_symbol}
          onChange={handleChange}
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
          placeholder="Örn: XU100.IS"
        />
        <Text className="mt-1 text-xs">Portföy performansını karşılaştırmak için bir endeks belirleyin.</Text>
      </div>

      <div>
        <label htmlFor="portfolio_type_id" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Portföy Türü (Opsiyonel)
        </label>

        {!showNewTypeInput ? (
          <div className="mt-1 flex gap-2">
            <select
              id="portfolio_type_id"
              name="portfolio_type_id"
              value={formData.portfolio_type_id}
              onChange={handleChange}
              className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="">Tür seçin (opsiyonel)</option>
              {portfolioTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.icon && `${type.icon} `}{type.display_name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowNewTypeInput(true)}
              className="flex items-center gap-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              title="Yeni tür ekle"
            >
              <PlusIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Yeni</span>
            </button>
          </div>
        ) : (
          <div className="mt-1 space-y-2">
            <div className="flex gap-2">
              <input
                ref={newTypeInputRef}
                type="text"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                placeholder="Tür adı (örn: Emeklilik)"
                className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateType();
                  } else if (e.key === 'Escape') {
                    setShowNewTypeInput(false);
                    setNewTypeName('');
                    setNewTypeIcon('');
                  }
                }}
              />
              <input
                type="text"
                value={newTypeIcon}
                onChange={(e) => setNewTypeIcon(e.target.value)}
                placeholder="📊"
                className="w-16 rounded-lg border border-zinc-300 px-3 py-2 text-center text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
                title="Emoji (opsiyonel)"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCreateType}
                disabled={creatingType || !newTypeName.trim()}
                className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {creatingType ? <Spinner size="sm" /> : <PlusIcon className="h-4 w-4" />}
                Ekle
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewTypeInput(false);
                  setNewTypeName('');
                  setNewTypeIcon('');
                }}
                className="flex items-center gap-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <XMarkIcon className="h-4 w-4" />
                İptal
              </button>
            </div>
          </div>
        )}

        <Text className="mt-1 text-xs">Portföyü kategorize etmek için bir tür seçin veya yeni ekleyin.</Text>
      </div>

      <div>
        <label htmlFor="target_value" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Hedef Değer (Opsiyonel)
        </label>
        <input
          type="number"
          id="target_value"
          name="target_value"
          value={formData.target_value}
          onChange={handleChange}
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
          placeholder="Örn: 1000000"
        />
        <Text className="mt-1 text-xs">Portföy için hedeflenen toplam değer.</Text>
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="mr-2" />
              {portfolioId ? 'Güncelleniyor...' : 'Oluşturuluyor...'}
            </>
          ) : (
            portfolioId ? 'Portföyü Güncelle' : 'Portföy Oluştur'
          )}
        </Button>
        <Button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          İptal
        </Button>
      </div>
    </form>
  );
}

