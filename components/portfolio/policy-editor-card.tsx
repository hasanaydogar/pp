'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { usePolicy } from '@/lib/hooks/use-policy';
import { DEFAULT_POLICY, UpdatePortfolioPolicy } from '@/lib/types/policy';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Field, 
  Label, 
  Description, 
  ErrorMessage, 
  Fieldset, 
  Legend 
} from '@/components/ui/fieldset';
import { 
  PencilIcon, 
  XMarkIcon,
  CheckIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface PolicyEditorCardProps {
  portfolioId: string;
}

interface FormValues {
  max_weight_per_stock: string;
  max_weight_per_sector: string;
  core_min_weight: string;
  core_max_weight: string;
  satellite_min_weight: string;
  satellite_max_weight: string;
  new_position_min_weight: string;
  new_position_max_weight: string;
  cash_min_percent: string;
  cash_max_percent: string;
  cash_target_percent: string;
}

interface FormErrors {
  max_weight_per_stock?: string;
  max_weight_per_sector?: string;
  core_min_weight?: string;
  core_max_weight?: string;
  satellite_min_weight?: string;
  satellite_max_weight?: string;
  new_position_min_weight?: string;
  new_position_max_weight?: string;
  cash_min_percent?: string;
  cash_max_percent?: string;
  cash_target_percent?: string;
  general?: string;
}

function toPercent(value: number): string {
  return (value * 100).toFixed(1);
}

function fromPercent(value: string): number {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num / 100;
}

function validatePercentField(
  value: string, 
  min: number = 0, 
  max: number = 100
): string | undefined {
  const num = parseFloat(value);
  if (isNaN(num)) return 'Geçerli bir sayı girin';
  if (num < min) return `Minimum %${min} olmalı`;
  if (num > max) return `Maksimum %${max} olmalı`;
  return undefined;
}

export function PolicyEditorCard({ portfolioId }: PolicyEditorCardProps) {
  const { 
    policy, 
    isLoading, 
    error, 
    savePolicy, 
    isSaving, 
    resetToDefault 
  } = usePolicy(portfolioId);

  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>({
    max_weight_per_stock: '',
    max_weight_per_sector: '',
    core_min_weight: '',
    core_max_weight: '',
    satellite_min_weight: '',
    satellite_max_weight: '',
    new_position_min_weight: '',
    new_position_max_weight: '',
    cash_min_percent: '',
    cash_max_percent: '',
    cash_target_percent: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize form when policy loads
  useEffect(() => {
    if (policy) {
      setFormValues({
        max_weight_per_stock: toPercent(policy.max_weight_per_stock),
        max_weight_per_sector: toPercent(policy.max_weight_per_sector),
        core_min_weight: toPercent(policy.core_min_weight),
        core_max_weight: toPercent(policy.core_max_weight),
        satellite_min_weight: toPercent(policy.satellite_min_weight),
        satellite_max_weight: toPercent(policy.satellite_max_weight),
        new_position_min_weight: toPercent(policy.new_position_min_weight),
        new_position_max_weight: toPercent(policy.new_position_max_weight),
        cash_min_percent: toPercent(policy.cash_min_percent),
        cash_max_percent: toPercent(policy.cash_max_percent),
        cash_target_percent: toPercent(policy.cash_target_percent),
      });
    }
  }, [policy]);

  const hasChanges = useMemo(() => {
    if (!policy) return false;
    return (
      fromPercent(formValues.max_weight_per_stock) !== 
        policy.max_weight_per_stock ||
      fromPercent(formValues.max_weight_per_sector) !== 
        policy.max_weight_per_sector ||
      fromPercent(formValues.core_min_weight) !== policy.core_min_weight ||
      fromPercent(formValues.core_max_weight) !== policy.core_max_weight ||
      fromPercent(formValues.satellite_min_weight) !== 
        policy.satellite_min_weight ||
      fromPercent(formValues.satellite_max_weight) !== 
        policy.satellite_max_weight ||
      fromPercent(formValues.new_position_min_weight) !== 
        policy.new_position_min_weight ||
      fromPercent(formValues.new_position_max_weight) !== 
        policy.new_position_max_weight ||
      fromPercent(formValues.cash_min_percent) !== policy.cash_min_percent ||
      fromPercent(formValues.cash_max_percent) !== policy.cash_max_percent ||
      fromPercent(formValues.cash_target_percent) !== 
        policy.cash_target_percent
    );
  }, [formValues, policy]);

  const handleInputChange = (field: keyof FormValues) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSaveSuccess(false);
      setFormValues(prev => ({
        ...prev,
        [field]: e.target.value,
      }));
      // Clear error for this field
      if (formErrors[field]) {
        setFormErrors(prev => ({
          ...prev,
          [field]: undefined,
        }));
      }
    };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // Validate each percentage field
    const fields: Array<{ 
      key: keyof FormValues; 
      min?: number; 
      max?: number 
    }> = [
      { key: 'max_weight_per_stock', min: 1, max: 50 },
      { key: 'max_weight_per_sector', min: 5, max: 100 },
      { key: 'core_min_weight', min: 0, max: 50 },
      { key: 'core_max_weight', min: 1, max: 50 },
      { key: 'satellite_min_weight', min: 0, max: 20 },
      { key: 'satellite_max_weight', min: 0.5, max: 20 },
      { key: 'new_position_min_weight', min: 0, max: 10 },
      { key: 'new_position_max_weight', min: 0.1, max: 10 },
      { key: 'cash_min_percent', min: 0, max: 50 },
      { key: 'cash_max_percent', min: 1, max: 100 },
      { key: 'cash_target_percent', min: 0, max: 100 },
    ];

    for (const { key, min, max } of fields) {
      const error = validatePercentField(formValues[key], min, max);
      if (error) {
        errors[key] = error;
      }
    }

    // Cross-field validations
    const coreMin = parseFloat(formValues.core_min_weight);
    const coreMax = parseFloat(formValues.core_max_weight);
    if (!isNaN(coreMin) && !isNaN(coreMax) && coreMin > coreMax) {
      errors.core_min_weight = 'Min değer, max değerden küçük olmalı';
    }

    const satMin = parseFloat(formValues.satellite_min_weight);
    const satMax = parseFloat(formValues.satellite_max_weight);
    if (!isNaN(satMin) && !isNaN(satMax) && satMin > satMax) {
      errors.satellite_min_weight = 'Min değer, max değerden küçük olmalı';
    }

    const newMin = parseFloat(formValues.new_position_min_weight);
    const newMax = parseFloat(formValues.new_position_max_weight);
    if (!isNaN(newMin) && !isNaN(newMax) && newMin > newMax) {
      errors.new_position_min_weight = 'Min değer, max değerden küçük olmalı';
    }

    const cashMin = parseFloat(formValues.cash_min_percent);
    const cashMax = parseFloat(formValues.cash_max_percent);
    const cashTarget = parseFloat(formValues.cash_target_percent);
    if (!isNaN(cashMin) && !isNaN(cashMax) && cashMin > cashMax) {
      errors.cash_min_percent = 'Min değer, max değerden küçük olmalı';
    }
    if (!isNaN(cashTarget) && !isNaN(cashMin) && cashTarget < cashMin) {
      errors.cash_target_percent = 'Hedef, minimum değerden büyük olmalı';
    }
    if (!isNaN(cashTarget) && !isNaN(cashMax) && cashTarget > cashMax) {
      errors.cash_target_percent = 'Hedef, maksimum değerden küçük olmalı';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const data: UpdatePortfolioPolicy = {
      max_weight_per_stock: fromPercent(formValues.max_weight_per_stock),
      max_weight_per_sector: fromPercent(formValues.max_weight_per_sector),
      core_min_weight: fromPercent(formValues.core_min_weight),
      core_max_weight: fromPercent(formValues.core_max_weight),
      satellite_min_weight: fromPercent(formValues.satellite_min_weight),
      satellite_max_weight: fromPercent(formValues.satellite_max_weight),
      new_position_min_weight: fromPercent(formValues.new_position_min_weight),
      new_position_max_weight: fromPercent(formValues.new_position_max_weight),
      cash_min_percent: fromPercent(formValues.cash_min_percent),
      cash_max_percent: fromPercent(formValues.cash_max_percent),
      cash_target_percent: fromPercent(formValues.cash_target_percent),
    };

    const success = await savePolicy(data);
    if (success) {
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setFormErrors(prev => ({
        ...prev,
        general: 'Kaydetme sırasında hata oluştu',
      }));
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    if (policy) {
      setFormValues({
        max_weight_per_stock: toPercent(policy.max_weight_per_stock),
        max_weight_per_sector: toPercent(policy.max_weight_per_sector),
        core_min_weight: toPercent(policy.core_min_weight),
        core_max_weight: toPercent(policy.core_max_weight),
        satellite_min_weight: toPercent(policy.satellite_min_weight),
        satellite_max_weight: toPercent(policy.satellite_max_weight),
        new_position_min_weight: toPercent(policy.new_position_min_weight),
        new_position_max_weight: toPercent(policy.new_position_max_weight),
        cash_min_percent: toPercent(policy.cash_min_percent),
        cash_max_percent: toPercent(policy.cash_max_percent),
        cash_target_percent: toPercent(policy.cash_target_percent),
      });
    }
    setFormErrors({});
    setIsEditing(false);
  };

  const handleResetToDefault = async () => {
    const success = await resetToDefault();
    if (success) {
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-700 rounded" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-700 rounded" />
                <div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !policy) {
    return (
      <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <Button outline className="mt-4" onClick={() => window.location.reload()}>
          Tekrar Dene
        </Button>
      </div>
    );
  }

  return (
    <div 
      className={clsx(
        'rounded-lg border bg-white dark:bg-zinc-800 p-6 transition-all',
        isEditing 
          ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20' 
          : 'border-zinc-200 dark:border-zinc-700',
        saveSuccess && 'border-green-500 dark:border-green-400'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {isEditing ? '✏️ Politika Düzenle' : '📋 Mevcut Politika'}
          </h3>
          {saveSuccess && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
              <CheckIcon className="h-4 w-4" />
              Değişiklikler kaydedildi
            </p>
          )}
        </div>
        
        {!isEditing && (
          <Button outline onClick={() => setIsEditing(true)}>
            <PencilIcon className="h-4 w-4" />
            Düzenle
          </Button>
        )}
      </div>

      {/* Form Errors */}
      {formErrors.general && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">
            {formErrors.general}
          </p>
        </div>
      )}

      {/* Policy Fields */}
      <div className="space-y-8">
        {/* Ağırlık Limitleri */}
        <Fieldset>
          <Legend>Ağırlık Limitleri</Legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <PolicyField
              label="Maks. Hisse Ağırlığı"
              description="Tek bir hissenin maksimum ağırlığı"
              value={formValues.max_weight_per_stock}
              onChange={handleInputChange('max_weight_per_stock')}
              error={formErrors.max_weight_per_stock}
              isEditing={isEditing}
              suffix="%"
            />
            <PolicyField
              label="Maks. Sektör Ağırlığı"
              description="Tek bir sektörün maksimum ağırlığı"
              value={formValues.max_weight_per_sector}
              onChange={handleInputChange('max_weight_per_sector')}
              error={formErrors.max_weight_per_sector}
              isEditing={isEditing}
              suffix="%"
            />
          </div>
        </Fieldset>

        {/* Pozisyon Kategorileri */}
        <Fieldset>
          <Legend>Pozisyon Kategorileri</Legend>
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <PolicyField
                label="Ana Pozisyon Min"
                description="Ana pozisyonların minimum ağırlığı"
                value={formValues.core_min_weight}
                onChange={handleInputChange('core_min_weight')}
                error={formErrors.core_min_weight}
                isEditing={isEditing}
                suffix="%"
              />
              <PolicyField
                label="Ana Pozisyon Max"
                description="Ana pozisyonların maksimum ağırlığı"
                value={formValues.core_max_weight}
                onChange={handleInputChange('core_max_weight')}
                error={formErrors.core_max_weight}
                isEditing={isEditing}
                suffix="%"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <PolicyField
                label="Uydu Pozisyon Min"
                description="Uydu pozisyonların minimum ağırlığı"
                value={formValues.satellite_min_weight}
                onChange={handleInputChange('satellite_min_weight')}
                error={formErrors.satellite_min_weight}
                isEditing={isEditing}
                suffix="%"
              />
              <PolicyField
                label="Uydu Pozisyon Max"
                description="Uydu pozisyonların maksimum ağırlığı"
                value={formValues.satellite_max_weight}
                onChange={handleInputChange('satellite_max_weight')}
                error={formErrors.satellite_max_weight}
                isEditing={isEditing}
                suffix="%"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <PolicyField
                label="Yeni Pozisyon Min"
                description="Yeni pozisyonların minimum ağırlığı"
                value={formValues.new_position_min_weight}
                onChange={handleInputChange('new_position_min_weight')}
                error={formErrors.new_position_min_weight}
                isEditing={isEditing}
                suffix="%"
              />
              <PolicyField
                label="Yeni Pozisyon Max"
                description="Yeni pozisyonların maksimum ağırlığı"
                value={formValues.new_position_max_weight}
                onChange={handleInputChange('new_position_max_weight')}
                error={formErrors.new_position_max_weight}
                isEditing={isEditing}
                suffix="%"
              />
            </div>
          </div>
        </Fieldset>

        {/* Nakit Politikası */}
        <Fieldset>
          <Legend>Nakit Politikası</Legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <PolicyField
              label="Min Nakit"
              description="Minimum nakit oranı"
              value={formValues.cash_min_percent}
              onChange={handleInputChange('cash_min_percent')}
              error={formErrors.cash_min_percent}
              isEditing={isEditing}
              suffix="%"
            />
            <PolicyField
              label="Hedef Nakit"
              description="Hedef nakit oranı"
              value={formValues.cash_target_percent}
              onChange={handleInputChange('cash_target_percent')}
              error={formErrors.cash_target_percent}
              isEditing={isEditing}
              suffix="%"
            />
            <PolicyField
              label="Max Nakit"
              description="Maksimum nakit oranı"
              value={formValues.cash_max_percent}
              onChange={handleInputChange('cash_max_percent')}
              error={formErrors.cash_max_percent}
              isEditing={isEditing}
              suffix="%"
            />
          </div>
        </Fieldset>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-700 flex flex-wrap items-center justify-between gap-4">
          <Button 
            plain 
            onClick={handleResetToDefault}
            disabled={isSaving}
          >
            <ArrowPathIcon className="h-4 w-4" />
            Varsayılana Dön
          </Button>
          
          <div className="flex items-center gap-3">
            <Button outline onClick={handleCancel} disabled={isSaving}>
              <XMarkIcon className="h-4 w-4" />
              İptal
            </Button>
            <Button 
              color="green" 
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4" />
                  Kaydet
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface PolicyFieldProps {
  label: string;
  description?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  isEditing: boolean;
  suffix?: string;
}

function PolicyField({
  label,
  description,
  value,
  onChange,
  error,
  isEditing,
  suffix,
}: PolicyFieldProps) {
  if (!isEditing) {
    return (
      <div>
        <dt className="text-xs text-zinc-500 dark:text-zinc-400">{label}</dt>
        <dd className="mt-1 text-lg font-semibold text-zinc-900 dark:text-white">
          {value}{suffix}
        </dd>
        {description && (
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
            {description}
          </p>
        )}
      </div>
    );
  }

  return (
    <Field>
      <Label>{label}</Label>
      {description && <Description>{description}</Description>}
      <div className="relative mt-2">
        <Input
          type="number"
          value={value}
          onChange={onChange}
          step="0.1"
          className={clsx(
            suffix && 'pr-8',
            error && 'border-red-500 dark:border-red-500'
          )}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Field>
  );
}
