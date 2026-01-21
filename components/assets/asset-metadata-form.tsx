'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Field, FieldGroup, Label, Description } from '@/components/ui/fieldset';
import { Dialog, DialogTitle, DialogBody, DialogActions } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { AssetMetadata, Sector, PositionCategory, PositionCategoryLabels } from '@/lib/types/sector';
import { SectorBadge } from './sector-badge';
import { CategoryBadge } from './category-badge';

interface AssetMetadataFormProps {
  assetId: string;
  open: boolean;
  onClose: () => void;
  onSave?: (metadata: AssetMetadata) => void;
}

export function AssetMetadataForm({ assetId, open, onClose, onSave }: AssetMetadataFormProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [metadata, setMetadata] = useState<AssetMetadata | null>(null);
  const [sectors, setSectors] = useState<Sector[]>([]);

  // Form state
  const [manualSectorId, setManualSectorId] = useState<string>('');
  const [manualCategory, setManualCategory] = useState<string>('');
  const [manualName, setManualName] = useState<string>('');
  const [isin, setIsin] = useState<string>('');
  const [exchange, setExchange] = useState<string>('');
  const [country, setCountry] = useState<string>('');

  // Fetch metadata and sectors
  useEffect(() => {
    if (!open || !assetId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [metadataRes, sectorsRes] = await Promise.all([
          fetch(`/api/assets/${assetId}/metadata`),
          fetch('/api/sectors'),
        ]);

        if (!metadataRes.ok) {
          throw new Error('Failed to fetch metadata');
        }

        const metadataData = await metadataRes.json();
        const sectorsData = await sectorsRes.json();

        setMetadata(metadataData);
        setSectors(sectorsData || []);

        // Initialize form
        setManualSectorId(metadataData.manual_sector_id || '');
        setManualCategory(metadataData.manual_category || '');
        setManualName(metadataData.manual_name || '');
        setIsin(metadataData.isin || '');
        setExchange(metadataData.exchange || '');
        setCountry(metadataData.country || '');
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Veriler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, assetId]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/assets/${assetId}/metadata`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manual_sector_id: manualSectorId || null,
          manual_category: manualCategory || null,
          manual_name: manualName || null,
          isin: isin || null,
          exchange: exchange || null,
          country: country || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save metadata');
      }

      const savedMetadata = await response.json();
      onSave?.(savedMetadata);
      onClose();
    } catch (err) {
      console.error('Error saving metadata:', err);
      setError('Kaydedilirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setManualSectorId('');
    setManualCategory('');
    setManualName('');
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Varlık Metadata Düzenleme</DialogTitle>
      <DialogBody>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <ErrorMessage error={error} />
        ) : (
          <FieldGroup>
            {/* Current Auto Values */}
            {metadata && (metadata.api_sector || metadata.auto_category) && (
              <div className="mb-4 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
                <p className="mb-2 text-sm font-medium text-zinc-500">Otomatik Değerler</p>
                <div className="flex flex-wrap items-center gap-2">
                  {metadata.api_sector && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-zinc-500">Sektör:</span>
                      <SectorBadge sector={metadata.sector} apiSector={metadata.api_sector} />
                    </div>
                  )}
                  {metadata.auto_category && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-zinc-500">Kategori:</span>
                      <CategoryBadge category={metadata.auto_category} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Manual Sector Override */}
            <Field>
              <Label>Manuel Sektör</Label>
              <Description>Otomatik sektörü geçersiz kılmak için seçin</Description>
              <Select
                value={manualSectorId}
                onChange={(e) => setManualSectorId(e.target.value)}
              >
                <option value="">Otomatik (API'den)</option>
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.display_name}
                  </option>
                ))}
              </Select>
            </Field>

            {/* Manual Category Override */}
            <Field>
              <Label>Manuel Kategori</Label>
              <Description>Pozisyon kategorisini manuel olarak belirleyin</Description>
              <Select
                value={manualCategory}
                onChange={(e) => setManualCategory(e.target.value)}
              >
                <option value="">Otomatik (Ağırlığa göre)</option>
                {Object.entries(PositionCategoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>

            {/* Manual Name */}
            <Field>
              <Label>Manuel İsim</Label>
              <Description>Varlık için özel bir isim belirleyin</Description>
              <Input
                type="text"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="Örn: Apple Inc."
              />
            </Field>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <Label>ISIN</Label>
                <Input
                  type="text"
                  value={isin}
                  onChange={(e) => setIsin(e.target.value)}
                  placeholder="Örn: US0378331005"
                />
              </Field>

              <Field>
                <Label>Borsa</Label>
                <Input
                  type="text"
                  value={exchange}
                  onChange={(e) => setExchange(e.target.value)}
                  placeholder="Örn: NASDAQ"
                />
              </Field>
            </div>

            <Field>
              <Label>Ülke</Label>
              <Input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Örn: USA"
              />
            </Field>
          </FieldGroup>
        )}
      </DialogBody>
      <DialogActions>
        <Button plain onClick={handleReset} disabled={saving}>
          Sıfırla
        </Button>
        <div className="flex-1" />
        <Button plain onClick={onClose} disabled={saving}>
          İptal
        </Button>
        <Button onClick={handleSave} disabled={loading || saving}>
          {saving ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Kaydediliyor...
            </>
          ) : (
            'Kaydet'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
