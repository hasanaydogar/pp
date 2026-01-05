'use client';

import { useState, useEffect } from 'react';
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
import { TransactionType } from '@/lib/types/portfolio';
import { SUPPORTED_CURRENCIES } from '@/lib/types/currency';
import { useAsset } from '@/lib/hooks/use-asset';

interface TransactionFormData {
  type: TransactionType;
  amount: string;
  price: string;
  date: string;
  transaction_cost: string;
  currency: string;
  notes: string;
}

interface TransactionFormProps {
  assetId: string;
  transactionId?: string;
  initialData?: {
    type?: TransactionType;
    amount?: number;
    price?: number;
    date?: string;
    transaction_cost?: number;
    currency?: string | null;
    notes?: string | null;
  };
  onSuccess?: () => void;
  redirectUrl?: string;
}

export function TransactionForm({ assetId, transactionId, initialData, onSuccess, redirectUrl }: TransactionFormProps) {
  const router = useRouter();
  const { asset, loading: assetLoading } = useAsset(assetId);
  const isEditMode = !!transactionId;
  
  // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
  const formatDateForInput = (dateString: string | undefined): string => {
    if (!dateString) return new Date().toISOString().slice(0, 16);
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return new Date().toISOString().slice(0, 16);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return new Date().toISOString().slice(0, 16);
    }
  };

  const [formData, setFormData] = useState<TransactionFormData>({
    type: initialData?.type || TransactionType.BUY,
    amount: initialData?.amount?.toString() || '',
    price: initialData?.price?.toString() || '',
    date: formatDateForInput(initialData?.date),
    transaction_cost: initialData?.transaction_cost?.toString() || '0',
    currency: initialData?.currency || '',
    notes: initialData?.notes || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<Error | null>(null);

  // Set currency from asset if available
  useEffect(() => {
    if (asset && !formData.currency) {
      setFormData((prev) => ({ ...prev, currency: asset.currency || '' }));
    }
  }, [asset]);

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

    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Amount must be a positive number';
      } else if (formData.type === TransactionType.SELL && asset) {
        // Check if sufficient quantity for SELL
        const assetQuantity = typeof asset.quantity === 'number' ? asset.quantity : parseFloat(String(asset.quantity)) || 0;
        if (amount > assetQuantity) {
          newErrors.amount = `Insufficient quantity. You have ${assetQuantity} available.`;
        }
      }
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        newErrors.price = 'Price must be a positive number';
      }
    }

    if (!formData.date.trim()) {
      newErrors.date = 'Date is required';
    } else {
      const date = new Date(formData.date);
      if (isNaN(date.getTime())) {
        newErrors.date = 'Invalid date format';
      }
    }

    if (formData.transaction_cost.trim()) {
      const cost = parseFloat(formData.transaction_cost);
      if (isNaN(cost) || cost < 0) {
        newErrors.transaction_cost = 'Transaction cost must be a non-negative number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotal = (): number => {
    const amount = parseFloat(formData.amount) || 0;
    const price = parseFloat(formData.price) || 0;
    return amount * price;
  };

  const calculateRealizedGainLoss = (): number | null => {
    if (formData.type !== TransactionType.SELL || !asset) {
      return null;
    }
    const amount = parseFloat(formData.amount) || 0;
    const price = parseFloat(formData.price) || 0;
    const saleValue = amount * price;
    const assetAveragePrice = typeof asset.average_buy_price === 'number' 
      ? asset.average_buy_price 
      : parseFloat(String(asset.average_buy_price)) || 0;
    const costBasis = amount * assetAveragePrice;
    return saleValue - costBasis;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: any = {
        asset_id: assetId,
        type: formData.type,
        amount: parseFloat(formData.amount),
        price: parseFloat(formData.price),
        date: new Date(formData.date).toISOString(),
        transaction_cost: parseFloat(formData.transaction_cost || '0'),
      };

      if (formData.currency && formData.currency.trim()) {
        payload.currency = formData.currency.trim();
      }

      if (formData.notes && formData.notes.trim()) {
        payload.notes = formData.notes.trim();
      }

      if (isEditMode && transactionId) {
        // Edit mode: use PUT API
        await apiClient.put(`/transactions/${transactionId}`, payload);

        if (onSuccess) {
          onSuccess();
        } else if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          router.push(`/assets/${assetId}`);
        }
      } else {
        // Create mode: use POST API
        await apiClient.post(`/assets/${assetId}/transactions`, payload);

        if (onSuccess) {
          onSuccess();
        } else if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          router.push(`/assets/${assetId}`);
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

  if (assetLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="space-y-4">
        <Heading level={2}>Asset Not Found</Heading>
        <Text>The asset you're trying to add a transaction for could not be found.</Text>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  // Type guard: ensure asset has required properties
  const assetQuantity = typeof asset.quantity === 'number' ? asset.quantity : parseFloat(String(asset.quantity)) || 0;
  const assetAveragePrice = typeof asset.average_buy_price === 'number' 
    ? asset.average_buy_price 
    : parseFloat(String(asset.average_buy_price)) || 0;


  const total = calculateTotal();
  const realizedGainLoss = calculateRealizedGainLoss();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && <ErrorMessage error={submitError} />}

      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
        <Text className="text-sm font-medium">Asset: {asset.symbol}</Text>
        <Text className="text-xs text-zinc-600 dark:text-zinc-400">
          Current Quantity: {assetQuantity} | Average Buy Price:{' '}
          {assetAveragePrice.toLocaleString('en-US', {
            style: 'currency',
            currency: asset.currency || 'USD',
          })}
        </Text>
      </div>

      <FieldGroup>
        <Field>
          <Label>
            Transaction Type <span className="text-red-500">*</span>
          </Label>
          <Select
            name="type"
            value={formData.type}
            onChange={handleChange}
            data-invalid={errors.type ? true : undefined}
          >
            <option value={TransactionType.BUY}>Buy</option>
            <option value={TransactionType.SELL}>Sell</option>
          </Select>
          {errors.type && (
            <Text className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.type}</Text>
          )}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <Label>
              {formData.type === TransactionType.BUY ? 'Quantity to Buy' : 'Quantity to Sell'}{' '}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="any"
              min="0"
              data-invalid={errors.amount ? true : undefined}
            />
            {errors.amount && (
              <Text className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.amount}
              </Text>
            )}
            {formData.type === TransactionType.SELL && asset && (
              <Text className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                Available: {assetQuantity}
              </Text>
            )}
          </Field>

          <Field>
            <Label>
              Price per Unit <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              step="any"
              min="0"
              data-invalid={errors.price ? true : undefined}
            />
            {errors.price && (
              <Text className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.price}</Text>
            )}
          </Field>
        </div>

        {total > 0 && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <Text className="text-sm font-medium">
              Total: {total.toLocaleString('en-US', { style: 'currency', currency: formData.currency || asset.currency || 'USD' })}
            </Text>
            {realizedGainLoss !== null && (
              <Text
                className={`text-sm ${realizedGainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
              >
                Realized {realizedGainLoss >= 0 ? 'Gain' : 'Loss'}:{' '}
                {Math.abs(realizedGainLoss).toLocaleString('en-US', {
                  style: 'currency',
                  currency: formData.currency || asset.currency || 'USD',
                })}
              </Text>
            )}
          </div>
        )}

        <Field>
          <Label>
            Transaction Date <span className="text-red-500">*</span>
          </Label>
          <Input
            type="datetime-local"
            name="date"
            value={formData.date}
            onChange={handleChange}
            data-invalid={errors.date ? true : undefined}
          />
          {errors.date && (
            <Text className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date}</Text>
          )}
        </Field>

        <Field>
          <Label>Transaction Cost (Optional)</Label>
          <Input
            type="number"
            name="transaction_cost"
            value={formData.transaction_cost}
            onChange={handleChange}
            placeholder="0.00"
            step="any"
            min="0"
            data-invalid={errors.transaction_cost ? true : undefined}
          />
          {errors.transaction_cost && (
            <Text className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.transaction_cost}
            </Text>
          )}
          <Text className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Fees, commissions, or other costs associated with this transaction.
          </Text>
        </Field>

        <Field>
          <Label>Currency</Label>
          <Select name="currency" value={formData.currency} onChange={handleChange}>
            <option value="">Use asset currency ({asset.currency || 'USD'})</option>
            {SUPPORTED_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </Select>
        </Field>

        <Field>
          <Label>Notes</Label>
          <Textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Optional notes about this transaction..."
            rows={4}
          />
        </Field>
      </FieldGroup>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="mr-2" />
              {isEditMode ? 'Updating...' : 'Recording...'}
            </>
          ) : (
            isEditMode
              ? `Update Transaction`
              : `Record ${formData.type === TransactionType.BUY ? 'Buy' : 'Sell'} Transaction`
          )}
        </Button>
        <Button type="button" onClick={() => router.back()} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

