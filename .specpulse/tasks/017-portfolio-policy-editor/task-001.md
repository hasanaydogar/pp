# Task Breakdown: Portföy Politikası Düzenleme

<!-- FEATURE_DIR: 017-portfolio-policy-editor -->
<!-- FEATURE_ID: 017 -->
<!-- TASK_LIST_ID: 001 -->
<!-- STATUS: completed -->
<!-- CREATED: 2026-01-06 -->
<!-- LAST_UPDATED: 2026-01-06 -->

## Progress Overview
- **Total Tasks**: 12
- **Completed Tasks**: 12 (100%)
- **In Progress Tasks**: 0
- **Blocked Tasks**: 0

## Task Summary

| ID | Task | Priority | Size | Deps | Status |
|----|------|----------|------|------|--------|
| T001 | usePolicy hook oluştur | HIGH | M | - | [x] |
| T002 | PolicyFormField bileşeni | HIGH | S | - | [x] |
| T003 | PolicyEditorCard - View Mode | HIGH | M | T001 | [x] |
| T004 | PolicyEditorCard - Edit Mode | HIGH | M | T002, T003 | [x] |
| T005 | Form validasyonu | HIGH | M | T004 | [x] |
| T006 | Kaydetme ve feedback | HIGH | S | T005 | [x] |
| T007 | İptal ve reset | HIGH | S | T004 | [x] |
| T008 | Goals sayfası entegrasyonu | HIGH | S | T006, T007 | [x] |
| T009 | Akıllı Kaydet butonu | MEDIUM | S | T008 | [x] |
| T010 | Sayfadan çıkış uyarısı | MEDIUM | S | T008 | [x] |
| T011 | Varsayılana sıfırla | MEDIUM | S | T008 | [x] |
| T012 | Manuel test ve düzeltmeler | HIGH | M | T008 | [x] |

---

## Phase 1: Hook ve API [Parallel: T001, T002]

### T001: usePolicy Hook Oluştur
```yaml
id: T001
status: pending
priority: HIGH
size: M (4 saat)
dependencies: []
parallel: [P]
```

**Dosya**: `lib/hooks/use-policy.ts`

**Açıklama**: Policy verisi çekme ve kaydetme hook'u

**Uygulama Adımları**:
1. `usePolicy(portfolioId: string)` hook oluştur
2. `useState` ile policy, loading, error state'leri
3. `useEffect` ile GET `/api/portfolios/[id]/policy` çağrısı
4. `savePolicy(data)` fonksiyonu ile PUT çağrısı
5. `isSaving` state'i
6. `resetToDefault()` fonksiyonu

**Kod Taslağı**:
```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { PortfolioPolicy, UpdatePortfolioPolicy, DEFAULT_POLICY } from '@/lib/types/policy';

interface UsePolicyReturn {
  policy: PortfolioPolicy | null;
  isLoading: boolean;
  error: string | null;
  savePolicy: (data: UpdatePortfolioPolicy) => Promise<boolean>;
  isSaving: boolean;
  resetToDefault: () => Promise<boolean>;
}

export function usePolicy(portfolioId: string): UsePolicyReturn {
  const [policy, setPolicy] = useState<PortfolioPolicy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch policy
  useEffect(() => {
    async function fetchPolicy() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/portfolios/${portfolioId}/policy`);
        if (!res.ok) throw new Error('Policy yüklenemedi');
        const data = await res.json();
        setPolicy(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
      } finally {
        setIsLoading(false);
      }
    }
    if (portfolioId) fetchPolicy();
  }, [portfolioId]);

  // Save policy
  const savePolicy = useCallback(async (data: UpdatePortfolioPolicy) => {
    try {
      setIsSaving(true);
      const res = await fetch(`/api/portfolios/${portfolioId}/policy`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Kaydetme başarısız');
      const updated = await res.json();
      setPolicy(updated);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydetme hatası');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [portfolioId]);

  // Reset to default
  const resetToDefault = useCallback(async () => {
    return savePolicy(DEFAULT_POLICY);
  }, [savePolicy]);

  return { policy, isLoading, error, savePolicy, isSaving, resetToDefault };
}
```

**Kabul Kriterleri**:
- [ ] Hook portfolioId ile policy çekiyor
- [ ] Loading state doğru çalışıyor
- [ ] savePolicy ile güncelleme yapılıyor
- [ ] Error handling çalışıyor

---

### T002: PolicyFormField Bileşeni
```yaml
id: T002
status: pending
priority: HIGH
size: S (2 saat)
dependencies: []
parallel: [P]
```

**Dosya**: `components/policy/policy-form-field.tsx`

**Açıklama**: Tekrar kullanılabilir yüzde input bileşeni

**Props**:
```typescript
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
```

**Özellikler**:
- Değer DB'de 0-1, UI'da 0-100 olarak gösterilir
- % sembolü suffix olarak gösterilir
- Hata mesajı gösterimi
- Label ve açıklama

**Kabul Kriterleri**:
- [ ] Input % formatında değer gösteriyor
- [ ] Değişiklik 0-1 formatında döndürülüyor
- [ ] Hata mesajı görüntüleniyor
- [ ] Disabled state çalışıyor

---

## Phase 2: PolicyEditorCard [Sequential: T003 → T004]

### T003: PolicyEditorCard - View Mode
```yaml
id: T003
status: pending
priority: HIGH
size: M (3 saat)
dependencies: [T001]
```

**Dosya**: `components/policy/policy-editor-card.tsx`

**Açıklama**: Politika görüntüleme kartı (view mode)

**Gruplar**:
1. **Hisse Limitleri**: max_weight_per_stock
2. **Pozisyon Kategorileri**: core, satellite, new_position (min/max)
3. **Sektör Limiti**: max_weight_per_sector
4. **Nakit Yönetimi**: cash_min, cash_max, cash_target

**Bileşen Yapısı**:
```tsx
<div className="rounded-lg border bg-white dark:bg-zinc-800 p-6">
  <div className="flex items-center justify-between mb-6">
    <Subheading>Yatırım Politikaları</Subheading>
    <Button onClick={() => setIsEditing(true)}>Düzenle</Button>
  </div>
  
  {/* Policy Sections */}
  <PolicySection title="Hisse Limitleri">
    <PolicyItem label="Maks. Hisse Ağırlığı" value={formatPercent(policy.max_weight_per_stock)} />
  </PolicySection>
  
  <PolicySection title="Pozisyon Kategorileri">
    <PolicyItem label="Ana Pozisyon" value={formatRange(policy.core_min_weight, policy.core_max_weight)} />
    <PolicyItem label="Uydu Pozisyon" value={formatRange(...)} />
    <PolicyItem label="Yeni Pozisyon" value={formatRange(...)} />
  </PolicySection>
  
  {/* ... */}
</div>
```

**Kabul Kriterleri**:
- [ ] Policy verileri gruplar halinde görüntüleniyor
- [ ] Yüzde formatı doğru (örn: %12)
- [ ] Min-Max aralıkları okunabilir (örn: %8 - %12)
- [ ] Düzenle butonu var

---

### T004: PolicyEditorCard - Edit Mode
```yaml
id: T004
status: pending
priority: HIGH
size: M (4 saat)
dependencies: [T002, T003]
```

**Açıklama**: Politika düzenleme formu (edit mode)

**Form State**:
```typescript
const [formData, setFormData] = useState<UpdatePortfolioPolicy>({});
const [isEditing, setIsEditing] = useState(false);

// Policy yüklendiğinde form'u doldur
useEffect(() => {
  if (policy) {
    setFormData({
      max_weight_per_stock: policy.max_weight_per_stock,
      core_min_weight: policy.core_min_weight,
      // ... diğer alanlar
    });
  }
}, [policy]);
```

**Form Alanları**:
| Alan | Label | Min | Max | Adım |
|------|-------|-----|-----|------|
| max_weight_per_stock | Maks. Hisse Ağırlığı | 0.01 | 0.50 | 0.01 |
| core_min_weight | Ana Pozisyon Min | 0.01 | 0.30 | 0.01 |
| core_max_weight | Ana Pozisyon Maks | 0.05 | 0.50 | 0.01 |
| satellite_min_weight | Uydu Pozisyon Min | 0.005 | 0.10 | 0.005 |
| satellite_max_weight | Uydu Pozisyon Maks | 0.01 | 0.15 | 0.005 |
| new_position_min_weight | Yeni Pozisyon Min | 0.001 | 0.05 | 0.001 |
| new_position_max_weight | Yeni Pozisyon Maks | 0.005 | 0.10 | 0.005 |
| max_weight_per_sector | Maks. Sektör Ağırlığı | 0.10 | 0.50 | 0.05 |
| cash_min_percent | Min. Nakit | 0 | 0.20 | 0.01 |
| cash_max_percent | Maks. Nakit | 0.05 | 0.30 | 0.01 |
| cash_target_percent | Hedef Nakit | 0.01 | 0.25 | 0.01 |

**Kabul Kriterleri**:
- [ ] isEditing toggle çalışıyor
- [ ] Tüm form alanları görüntüleniyor
- [ ] Form değerleri değiştirilebiliyor
- [ ] İptal ve Kaydet butonları var

---

## Phase 3: Validasyon ve Kaydetme [Sequential: T005 → T006 → T007]

### T005: Form Validasyonu
```yaml
id: T005
status: pending
priority: HIGH
size: M (3 saat)
dependencies: [T004]
```

**Dosya**: `lib/utils/policy-validation.ts` (opsiyonel, component içinde de olabilir)

**Validasyon Kuralları**:
```typescript
interface ValidationError {
  field: string;
  message: string;
}

function validatePolicy(data: UpdatePortfolioPolicy): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Min < Max kontrolleri
  if (data.core_min_weight && data.core_max_weight) {
    if (data.core_min_weight >= data.core_max_weight) {
      errors.push({ 
        field: 'core_min_weight', 
        message: 'Min değer Max değerden küçük olmalı' 
      });
    }
  }
  
  // satellite min/max
  if (data.satellite_min_weight && data.satellite_max_weight) {
    if (data.satellite_min_weight >= data.satellite_max_weight) {
      errors.push({ 
        field: 'satellite_min_weight', 
        message: 'Min değer Max değerden küçük olmalı' 
      });
    }
  }
  
  // new_position min/max
  if (data.new_position_min_weight && data.new_position_max_weight) {
    if (data.new_position_min_weight >= data.new_position_max_weight) {
      errors.push({ 
        field: 'new_position_min_weight', 
        message: 'Min değer Max değerden küçük olmalı' 
      });
    }
  }
  
  // Nakit limitleri
  if (data.cash_min_percent && data.cash_max_percent) {
    if (data.cash_min_percent >= data.cash_max_percent) {
      errors.push({ 
        field: 'cash_min_percent', 
        message: 'Min nakit Max nakitten küçük olmalı' 
      });
    }
  }
  
  // Hedef nakit aralık kontrolü
  if (data.cash_target_percent && data.cash_min_percent && data.cash_max_percent) {
    if (data.cash_target_percent < data.cash_min_percent || 
        data.cash_target_percent > data.cash_max_percent) {
      errors.push({ 
        field: 'cash_target_percent', 
        message: 'Hedef nakit Min-Max aralığında olmalı' 
      });
    }
  }
  
  return errors;
}
```

**Kabul Kriterleri**:
- [ ] Min < Max kontrolleri çalışıyor
- [ ] Nakit hedef aralık kontrolü çalışıyor
- [ ] Hata mesajları ilgili alanlarda gösteriliyor
- [ ] Hatalı form kaydedilemiyor

---

### T006: Kaydetme ve Feedback
```yaml
id: T006
status: pending
priority: HIGH
size: S (2 saat)
dependencies: [T005]
```

**Özellikler**:
1. Kaydet butonuna tıklandığında:
   - Önce validasyon çalışır
   - Hata varsa kaydetme engellenir
   - Hata yoksa `savePolicy(formData)` çağrılır
   
2. Kaydetme sırasında:
   - Buton disabled + loading spinner
   - Form alanları disabled

3. Kaydetme sonrası:
   - Başarılı: Yeşil toast mesajı, edit mode kapanır
   - Hatalı: Kırmızı toast mesajı, edit mode açık kalır

**Kabul Kriterleri**:
- [ ] Kaydet butonu loading state gösteriyor
- [ ] Başarılı kaydetmede success toast
- [ ] Hatalı kaydetmede error toast
- [ ] Başarılı sonrası edit mode kapanıyor

---

### T007: İptal ve Reset
```yaml
id: T007
status: pending
priority: HIGH
size: S (1 saat)
dependencies: [T004]
parallel: [P] (T005-T006 ile paralel yapılabilir)
```

**Özellikler**:
1. İptal butonu:
   - formData'yı orijinal policy değerlerine sıfırlar
   - isEditing = false yapar
   - Değişiklik varsa onay dialog gösterebilir (opsiyonel)

2. Reset fonksiyonu:
   ```typescript
   const handleCancel = () => {
     if (policy) {
       setFormData({
         max_weight_per_stock: policy.max_weight_per_stock,
         // ... diğer alanlar
       });
     }
     setIsEditing(false);
     setErrors([]);
   };
   ```

**Kabul Kriterleri**:
- [ ] İptal butonu form'u sıfırlıyor
- [ ] Edit mode kapanıyor
- [ ] Validasyon hataları temizleniyor

---

## Phase 4: Entegrasyon

### T008: Goals Sayfası Entegrasyonu
```yaml
id: T008
status: pending
priority: HIGH
size: S (1 saat)
dependencies: [T006, T007]
```

**Dosya**: `app/(protected)/p/[slug]/goals/page.tsx`

**Değişiklikler**:
1. `PolicyEditorCard` import et
2. `usePortfolio` context'ten `activePortfolioId` al
3. "Coming Soon" kartını küçült veya kaldır
4. Mevcut statik `PolicyItem`'ları kaldır
5. `PolicyEditorCard` ekle

**Yeni Kod**:
```tsx
import { PolicyEditorCard } from '@/components/policy/policy-editor-card';

export default function PortfolioGoalsPage() {
  const { activePortfolioId } = usePortfolio();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Heading>🎯 Portföy Amacı</Heading>
        <Text>Portföy hedefleri ve yatırım politikaları</Text>
      </div>

      {/* Policy Editor */}
      {activePortfolioId && (
        <PolicyEditorCard portfolioId={activePortfolioId} />
      )}

      {/* Future Features - Coming Soon */}
      <div className="rounded-xl border-2 border-dashed ...">
        {/* Küçültülmüş coming soon kartı */}
      </div>
    </div>
  );
}
```

**Kabul Kriterleri**:
- [ ] PolicyEditorCard sayfada görünüyor
- [ ] Policy verileri yükleniyor
- [ ] Düzenleme çalışıyor
- [ ] Kaydetme çalışıyor

---

## Phase 5: UX İyileştirmeleri [Priority: MEDIUM]

### T009: Akıllı Kaydet Butonu
```yaml
id: T009
status: pending
priority: MEDIUM
size: S (1 saat)
dependencies: [T008]
parallel: [P]
```

**Özellik**: Değişiklik yoksa Kaydet butonunu disable et

```typescript
const hasChanges = useMemo(() => {
  if (!policy) return false;
  return Object.keys(formData).some(key => {
    const k = key as keyof UpdatePortfolioPolicy;
    return formData[k] !== policy[k];
  });
}, [formData, policy]);

// Buton
<Button disabled={!hasChanges || isSaving}>Kaydet</Button>
```

---

### T010: Sayfadan Çıkış Uyarısı
```yaml
id: T010
status: pending
priority: MEDIUM
size: S (1 saat)
dependencies: [T008]
parallel: [P]
```

**Özellik**: Değişiklik varken sayfadan çıkışta uyarı

```typescript
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
```

---

### T011: Varsayılana Sıfırla
```yaml
id: T011
status: pending
priority: MEDIUM
size: S (1 saat)
dependencies: [T008]
parallel: [P]
```

**Özellik**: Politikayı varsayılan değerlere sıfırla

```typescript
const handleResetToDefault = async () => {
  if (confirm('Tüm politika değerleri varsayılana sıfırlanacak. Emin misiniz?')) {
    const success = await resetToDefault();
    if (success) {
      toast.success('Varsayılan değerler yüklendi');
      setIsEditing(false);
    }
  }
};
```

---

### T012: Manuel Test ve Düzeltmeler
```yaml
id: T012
status: pending
priority: HIGH
size: M (2 saat)
dependencies: [T008]
```

**Test Senaryoları**:
- [ ] Policy yükleme testi
- [ ] Tüm alanları düzenleme testi
- [ ] Validasyon hata senaryoları
- [ ] Kaydetme ve iptal testi
- [ ] Farklı portföyler arası geçiş testi
- [ ] Sayfa yenileme sonrası veri tutarlılığı

---

## Dependency Graph

```
T001 ──────────────┐
                   │
T002 ──────────────┼──→ T003 ──→ T004 ──→ T005 ──→ T006 ──┐
                                    │                      │
                                    └──→ T007 ─────────────┼──→ T008 ──→ T012
                                                           │      │
                                                           │      ├──→ T009
                                                           │      ├──→ T010
                                                           │      └──→ T011
                                                           │
                                                           └──────────────────
```

## Parallel Execution Groups

### Group A (Başlangıç - Paralel)
- **T001**: usePolicy hook
- **T002**: PolicyFormField bileşeni

### Group B (Phase 2-3 - Sequential)
- T003 → T004 → T005 → T006
- T007 (T004 sonrası paralel yapılabilir)

### Group C (UX - Paralel)
- **T009**: Akıllı Kaydet
- **T010**: Çıkış uyarısı
- **T011**: Varsayılana sıfırla

---

## Estimated Time Summary

| Phase | Tasks | Estimated |
|-------|-------|-----------|
| Phase 1 | T001, T002 | 6 saat |
| Phase 2 | T003, T004 | 7 saat |
| Phase 3 | T005, T006, T007 | 6 saat |
| Phase 4 | T008 | 1 saat |
| Phase 5 | T009, T010, T011 | 3 saat |
| Testing | T012 | 2 saat |
| **Toplam** | | **~25 saat** |

**Not**: Paralel çalışma ile gerçek süre ~15-18 saat'e düşebilir.

---

## Definition of Done

- [ ] Tüm P0 (HIGH) task'lar tamamlandı
- [ ] Policy düzenleme ve kaydetme çalışıyor
- [ ] Validasyon hataları gösteriliyor
- [ ] Goals sayfası entegrasyonu tamamlandı
- [ ] Manuel testler geçti
