'use client';

import React, { useState } from 'react';
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Field, Label } from '@/components/ui/fieldset';
import { Textarea } from '@/components/ui/textarea';
import { CashTransactionType, getCashTransactionLabel } from '@/lib/types/cash';

interface CashTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: CashTransactionType;
    amount: number;
    date: string;
    notes?: string;
  }) => Promise<void>;
  currency: string;
}

const TRANSACTION_TYPES = [
  CashTransactionType.DEPOSIT,
  CashTransactionType.WITHDRAW,
  CashTransactionType.INTEREST,
  CashTransactionType.FEE,
  CashTransactionType.TRANSFER_IN,
  CashTransactionType.TRANSFER_OUT,
];

export function CashTransactionDialog({
  isOpen,
  onClose,
  onSubmit,
  currency,
}: CashTransactionDialogProps) {
  const [type, setType] = useState<CashTransactionType>(CashTransactionType.DEPOSIT);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Geçerli bir tutar giriniz');
      }

      await onSubmit({
        type,
        amount: amountNum,
        date: new Date(date).toISOString(),
        notes: notes || undefined,
      });

      // Reset form
      setType(CashTransactionType.DEPOSIT);
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
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
      <DialogTitle>Nakit Hareketi Ekle</DialogTitle>
      <DialogDescription>
        Portföyünüze nakit hareketi ekleyin.
      </DialogDescription>
      
      <form onSubmit={handleSubmit}>
        <DialogBody className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}
          
          <Field>
            <Label>İşlem Tipi</Label>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as CashTransactionType)}
            >
              {TRANSACTION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {getCashTransactionLabel(t)}
                </option>
              ))}
            </Select>
          </Field>
          
          <Field>
            <Label>Tutar ({currency})</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </Field>
          
          <Field>
            <Label>Tarih</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </Field>
          
          <Field>
            <Label>Not (Opsiyonel)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="İşlem hakkında not..."
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
