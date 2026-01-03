'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldGroup, Label } from '@/components/ui/fieldset';
import { apiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/types';
import { ErrorMessage } from '@/components/ui/error-message';
import { Spinner } from '@/components/ui/spinner';
import { AssetType } from '@/lib/types/portfolio';
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from '@/lib/types/currency';

interface AssetFormData {
  symbol: string;
  type: AssetType;
  quantity: string;
  average_buy_price: string;
  currency: string;
  initial_purchase_date: string;
  notes: string;
}

interface AssetFormProps {
  portfolioId?: string;
  assetId?: string;
  initialData?: {
    symbol?: string;
    type?: AssetType;
    quantity?: number;
    average_buy_price?: number;
    currency?: string;
    initial_purchase_date?: string | null;
    notes?: string | null;
  };
  onSuccess?: () => void;
}

const ASSET_TYPE_OPTIONS = [
  { value: AssetType.STOCK, label: 'Stock' },
  { value: AssetType.CRYPTO, label: 'Crypto' },
  { value: AssetType.FOREX, label: 'Forex' },
  { value: AssetType.MUTUAL_FUND, label: 'Mutual Fund' },
  { value: AssetType.ETF, label: 'ETF' },
  { value: AssetType.BOND, label: 'Bond' },
  { value: AssetType.COMMODITY, label: 'Commodity' },
  { value: AssetType.REAL_ESTATE, label: 'Real Estate' },
  { value: AssetType.DERIVATIVE, label: 'Derivative' },
  { value: AssetType.OTHER, label: 'Other' },
];

export function AssetForm({ portfolioId, assetId, initialData, onSuccess }: AssetFormProps) {
  const router = useRouter();
  const isEditMode = !!assetId;
  
  // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      // Convert to local datetime string format
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  const [formData, setFormData] = useState<AssetFormData>({
    symbol: initialData?.symbol || '',
    type: initialData?.type || AssetType.STOCK,
    quantity: initialData?.quantity?.toString() || '',
    average_buy_price: initialData?.average_buy_price?.toString() || '',
    currency: initialData?.currency || DEFAULT_CURRENCY,
    initial_purchase_date: formatDateForInput(initialData?.initial_purchase_date),
    notes: initialData?.notes || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<Error | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
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

    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Symbol is required';
    } else if (formData.symbol.length > 20) {
      newErrors.symbol = 'Symbol must be 20 characters or less';
    }

    if (!formData.quantity.trim()) {
      newErrors.quantity = 'Quantity is required';
    } else {
      const quantity = parseFloat(formData.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        newErrors.quantity = 'Quantity must be a positive number';
      }
    }

    if (!formData.average_buy_price.trim()) {
      newErrors.average_buy_price = 'Average buy price is required';
    } else {
      const price = parseFloat(formData.average_buy_price);
      if (isNaN(price) || price <= 0) {
        newErrors.average_buy_price = 'Average buy price must be a positive number';
      }
    }

    if (formData.initial_purchase_date && formData.initial_purchase_date.trim()) {
      const date = new Date(formData.initial_purchase_date);
      if (isNaN(date.getTime())) {
        newErrors.initial_purchase_date = 'Invalid date format';
      }
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
      if (isEditMode && assetId) {
        // Edit mode: use PUT API
        const payload: any = {};

        if (formData.symbol.trim()) {
          payload.symbol = formData.symbol.trim().toUpperCase();
        }
        if (formData.type) {
          payload.type = formData.type;
        }
        if (formData.quantity.trim()) {
          payload.quantity = parseFloat(formData.quantity);
        }
        if (formData.average_buy_price.trim()) {
          payload.average_buy_price = parseFloat(formData.average_buy_price);
        }
        if (formData.currency) {
          payload.currency = formData.currency;
        }
        if (formData.initial_purchase_date && formData.initial_purchase_date.trim()) {
          // Convert to ISO datetime string
          const date = new Date(formData.initial_purchase_date);
          payload.initial_purchase_date = date.toISOString();
        } else if (formData.initial_purchase_date === '') {
          // Empty string means remove the date
          payload.initial_purchase_date = null;
        }
        if (formData.notes !== undefined) {
          payload.notes = formData.notes.trim() || null;
        }

        await apiClient.put(`/assets/${assetId}`, payload);

        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/assets/${assetId}`);
        }
      } else if (portfolioId) {
        // Create mode: use POST API
        const payload: any = {
          portfolio_id: portfolioId,
          symbol: formData.symbol.trim().toUpperCase(),
          type: formData.type,
          quantity: parseFloat(formData.quantity),
          average_buy_price: parseFloat(formData.average_buy_price),
          currency: formData.currency || DEFAULT_CURRENCY,
        };

        if (formData.initial_purchase_date && formData.initial_purchase_date.trim()) {
          // Convert to ISO datetime string
          const date = new Date(formData.initial_purchase_date);
          payload.initial_purchase_date = date.toISOString();
        }

        if (formData.notes && formData.notes.trim()) {
          payload.notes = formData.notes.trim();
        }

        const response = await apiClient.post<{ id: string }>(
          `/portfolios/${portfolioId}/assets`,
          payload
        );

        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/assets/${response.id}`);
        }
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
      {submitError && <ErrorMessage error={submitError} />}

      <FieldGroup>
        <Field>
          <Label>
            Symbol <span className="text-red-500">*</span>
          </Label>
          <Input
            type="text"
            name="symbol"
            value={formData.symbol}
            onChange={handleChange}
            placeholder="e.g., AAPL, BTC"
            data-invalid={errors.symbol ? true : undefined}
            maxLength={20}
          />
          {errors.symbol && (
            <Text className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.symbol}</Text>
          )}
        </Field>

        <Field>
          <Label>
            Asset Type <span className="text-red-500">*</span>
          </Label>
          <Select
            name="type"
            value={formData.type}
            onChange={handleChange}
            data-invalid={errors.type ? true : undefined}
          >
            {ASSET_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          {errors.type && (
            <Text className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.type}</Text>
          )}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <Label>
              Quantity <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="0.00"
              step="any"
              min="0"
              data-invalid={errors.quantity ? true : undefined}
            />
            {errors.quantity && (
              <Text className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.quantity}
              </Text>
            )}
          </Field>

          <Field>
            <Label>
              Average Buy Price <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              name="average_buy_price"
              value={formData.average_buy_price}
              onChange={handleChange}
              placeholder="0.00"
              step="any"
              min="0"
              data-invalid={errors.average_buy_price ? true : undefined}
            />
            {errors.average_buy_price && (
              <Text className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.average_buy_price}
              </Text>
            )}
          </Field>
        </div>

        <Field>
          <Label>Currency</Label>
          <Select name="currency" value={formData.currency} onChange={handleChange}>
            {SUPPORTED_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </Select>
        </Field>

        <Field>
          <Label>Initial Purchase Date</Label>
          <Input
            type="datetime-local"
            name="initial_purchase_date"
            value={formData.initial_purchase_date}
            onChange={handleChange}
            data-invalid={errors.initial_purchase_date ? true : undefined}
          />
          {errors.initial_purchase_date && (
            <Text className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.initial_purchase_date}
            </Text>
          )}
        </Field>

        <Field>
          <Label>Notes</Label>
          <Textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Optional notes about this asset..."
            rows={4}
          />
        </Field>
      </FieldGroup>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="mr-2" />
              {isEditMode ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            isEditMode ? 'Update Asset' : 'Create Asset'
          )}
        </Button>
        <Button type="button" onClick={() => router.back()} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

