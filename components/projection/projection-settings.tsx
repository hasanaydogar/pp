'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Field, Label, Description } from '@/components/ui/fieldset';
import { Switch } from '@/components/ui/switch';

interface ProjectionSettingsProps {
  monthlyInvestment: number;
  expectedReturnRate: number;
  withdrawalRate: number;
  includeDividends: boolean;
  onMonthlyInvestmentChange: (value: number) => void;
  onExpectedReturnRateChange: (value: number) => void;
  onWithdrawalRateChange: (value: number) => void;
  onIncludeDividendsChange: (value: boolean) => void;
  currency: string;
}

export function ProjectionSettings({
  monthlyInvestment,
  expectedReturnRate,
  withdrawalRate,
  includeDividends,
  onMonthlyInvestmentChange,
  onExpectedReturnRateChange,
  onWithdrawalRateChange,
  onIncludeDividendsChange,
  currency,
}: ProjectionSettingsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Field>
        <Label>Aylık Yatırım ({currency})</Label>
        <Input
          type="number"
          min="0"
          step="100"
          value={monthlyInvestment}
          onChange={(e) => onMonthlyInvestmentChange(parseFloat(e.target.value) || 0)}
        />
        <Description>Her ay eklenecek tutar</Description>
      </Field>
      
      <Field>
        <Label>Beklenen Getiri (%)</Label>
        <Input
          type="number"
          min="0"
          max="50"
          step="0.5"
          value={(expectedReturnRate * 100).toFixed(1)}
          onChange={(e) => onExpectedReturnRateChange((parseFloat(e.target.value) || 0) / 100)}
        />
        <Description>Yıllık beklenen getiri oranı</Description>
      </Field>
      
      <Field>
        <Label>Çekim Oranı (%)</Label>
        <Input
          type="number"
          min="1"
          max="10"
          step="0.1"
          value={(withdrawalRate * 100).toFixed(1)}
          onChange={(e) => onWithdrawalRateChange((parseFloat(e.target.value) || 0) / 100)}
        />
        <Description>Yıllık güvenli çekim oranı</Description>
      </Field>
      
      <Field>
        <Label>Temettü Dahil</Label>
        <div className="mt-2">
          <Switch
            checked={includeDividends}
            onChange={onIncludeDividendsChange}
          />
        </div>
        <Description>Temettüleri projeksiyona dahil et</Description>
      </Field>
    </div>
  );
}
