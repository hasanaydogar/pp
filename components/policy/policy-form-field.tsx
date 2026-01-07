'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

interface PolicyFormFieldProps {
  name: string;
  label: string;
  value: number; // 0-1 arası (DB formatı)
  onChange: (name: string, value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
  disabled?: boolean;
  description?: string;
}

export function PolicyFormField({
  name,
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  error,
  disabled = false,
  description,
}: PolicyFormFieldProps) {
  // DB'de 0-1 formatı, UI'da 0-100 (yüzde) olarak göster
  const displayValue = Math.round(value * 100 * 100) / 100; // 2 decimal

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = parseFloat(e.target.value);
    if (isNaN(inputValue)) return;
    // UI'dan gelen 0-100 değerini 0-1'e çevir
    const dbValue = inputValue / 100;
    onChange(name, dbValue);
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      <div className="relative">
        <Input
          type="number"
          value={displayValue}
          onChange={handleChange}
          min={min * 100}
          max={max * 100}
          step={step * 100}
          disabled={disabled}
          className={`pr-8 ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
        />
        <span
          className="pointer-events-none absolute inset-y-0 right-0 flex
            items-center pr-3 text-zinc-500"
        >
          %
        </span>
      </div>
      {description && !error && (
        <Text className="text-xs text-zinc-500">{description}</Text>
      )}
      {error && <Text className="text-xs text-red-500">{error}</Text>}
    </div>
  );
}
