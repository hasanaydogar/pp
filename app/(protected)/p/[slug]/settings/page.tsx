'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldGroup, Label, Description } from '@/components/ui/fieldset';
import { Spinner } from '@/components/ui/spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { PolicyEditorCard } from '@/components/portfolio/policy-editor-card';
import { usePortfolio } from '@/lib/context/portfolio-context';
import { useLastVisitedPortfolio } from '@/lib/hooks/use-last-visited-portfolio';
import { ArrowLeftIcon, CheckIcon, PlusIcon, XMarkIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';

interface SettingsPageProps {
  params: Promise<{ slug: string }>;
}

export default function PortfolioSettingsPage({ params }: SettingsPageProps) {
  useLastVisitedPortfolio();

  const router = useRouter();
  const { setActivePortfolioId } = usePortfolio();

  const [slug, setSlug] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [description, setDescription] = useState('');
  const [baseCurrency, setBaseCurrency] = useState('TRY');
  const [benchmarkSymbol, setBenchmarkSymbol] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [portfolioTypeId, setPortfolioTypeId] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Portfolio types
  const [portfolioTypes, setPortfolioTypes] = useState<any[]>([]);

  // New type creation state
  const [showNewTypeInput, setShowNewTypeInput] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeIcon, setNewTypeIcon] = useState('');
  const [creatingType, setCreatingType] = useState(false);
  const newTypeInputRef = useRef<HTMLInputElement>(null);

  // Fetch portfolio types
  const fetchPortfolioTypes = () => {
    fetch('/api/portfolio-types')
      .then(res => res.json())
      .then(data => setPortfolioTypes(data || []))
      .catch(err => console.error('Error fetching portfolio types:', err));
  };

  useEffect(() => {
    fetchPortfolioTypes();
  }, []);

  // Focus input when showing new type form
  useEffect(() => {
    if (showNewTypeInput && newTypeInputRef.current) {
      newTypeInputRef.current.focus();
    }
  }, [showNewTypeInput]);

  // Create new portfolio type
  const handleCreateType = async () => {
    if (!newTypeName.trim()) return;

    setCreatingType(true);
    try {
      const response = await fetch('/api/portfolio-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTypeName.trim().toLowerCase().replace(/\s+/g, '_'),
          display_name: newTypeName.trim(),
          icon: newTypeIcon.trim() || null,
        }),
      });

      if (response.ok) {
        const newType = await response.json();
        fetchPortfolioTypes();
        setPortfolioTypeId(newType.id);
        setNewTypeName('');
        setNewTypeIcon('');
        setShowNewTypeInput(false);
      }
    } catch (err) {
      console.error('Error creating portfolio type:', err);
    } finally {
      setCreatingType(false);
    }
  };

  // Get params
  useEffect(() => {
    params.then(({ slug }) => {
      setSlug(slug);
    });
  }, [params]);

  // Fetch portfolio
  useEffect(() => {
    if (!slug) return;

    const fetchPortfolio = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/portfolios/by-slug/${slug}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Portfolio bulunamadı');
          } else {
            setError('Portfolio yüklenemedi');
          }
          return;
        }

        const result = await response.json();
        const data = result.data || result; // Handle both { data: ... } and direct response
        setPortfolio(data);
        setActivePortfolioId(data.id);

        // Initialize form
        setName(data.name || '');
        setCustomSlug(data.slug || '');
        setDescription(data.description || '');
        setBaseCurrency(data.base_currency || 'TRY');
        setBenchmarkSymbol(data.benchmark_symbol || '');
        setTargetValue(data.target_value ? String(data.target_value) : '');
        setPortfolioTypeId(data.portfolio_type_id || '');
      } catch (err) {
        console.error('Error fetching portfolio:', err);
        setError('Portfolio yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [slug, setActivePortfolioId]);

  const handleSaveGeneral = async () => {
    if (!portfolio) return;

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const response = await fetch(`/api/portfolios/${portfolio.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug: customSlug || null,
          description: description || null,
          base_currency: baseCurrency,
          benchmark_symbol: benchmarkSymbol || null,
          target_value: targetValue ? parseFloat(targetValue) : null,
          portfolio_type_id: portfolioTypeId || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Kaydetme başarısız');
      }

      const updatedPortfolio = await response.json();
      setPortfolio(updatedPortfolio);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      // If slug changed, redirect
      if (updatedPortfolio.slug && updatedPortfolio.slug !== slug) {
        router.replace(`/p/${updatedPortfolio.slug}/settings`);
      }
    } catch (err) {
      console.error('Error saving portfolio:', err);
      setSaveError('Kaydedilirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (!slug) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <Heading level={1}>Portföy Ayarları</Heading>
        <ErrorMessage error={error} />
        <Link href="/portfolios">
          <Button>Portföylere Dön</Button>
        </Link>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="space-y-8">
        <Heading level={1}>Portföy Bulunamadı</Heading>
        <Text>Aradığınız portföy bulunamadı.</Text>
        <Link href="/portfolios">
          <Button>Portföylere Dön</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/p/${slug}`}>
          <Button plain>
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <Heading level={1}>Portföy Ayarları</Heading>
          <Text className="mt-1 text-zinc-600 dark:text-zinc-400">{portfolio.name}</Text>
        </div>
      </div>

      {/* General Settings */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">
          Genel Bilgiler
        </h2>

        <FieldGroup>
          <Field>
            <Label>Portföy Adı</Label>
            <Description>Portföyünüz için görünen ad</Description>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Uzun Vadeli Yatırımlar"
            />
          </Field>

          <Field>
            <Label>URL Slug</Label>
            <Description>
              URL'de kullanılacak kısa ad (boş bırakılırsa otomatik oluşturulur)
              {customSlug && (
                <span className="ml-2 text-zinc-500">
                  → /p/<strong>{customSlug}</strong>
                </span>
              )}
            </Description>
            <Input
              type="text"
              value={customSlug}
              onChange={(e) => {
                const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
                setCustomSlug(value);
              }}
              placeholder="ornek-portfolio"
            />
          </Field>

          <Field>
            <Label>Açıklama</Label>
            <Description>Portföy için kısa bir açıklama (opsiyonel)</Description>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Örn: Emeklilik için birikim portföyü"
              rows={3}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <Label>Baz Para Birimi</Label>
              <Description>Portföyün ana para birimi</Description>
              <select
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value)}
                className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              >
                <option value="TRY">TRY - Türk Lirası</option>
                <option value="USD">USD - Amerikan Doları</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - İngiliz Sterlini</option>
              </select>
            </Field>

            <Field>
              <Label>Benchmark Sembolü</Label>
              <Description>Karşılaştırma için endeks (opsiyonel)</Description>
              <Input
                type="text"
                value={benchmarkSymbol}
                onChange={(e) => setBenchmarkSymbol(e.target.value.toUpperCase())}
                placeholder="Örn: XU100.IS"
              />
            </Field>
          </div>

          <Field>
            <Label>Portföy Türü</Label>
            <Description>Portföyü kategorize etmek için tür seçin veya yeni ekleyin (opsiyonel)</Description>

            {!showNewTypeInput ? (
              <div className="mt-2 flex gap-2">
                <select
                  value={portfolioTypeId}
                  onChange={(e) => setPortfolioTypeId(e.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  <option value="">Tür seçin (opsiyonel)</option>
                  {portfolioTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.icon && `${type.icon} `}{type.display_name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewTypeInput(true)}
                  className="flex items-center gap-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  title="Yeni tür ekle"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Yeni</span>
                </button>
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                <div className="flex gap-2">
                  <input
                    ref={newTypeInputRef}
                    type="text"
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    placeholder="Tür adı (örn: Emeklilik)"
                    className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateType();
                      } else if (e.key === 'Escape') {
                        setShowNewTypeInput(false);
                        setNewTypeName('');
                        setNewTypeIcon('');
                      }
                    }}
                  />
                  <input
                    type="text"
                    value={newTypeIcon}
                    onChange={(e) => setNewTypeIcon(e.target.value)}
                    placeholder="📊"
                    className="w-16 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-center text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    title="Emoji (opsiyonel)"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCreateType}
                    disabled={creatingType || !newTypeName.trim()}
                    className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-500 disabled:opacity-50"
                  >
                    {creatingType ? <Spinner size="sm" /> : <PlusIcon className="h-4 w-4" />}
                    Ekle
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewTypeInput(false);
                      setNewTypeName('');
                      setNewTypeIcon('');
                    }}
                    className="flex items-center gap-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    İptal
                  </button>
                </div>
              </div>
            )}
          </Field>

          <Field>
            <Label>Hedef Değer</Label>
            <Description>Portföy için hedeflenen toplam değer (opsiyonel)</Description>
            <Input
              type="number"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder="Örn: 1000000"
            />
          </Field>

          <div className="flex items-center gap-3 pt-4">
            <Button onClick={handleSaveGeneral} disabled={saving || !name.trim()}>
              {saving ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Kaydet
                </>
              )}
            </Button>
            {saveSuccess && (
              <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckIcon className="h-4 w-4" />
                Kaydedildi
              </span>
            )}
            {saveError && (
              <span className="text-sm text-red-600 dark:text-red-400">{saveError}</span>
            )}
          </div>
        </FieldGroup>
      </div>

      {/* Policy Settings */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
          Yatırım Politikası
        </h2>
        <PolicyEditorCard portfolioId={portfolio.id} />
      </div>

      {/* Danger Zone */}
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
        <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          Tehlikeli Bölge
        </h2>
        <Text className="text-red-700 dark:text-red-300 mb-4">
          Bu işlemler geri alınamaz. Dikkatli olun.
        </Text>
        <Button
          color="red"
          onClick={() => {
            if (confirm(`"${portfolio.name}" portföyünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
              // Delete portfolio
              fetch(`/api/portfolios/${portfolio.id}`, { method: 'DELETE' })
                .then(() => router.push('/portfolios'))
                .catch((err) => console.error('Error deleting portfolio:', err));
            }
          }}
        >
          Portföyü Sil
        </Button>
      </div>
    </div>
  );
}
