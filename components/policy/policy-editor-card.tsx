'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Subheading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { PolicyFormField } from './policy-form-field';
import { usePolicy } from '@/lib/hooks/use-policy';
import {
  UpdatePortfolioPolicy,
  PortfolioPolicy,
  DEFAULT_POLICY,
} from '@/lib/types/policy';
import {
  PencilIcon,
  XMarkIcon,
  CheckIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface PolicyEditorCardProps {
  portfolioId: string;
}

// ============================================================================
// VALIDATION
// ============================================================================

interface ValidationError {
  field: string;
  message: string;
}

function validatePolicy(data: UpdatePortfolioPolicy): ValidationError[] {
  const errors: ValidationError[] = [];

  // Core min < max
  if (data.core_min_weight != null && data.core_max_weight != null) {
    if (data.core_min_weight >= data.core_max_weight) {
      errors.push({
        field: 'core_min_weight',
        message: 'Min değer Max değerden küçük olmalı',
      });
    }
  }

  // Satellite min < max
  if (
    data.satellite_min_weight != null &&
    data.satellite_max_weight != null
  ) {
    if (data.satellite_min_weight >= data.satellite_max_weight) {
      errors.push({
        field: 'satellite_min_weight',
        message: 'Min değer Max değerden küçük olmalı',
      });
    }
  }

  // New position min < max
  if (
    data.new_position_min_weight != null &&
    data.new_position_max_weight != null
  ) {
    if (data.new_position_min_weight >= data.new_position_max_weight) {
      errors.push({
        field: 'new_position_min_weight',
        message: 'Min değer Max değerden küçük olmalı',
      });
    }
  }

  // Cash min < max
  if (data.cash_min_percent != null && data.cash_max_percent != null) {
    if (data.cash_min_percent >= data.cash_max_percent) {
      errors.push({
        field: 'cash_min_percent',
        message: 'Min nakit Max nakitten küçük olmalı',
      });
    }
  }

  // Cash target in range
  if (
    data.cash_target_percent != null &&
    data.cash_min_percent != null &&
    data.cash_max_percent != null
  ) {
    if (
      data.cash_target_percent < data.cash_min_percent ||
      data.cash_target_percent > data.cash_max_percent
    ) {
      errors.push({
        field: 'cash_target_percent',
        message: 'Hedef nakit Min-Max aralığında olmalı',
      });
    }
  }

  return errors;
}

// ============================================================================
// HELPERS
// ============================================================================

function formatPercent(value: number): string {
  return `%${Math.round(value * 100)}`;
}

function formatRange(min: number, max: number): string {
  return `%${Math.round(min * 100)} - %${Math.round(max * 100)}`;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function PolicySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h4
        className="text-sm font-medium text-zinc-700
          dark:text-zinc-300 border-b border-zinc-200
          dark:border-zinc-700 pb-2"
      >
        {title}
      </h4>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  );
}

function PolicyItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-zinc-900 dark:text-white">
        {value}
      </dd>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <ArrowPathIcon className="h-8 w-8 animate-spin text-zinc-400" />
      <span className="ml-2 text-zinc-500">Politika yükleniyor...</span>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div
      className="flex items-center gap-2 rounded-lg bg-red-50 p-4
        dark:bg-red-900/20"
    >
      <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      <Text className="text-red-600 dark:text-red-400">{message}</Text>
    </div>
  );
}

function SuccessMessage() {
  return (
    <div
      className="flex items-center gap-2 rounded-lg bg-green-50 p-3
        dark:bg-green-900/20"
    >
      <CheckIcon className="h-5 w-5 text-green-600" />
      <Text className="text-green-600 dark:text-green-400">
        Politika başarıyla kaydedildi
      </Text>
    </div>
  );
}

// ============================================================================
// VIEW MODE
// ============================================================================

function PolicyViewMode({
  policy,
  onEdit,
}: {
  policy: PortfolioPolicy;
  onEdit: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Subheading>Yatırım Politikaları</Subheading>
        <Button outline onClick={onEdit}>
          <PencilIcon className="h-4 w-4" />
          Düzenle
        </Button>
      </div>

      <div className="space-y-6">
        <PolicySection title="Hisse Limitleri">
          <PolicyItem
            label="Maks. Hisse Ağırlığı"
            value={formatPercent(policy.max_weight_per_stock)}
          />
          <PolicyItem
            label="Maks. Sektör Ağırlığı"
            value={formatPercent(policy.max_weight_per_sector)}
          />
        </PolicySection>

        <PolicySection title="Pozisyon Kategorileri">
          <PolicyItem
            label="Ana Pozisyon Aralığı"
            value={formatRange(policy.core_min_weight, policy.core_max_weight)}
          />
          <PolicyItem
            label="Uydu Pozisyon Aralığı"
            value={formatRange(
              policy.satellite_min_weight,
              policy.satellite_max_weight,
            )}
          />
          <PolicyItem
            label="Yeni Pozisyon Aralığı"
            value={formatRange(
              policy.new_position_min_weight,
              policy.new_position_max_weight,
            )}
          />
        </PolicySection>

        <PolicySection title="Nakit Yönetimi">
          <PolicyItem
            label="Min. Nakit"
            value={formatPercent(policy.cash_min_percent)}
          />
          <PolicyItem
            label="Hedef Nakit"
            value={formatPercent(policy.cash_target_percent)}
          />
          <PolicyItem
            label="Maks. Nakit"
            value={formatPercent(policy.cash_max_percent)}
          />
        </PolicySection>
      </div>
    </>
  );
}

// ============================================================================
// EDIT MODE
// ============================================================================

function PolicyEditMode({
  policy,
  formData,
  errors,
  isSaving,
  hasChanges,
  onFieldChange,
  onSave,
  onCancel,
  onResetToDefault,
}: {
  policy: PortfolioPolicy;
  formData: UpdatePortfolioPolicy;
  errors: ValidationError[];
  isSaving: boolean;
  hasChanges: boolean;
  onFieldChange: (name: string, value: number) => void;
  onSave: () => void;
  onCancel: () => void;
  onResetToDefault: () => void;
}) {
  const getError = (field: string) =>
    errors.find((e) => e.field === field)?.message;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Subheading>Politikaları Düzenle</Subheading>
        <div className="flex items-center gap-2">
          <Button plain onClick={onResetToDefault} disabled={isSaving}>
            <ArrowPathIcon className="h-4 w-4" />
            Varsayılana Dön
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <PolicySection title="Hisse Limitleri">
          <PolicyFormField
            name="max_weight_per_stock"
            label="Maks. Hisse Ağırlığı"
            value={formData.max_weight_per_stock ?? policy.max_weight_per_stock}
            onChange={onFieldChange}
            min={0.01}
            max={0.5}
            step={0.01}
            error={getError('max_weight_per_stock')}
            disabled={isSaving}
            description="Tek bir hissenin portföydeki maksimum ağırlığı"
          />
          <PolicyFormField
            name="max_weight_per_sector"
            label="Maks. Sektör Ağırlığı"
            value={
              formData.max_weight_per_sector ?? policy.max_weight_per_sector
            }
            onChange={onFieldChange}
            min={0.1}
            max={0.5}
            step={0.05}
            error={getError('max_weight_per_sector')}
            disabled={isSaving}
            description="Tek bir sektörün portföydeki maksimum ağırlığı"
          />
        </PolicySection>

        <PolicySection title="Ana Pozisyon (Core)">
          <PolicyFormField
            name="core_min_weight"
            label="Minimum"
            value={formData.core_min_weight ?? policy.core_min_weight}
            onChange={onFieldChange}
            min={0.01}
            max={0.3}
            step={0.01}
            error={getError('core_min_weight')}
            disabled={isSaving}
          />
          <PolicyFormField
            name="core_max_weight"
            label="Maksimum"
            value={formData.core_max_weight ?? policy.core_max_weight}
            onChange={onFieldChange}
            min={0.05}
            max={0.5}
            step={0.01}
            error={getError('core_max_weight')}
            disabled={isSaving}
          />
        </PolicySection>

        <PolicySection title="Uydu Pozisyon (Satellite)">
          <PolicyFormField
            name="satellite_min_weight"
            label="Minimum"
            value={formData.satellite_min_weight ?? policy.satellite_min_weight}
            onChange={onFieldChange}
            min={0.005}
            max={0.1}
            step={0.005}
            error={getError('satellite_min_weight')}
            disabled={isSaving}
          />
          <PolicyFormField
            name="satellite_max_weight"
            label="Maksimum"
            value={formData.satellite_max_weight ?? policy.satellite_max_weight}
            onChange={onFieldChange}
            min={0.01}
            max={0.15}
            step={0.005}
            error={getError('satellite_max_weight')}
            disabled={isSaving}
          />
        </PolicySection>

        <PolicySection title="Yeni Pozisyon">
          <PolicyFormField
            name="new_position_min_weight"
            label="Minimum"
            value={
              formData.new_position_min_weight ?? policy.new_position_min_weight
            }
            onChange={onFieldChange}
            min={0.001}
            max={0.05}
            step={0.001}
            error={getError('new_position_min_weight')}
            disabled={isSaving}
          />
          <PolicyFormField
            name="new_position_max_weight"
            label="Maksimum"
            value={
              formData.new_position_max_weight ?? policy.new_position_max_weight
            }
            onChange={onFieldChange}
            min={0.005}
            max={0.1}
            step={0.005}
            error={getError('new_position_max_weight')}
            disabled={isSaving}
          />
        </PolicySection>

        <PolicySection title="Nakit Yönetimi">
          <PolicyFormField
            name="cash_min_percent"
            label="Minimum Nakit"
            value={formData.cash_min_percent ?? policy.cash_min_percent}
            onChange={onFieldChange}
            min={0}
            max={0.2}
            step={0.01}
            error={getError('cash_min_percent')}
            disabled={isSaving}
          />
          <PolicyFormField
            name="cash_target_percent"
            label="Hedef Nakit"
            value={formData.cash_target_percent ?? policy.cash_target_percent}
            onChange={onFieldChange}
            min={0.01}
            max={0.25}
            step={0.01}
            error={getError('cash_target_percent')}
            disabled={isSaving}
          />
          <PolicyFormField
            name="cash_max_percent"
            label="Maksimum Nakit"
            value={formData.cash_max_percent ?? policy.cash_max_percent}
            onChange={onFieldChange}
            min={0.05}
            max={0.3}
            step={0.01}
            error={getError('cash_max_percent')}
            disabled={isSaving}
          />
        </PolicySection>
      </div>

      {/* Buttons */}
      <div
        className="mt-6 flex items-center justify-end gap-3 border-t
          border-zinc-200 pt-4 dark:border-zinc-700"
      >
        <Button outline onClick={onCancel} disabled={isSaving}>
          <XMarkIcon className="h-4 w-4" />
          İptal
        </Button>
        <Button
          color="green"
          onClick={onSave}
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? (
            <>
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
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
    </>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PolicyEditorCard({ portfolioId }: PolicyEditorCardProps) {
  const { policy, isLoading, error, savePolicy, isSaving, resetToDefault } =
    usePolicy(portfolioId);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdatePortfolioPolicy>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fill form with policy data when loaded
  useEffect(() => {
    if (policy) {
      setFormData({
        max_weight_per_stock: policy.max_weight_per_stock,
        core_min_weight: policy.core_min_weight,
        core_max_weight: policy.core_max_weight,
        satellite_min_weight: policy.satellite_min_weight,
        satellite_max_weight: policy.satellite_max_weight,
        new_position_min_weight: policy.new_position_min_weight,
        new_position_max_weight: policy.new_position_max_weight,
        max_weight_per_sector: policy.max_weight_per_sector,
        cash_min_percent: policy.cash_min_percent,
        cash_max_percent: policy.cash_max_percent,
        cash_target_percent: policy.cash_target_percent,
      });
    }
  }, [policy]);

  // Check if form has changes
  const hasChanges = useMemo(() => {
    if (!policy) return false;
    return Object.keys(formData).some((key) => {
      const k = key as keyof UpdatePortfolioPolicy;
      return formData[k] !== policy[k];
    });
  }, [formData, policy]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges && isEditing) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges, isEditing]);

  const handleFieldChange = useCallback((name: string, value: number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => prev.filter((e) => e.field !== name));
    setSaveError(null);
    setShowSuccess(false);
  }, []);

  const handleSave = useCallback(async () => {
    const errors = validatePolicy(formData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setSaveError(null);
    const success = await savePolicy(formData);
    if (success) {
      setShowSuccess(true);
      setIsEditing(false);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setSaveError('Politika kaydedilemedi. Lütfen tekrar deneyin.');
    }
  }, [formData, savePolicy]);

  const handleCancel = useCallback(() => {
    if (policy) {
      setFormData({
        max_weight_per_stock: policy.max_weight_per_stock,
        core_min_weight: policy.core_min_weight,
        core_max_weight: policy.core_max_weight,
        satellite_min_weight: policy.satellite_min_weight,
        satellite_max_weight: policy.satellite_max_weight,
        new_position_min_weight: policy.new_position_min_weight,
        new_position_max_weight: policy.new_position_max_weight,
        max_weight_per_sector: policy.max_weight_per_sector,
        cash_min_percent: policy.cash_min_percent,
        cash_max_percent: policy.cash_max_percent,
        cash_target_percent: policy.cash_target_percent,
      });
    }
    setValidationErrors([]);
    setSaveError(null);
    setIsEditing(false);
  }, [policy]);

  const handleResetToDefault = useCallback(async () => {
    if (
      !confirm('Tüm politika değerleri varsayılana sıfırlanacak. Emin misiniz?')
    ) {
      return;
    }

    const success = await resetToDefault();
    if (success) {
      setFormData(DEFAULT_POLICY);
      setShowSuccess(true);
      setIsEditing(false);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setSaveError('Varsayılan değerler yüklenemedi.');
    }
  }, [resetToDefault]);

  return (
    <div
      className="rounded-lg border border-zinc-200 bg-white p-6
        dark:border-zinc-700 dark:bg-zinc-800"
    >
      {isLoading && <LoadingState />}

      {error && <ErrorState message={error} />}

      {showSuccess && <SuccessMessage />}

      {saveError && <ErrorState message={saveError} />}

      {!isLoading && !error && policy && (
        <>
          {isEditing ? (
            <PolicyEditMode
              policy={policy}
              formData={formData}
              errors={validationErrors}
              isSaving={isSaving}
              hasChanges={hasChanges}
              onFieldChange={handleFieldChange}
              onSave={handleSave}
              onCancel={handleCancel}
              onResetToDefault={handleResetToDefault}
            />
          ) : (
            <PolicyViewMode policy={policy} onEdit={() => setIsEditing(true)} />
          )}
        </>
      )}
    </div>
  );
}
