'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, Label } from '@/components/ui/fieldset';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/utils/currency';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface PendingDividend {
  id: string;
  assetId: string;
  symbol: string;
  grossAmount: number;
  taxAmount: number;
  netAmount: number;
  currency: string;
  paymentDate: string;
  daysOverdue: number;
  notes?: string;
}

interface ConfirmDividendDialogProps {
  isOpen: boolean;
  onClose: () => void;
  dividend: PendingDividend | null;
  onConfirm: (data: {
    dividend_id: string;
    actual_gross_amount: number;
    actual_tax_amount: number;
    actual_payment_date?: string;
    notes?: string;
  }) => Promise<void>;
  onDismiss: (dividendId: string) => Promise<void>;
}

export function ConfirmDividendDialog({
  isOpen,
  onClose,
  dividend,
  onConfirm,
  onDismiss,
}: ConfirmDividendDialogProps) {
  const [grossAmount, setGrossAmount] = useState('');
  const [taxRate, setTaxRate] = useState('15');
  const [paymentDate, setPaymentDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize with forecast values when dialog opens
  useEffect(() => {
    if (dividend && isOpen) {
      setGrossAmount(dividend.grossAmount.toString());
      // Calculate tax rate from forecast
      const forecastTaxRate = dividend.grossAmount > 0 
        ? (dividend.taxAmount / dividend.grossAmount) * 100 
        : 15;
      setTaxRate(forecastTaxRate.toFixed(1));
      setPaymentDate(dividend.paymentDate);
      setNotes(dividend.notes || '');
      setError(null);
    }
  }, [dividend, isOpen]);

  if (!dividend) return null;

  const gross = parseFloat(grossAmount) || 0;
  const taxRateNum = parseFloat(taxRate) / 100 || 0;
  const taxAmount = gross * taxRateNum;
  const netAmount = gross - taxAmount;

  // Compare with forecast
  const difference = gross - dividend.grossAmount;
  const differencePercent = dividend.grossAmount > 0 
    ? (difference / dividend.grossAmount) * 100 
    : 0;

  const handleConfirm = async () => {
    setError(null);
    setLoading(true);

    try {
      if (gross <= 0) {
        throw new Error('Geçerli bir tutar giriniz');
      }

      await onConfirm({
        dividend_id: dividend.id,
        actual_gross_amount: gross,
        actual_tax_amount: taxAmount,
        actual_payment_date: paymentDate,
        notes: notes || undefined,
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async () => {
    if (!confirm(`${dividend.symbol} temettü beklentisini iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    setDismissing(true);
    try {
      await onDismiss(dividend.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setDismissing(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} size="lg">
      <DialogTitle className="flex items-center gap-2">
        <ExclamationTriangleIcon className="h-6 w-6 text-amber-500" />
        Temettü Onayı Bekliyor
      </DialogTitle>
      <DialogDescription>
        <span className="font-semibold text-zinc-900 dark:text-white">{dividend.symbol}</span> için 
        {' '}<span className="font-medium">{new Date(dividend.paymentDate).toLocaleDateString('tr-TR')}</span> 
        {' '}tarihli temettü beklentisi vadesi doldu.
        {dividend.daysOverdue > 0 && (
          <span className="text-amber-600 dark:text-amber-400">
            {' '}({dividend.daysOverdue} gün geçti)
          </span>
        )}
      </DialogDescription>

      <DialogBody className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Forecast Summary */}
        <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800 p-4">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
            Beklenti (Tahmin)
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-zinc-500 dark:text-zinc-400">Brüt</div>
              <div className="font-semibold">{formatCurrency(dividend.grossAmount, dividend.currency)}</div>
            </div>
            <div>
              <div className="text-zinc-500 dark:text-zinc-400">Stopaj</div>
              <div className="font-semibold text-red-600">-{formatCurrency(dividend.taxAmount, dividend.currency)}</div>
            </div>
            <div>
              <div className="text-zinc-500 dark:text-zinc-400">Net</div>
              <div className="font-semibold text-green-600">{formatCurrency(dividend.netAmount, dividend.currency)}</div>
            </div>
          </div>
        </div>

        {/* Actual Amount Input */}
        <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
          <div className="text-sm font-medium mb-3">Gerçekleşen Tutar</div>
          
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <Label>Brüt Tutar ({dividend.currency})</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={grossAmount}
                onChange={(e) => setGrossAmount(e.target.value)}
                placeholder="0.00"
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

          <Field className="mt-4">
            <Label>Ödeme Tarihi</Label>
            <Input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </Field>
        </div>

        {/* Comparison */}
        {gross > 0 && (
          <div className={clsx(
            'rounded-lg p-4',
            Math.abs(differencePercent) < 5 
              ? 'bg-green-50 dark:bg-green-900/20'
              : 'bg-amber-50 dark:bg-amber-900/20'
          )}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Hesaplanan Net Tutar</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(netAmount, dividend.currency)}
                </div>
              </div>
              
              {difference !== 0 && (
                <div className={clsx(
                  'text-right',
                  difference > 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  <div className="text-sm">Fark</div>
                  <div className="font-semibold">
                    {difference > 0 ? '+' : ''}{formatCurrency(difference, dividend.currency)}
                  </div>
                  <div className="text-xs">
                    ({differencePercent > 0 ? '+' : ''}{differencePercent.toFixed(1)}%)
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <Field>
          <Label>Not (Opsiyonel)</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ek bilgi..."
            rows={2}
          />
        </Field>
      </DialogBody>

      <DialogActions className="flex justify-between">
        <Button
          plain
          onClick={handleDismiss}
          disabled={loading || dismissing}
          className="text-red-600 hover:text-red-700"
        >
          <XCircleIcon className="h-5 w-5 mr-1" />
          {dismissing ? 'İptal Ediliyor...' : 'Temettü Gelmedi'}
        </Button>
        
        <div className="flex gap-2">
          <Button plain onClick={onClose} disabled={loading || dismissing}>
            Sonra
          </Button>
          <Button
            color="green"
            onClick={handleConfirm}
            disabled={loading || dismissing || gross <= 0}
          >
            <CheckCircleIcon className="h-5 w-5 mr-1" />
            {loading ? 'Onaylanıyor...' : 'Temettüyü Onayla'}
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
}
