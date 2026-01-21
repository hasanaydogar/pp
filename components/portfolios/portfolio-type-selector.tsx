'use client';

import { useState, useEffect } from 'react';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Dialog, DialogTitle, DialogBody, DialogActions } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Field, Label, Description } from '@/components/ui/fieldset';
import { PortfolioType } from '@/lib/types/policy';
import { PlusIcon } from '@heroicons/react/20/solid';

interface PortfolioTypeSelectorProps {
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

// Predefined icons for portfolio types
const TYPE_ICONS = [
  { value: '📈', label: 'Büyüme' },
  { value: '💰', label: 'Gelir' },
  { value: '🎯', label: 'Hedef' },
  { value: '🏦', label: 'Banka' },
  { value: '🌍', label: 'Global' },
  { value: '🇹🇷', label: 'Türkiye' },
  { value: '🇺🇸', label: 'ABD' },
  { value: '📊', label: 'Endeks' },
  { value: '💎', label: 'Değerli' },
  { value: '🚀', label: 'Agresif' },
  { value: '🛡️', label: 'Savunma' },
  { value: '🎓', label: 'Eğitim' },
  { value: '🏠', label: 'Konut' },
  { value: '👴', label: 'Emeklilik' },
];

// Predefined colors
const TYPE_COLORS = [
  { value: '#3B82F6', label: 'Mavi' },
  { value: '#10B981', label: 'Yeşil' },
  { value: '#F59E0B', label: 'Turuncu' },
  { value: '#EF4444', label: 'Kırmızı' },
  { value: '#8B5CF6', label: 'Mor' },
  { value: '#EC4899', label: 'Pembe' },
  { value: '#6B7280', label: 'Gri' },
];

export function PortfolioTypeSelector({ value, onChange, disabled }: PortfolioTypeSelectorProps) {
  const [types, setTypes] = useState<PortfolioType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch portfolio types
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await fetch('/api/portfolio-types');
        if (response.ok) {
          const data = await response.json();
          setTypes(data || []);
        }
      } catch (err) {
        console.error('Error fetching portfolio types:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTypes();
  }, []);

  const handleTypeCreated = (newType: PortfolioType) => {
    setTypes((prev) => [...prev, newType]);
    onChange(newType.id);
    setShowCreateDialog(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Spinner size="sm" />
        <span className="text-sm text-zinc-500">Yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={disabled}
        className="flex-1"
      >
        <option value="">Tür seçin (opsiyonel)</option>
        {types.map((type) => (
          <option key={type.id} value={type.id}>
            {type.icon && `${type.icon} `}{type.display_name}
          </option>
        ))}
      </Select>
      <Button
        plain
        onClick={() => setShowCreateDialog(true)}
        disabled={disabled}
        title="Yeni tür oluştur"
      >
        <PlusIcon className="h-5 w-5" />
      </Button>

      <CreateTypeDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreated={handleTypeCreated}
      />
    </div>
  );
}

interface CreateTypeDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (type: PortfolioType) => void;
}

function CreateTypeDialog({ open, onClose, onCreated }: CreateTypeDialogProps) {
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [icon, setIcon] = useState('📈');
  const [color, setColor] = useState('#3B82F6');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim() || !displayName.trim()) {
      setError('Ad ve görünen ad zorunludur');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/portfolio-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim().toLowerCase().replace(/\s+/g, '_'),
          display_name: displayName.trim(),
          icon,
          color,
        }),
      });

      if (!response.ok) {
        throw new Error('Oluşturma başarısız');
      }

      const newType = await response.json();
      onCreated(newType);

      // Reset form
      setName('');
      setDisplayName('');
      setIcon('📈');
      setColor('#3B82F6');
    } catch (err) {
      console.error('Error creating portfolio type:', err);
      setError('Oluşturulurken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Yeni Portföy Türü</DialogTitle>
      <DialogBody>
        <div className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <Field>
            <Label>Görünen Ad</Label>
            <Description>Kullanıcıya gösterilecek ad</Description>
            <Input
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                // Auto-generate name from display name
                if (!name || name === displayName.toLowerCase().replace(/\s+/g, '_')) {
                  setName(e.target.value.toLowerCase().replace(/\s+/g, '_'));
                }
              }}
              placeholder="Örn: Uzun Vadeli Yatırım"
            />
          </Field>

          <Field>
            <Label>Sistem Adı</Label>
            <Description>URL'lerde kullanılacak kısa ad (küçük harf)</Description>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
              placeholder="Örn: uzun_vadeli"
            />
          </Field>

          <Field>
            <Label>İkon</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {TYPE_ICONS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setIcon(item.value)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg border text-xl transition-colors ${
                    icon === item.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700'
                  }`}
                  title={item.label}
                >
                  {item.value}
                </button>
              ))}
            </div>
          </Field>

          <Field>
            <Label>Renk</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {TYPE_COLORS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setColor(item.value)}
                  className={`h-8 w-8 rounded-full border-2 transition-transform ${
                    color === item.value
                      ? 'scale-110 border-zinc-900 dark:border-white'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: item.value }}
                  title={item.label}
                />
              ))}
            </div>
          </Field>

          {/* Preview */}
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <p className="text-xs text-zinc-500 mb-2">Önizleme</p>
            <div className="flex items-center gap-2">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-lg"
                style={{ backgroundColor: color }}
              >
                {icon}
              </span>
              <span className="font-medium text-zinc-900 dark:text-white">
                {displayName || 'Tür Adı'}
              </span>
            </div>
          </div>
        </div>
      </DialogBody>
      <DialogActions>
        <Button plain onClick={onClose} disabled={saving}>
          İptal
        </Button>
        <Button onClick={handleSave} disabled={saving || !name.trim() || !displayName.trim()}>
          {saving ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Oluşturuluyor...
            </>
          ) : (
            'Oluştur'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
