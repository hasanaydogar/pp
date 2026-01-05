'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Field, Label } from '@/components/ui/fieldset';
import { Textarea } from '@/components/ui/textarea';
import { 
  ReinvestStrategy, 
  ReinvestStrategyLabels, 
  DEFAULT_DIVIDEND_TAX_RATE,
  calculateTaxAmount,
  calculateNetDividend 
} from '@/lib/types/dividend';
import { formatCurrency } from '@/lib/utils/currency';

interface Asset {
  id: string;
  symbol: string;
}

interface DividendDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    asset_id: string;
    gross_amount: number;
    tax_amount: number;
    payment_date: string;
    reinvest_strategy: ReinvestStrategy;
    notes?: string;
  }) => Promise<void>;
  assets: Asset[];
  currency: string;
}

export function DividendDialog({
  isOpen,
  onClose,
  onSubmit,
  assets,
  currency,
}: DividendDialogProps) {
  const [assetId, setAssetId] = useState('');
  const [grossAmount, setGrossAmount] = useState('');
  const [taxRate, setTaxRate] = useState((DEFAULT_DIVIDEND_TAX_RATE * 100).toString());
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [reinvestStrategy, setReinvestStrategy] = useState<ReinvestStrategy>(ReinvestStrategy.CASH);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate net amount
  const grossNum = parseFloat(grossAmount) || 0;
  const taxRateNum = parseFloat(taxRate) / 100 || 0;
  const taxAmount = calculateTaxAmount(grossNum, taxRateNum);
  const netAmount = calculateNetDividend(grossNum, taxRateNum);

  // Set default asset
  useEffect(() => {
    if (assets.length > 0 && !assetId) {
      setAssetId(assets[0].id);
    }
  }, [assets, assetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!assetId) {
        throw new Error('Varlık seçiniz');
      }
      if (grossNum <= 0) {
        throw new Error('Geçerli bir tutar giriniz');
      }

      await onSubmit({
        asset_id: assetId,
        gross_amount: grossNum,
        tax_amount: taxAmount,
        payment_date: paymentDate,
        reinvest_strategy: reinvestStrategy,
        notes: notes || undefined,
      });

      // Reset form
      setGrossAmount('');
      setTaxRate((DEFAULT_DIVIDEND_TAX_RATE * 100).toString());
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setReinvestStrategy(ReinvestStrategy.CASH);
      setNotes('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Temettü Kaydet</DialogTitle>
      <DialogDescription>
        Aldığınız temettüyü kaydedin.
      </DialogDescription>
      
      <form onSubmit={handleSubmit}>
        <DialogBody className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}
          
          <Field>
            <Label>Varlık</Label>
            <Select
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              required
            >
              <option value="">Varlık seçin...</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.symbol}
                </option>
              ))}
            </Select>
          </Field>
          
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <Label>Brüt Tutar ({currency})</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={grossAmount}
                onChange={(e) => setGrossAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </Field>
            
            <Field>
              <Label>Stopaj Oranı (%)</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
              />
            </Field>
          </div>
          
          {/* Net amount preview */}
          {grossNum > 0 && (
            <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800 p-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">Brüt:</span>
                <span>{formatCurrency(grossNum, currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">Stopaj ({taxRate}%):</span>
                <span className="text-red-600 dark:text-red-400">-{formatCurrency(taxAmount, currency)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-zinc-200 dark:border-zinc-700 pt-2 mt-2">
                <span>Net:</span>
                <span className="text-green-600 dark:text-green-400">{formatCurrency(netAmount, currency)}</span>
              </div>
            </div>
          )}
          
          <Field>
            <Label>Ödeme Tarihi</Label>
            <Input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
            />
          </Field>
          
          <Field>
            <Label>Temettü Stratejisi</Label>
            <Select
              value={reinvestStrategy}
              onChange={(e) => setReinvestStrategy(e.target.value as ReinvestStrategy)}
            >
              {Object.entries(ReinvestStrategyLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          
          <Field>
            <Label>Not (Opsiyonel)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Temettü hakkında not..."
              rows={2}
            />
          </Field>
        </DialogBody>
        
        <DialogActions>
          <Button plain onClick={onClose} disabled={loading}>
            İptal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
