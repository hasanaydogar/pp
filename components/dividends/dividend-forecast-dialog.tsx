'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Field, Label } from '@/components/ui/fieldset';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/utils/currency';
import { DEFAULT_DIVIDEND_TAX_RATE, calculateTaxAmount, calculateNetDividend } from '@/lib/types/dividend';

interface Asset {
  id: string;
  symbol: string;
  quantity?: number;
}

interface DividendForecastDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    asset_id: string;
    per_share_amount: number;
    expected_payment_date: string;
    tax_rate: number;
    notes?: string;
  }) => Promise<void>;
  assets: Asset[];
  currency: string;
}

export function DividendForecastDialog({
  isOpen,
  onClose,
  onSubmit,
  assets,
  currency,
}: DividendForecastDialogProps) {
  const [assetId, setAssetId] = useState('');
  const [perShareAmount, setPerShareAmount] = useState('');
  const [taxRate, setTaxRate] = useState((DEFAULT_DIVIDEND_TAX_RATE * 100).toString());
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get selected asset's quantity
  const selectedAsset = assets.find(a => a.id === assetId);
  const assetQuantity = selectedAsset?.quantity || 0;

  // Calculate expected total with tax
  const perShare = parseFloat(perShareAmount) || 0;
  const taxRateNum = parseFloat(taxRate) / 100 || 0;
  const expectedTotalGross = perShare * assetQuantity;
  const taxAmount = calculateTaxAmount(expectedTotalGross, taxRateNum);
  const expectedTotalNet = calculateNetDividend(expectedTotalGross, taxRateNum);

  // Set default asset and date
  useEffect(() => {
    if (assets.length > 0 && !assetId) {
      setAssetId(assets[0].id);
    }
    if (!expectedDate) {
      // Default to 30 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 30);
      setExpectedDate(defaultDate.toISOString().split('T')[0]);
    }
  }, [assets, assetId, expectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!assetId) {
        throw new Error('Varlık seçiniz');
      }
      if (perShare <= 0) {
        throw new Error('Geçerli bir tutar giriniz');
      }
      if (!expectedDate) {
        throw new Error('Beklenen tarih giriniz');
      }
      if (assetQuantity <= 0) {
        throw new Error('Bu varlığın miktarı 0, beklenti eklenemez');
      }

      await onSubmit({
        asset_id: assetId,
        per_share_amount: perShare,
        expected_payment_date: expectedDate,
        tax_rate: taxRateNum,
        notes: notes || undefined,
      });

      // Reset form
      setPerShareAmount('');
      setTaxRate((DEFAULT_DIVIDEND_TAX_RATE * 100).toString());
      setExpectedDate('');
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
      <DialogTitle>📅 Temettü Beklentisi Ekle</DialogTitle>
      <DialogDescription>
        Gelecekte beklediğiniz temettüyü ekleyin. Takvimde görünecektir.
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
                  {asset.symbol} {asset.quantity ? `(${asset.quantity} adet)` : ''}
                </option>
              ))}
            </Select>
          </Field>

          {/* Show selected asset info */}
          {selectedAsset && assetQuantity > 0 && (
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 text-sm">
              <span className="text-blue-700 dark:text-blue-300">
                Portföyde {assetQuantity.toLocaleString('tr-TR')} adet {selectedAsset.symbol} bulunuyor
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <Label>Hisse Başı Brüt ({currency})</Label>
              <Input
                type="number"
                step="0.0001"
                min="0"
                value={perShareAmount}
                onChange={(e) => setPerShareAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </Field>
            
            <Field>
              <Label>Stopaj (%)</Label>
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
          
          <Field>
            <Label>Beklenen Ödeme Tarihi</Label>
            <Input
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </Field>
          
          {/* Expected total preview */}
          {perShare > 0 && assetQuantity > 0 && (
            <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800 p-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">Hesaplama:</span>
                <span>{formatCurrency(perShare, currency)} × {assetQuantity.toLocaleString('tr-TR')} adet</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">Brüt Toplam:</span>
                <span>{formatCurrency(expectedTotalGross, currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">Stopaj ({taxRate}%):</span>
                <span className="text-red-600 dark:text-red-400">-{formatCurrency(taxAmount, currency)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-zinc-200 dark:border-zinc-700 pt-2 mt-2">
                <span>Tahmini Net:</span>
                <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(expectedTotalNet, currency)}</span>
              </div>
            </div>
          )}
          
          <Field>
            <Label>Not (Opsiyonel)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Kaynak, tahmin gerekçesi..."
              rows={2}
            />
          </Field>
        </DialogBody>
        
        <DialogActions>
          <Button plain onClick={onClose} disabled={loading}>
            İptal
          </Button>
          <Button type="submit" color="blue" disabled={loading}>
            {loading ? 'Ekleniyor...' : 'Beklenti Ekle'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
