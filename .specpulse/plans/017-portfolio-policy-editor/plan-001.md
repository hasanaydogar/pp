# Implementation Plan: Portföy Politikası Düzenleme

<!-- FEATURE_DIR: 017-portfolio-policy-editor -->
<!-- FEATURE_ID: 017 -->
<!-- PLAN_NUMBER: 001 -->
<!-- STATUS: pending -->
<!-- CREATED: 2026-01-06 -->

## Specification Reference
- **Spec ID**: SPEC-017
- **Spec Version**: 1.0
- **Plan Version**: 1.0
- **Generated**: 2026-01-06

## Architecture Overview

### High-Level Design

Bu özellik mevcut Goals sayfasını düzenlenebilir bir forma dönüştürmeyi içerir. PUT API endpoint zaten mevcut olduğundan, sadece frontend form bileşenlerini ve state yönetimini oluşturmamız gerekiyor.

```
┌────────────────────────────────────────────────────────────┐
│                     Goals Page                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              PolicyEditorCard                        │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │  View Mode (isEditing=false)                │    │   │
│  │  │  - Static PolicyItem displays               │    │   │
│  │  │  - "Düzenle" button                         │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  │                      ↓ toggle                        │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │  Edit Mode (isEditing=true)                 │    │   │
│  │  │  - Form inputs for each policy field        │    │   │
│  │  │  - Validation feedback                      │    │   │
│  │  │  - "İptal" / "Kaydet" buttons               │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    PUT /api/portfolios/[id]/policy
                              │
                              ▼
                    portfolio_policies table
```

### Technical Stack
- **Frontend**: React, Next.js App Router, Tailwind UI components
- **Backend**: Next.js API Routes (mevcut PUT endpoint)
- **Database**: Supabase PostgreSQL (mevcut portfolio_policies tablosu)
- **State Management**: React useState + custom hook (usePolicy)
- **Validation**: Zod (mevcut schema kullanılacak)

### Mevcut Altyapı (Hazır)
- ✅ `PUT /api/portfolios/[id]/policy` - Kaydetme endpoint'i
- ✅ `GET /api/portfolios/[id]/policy` - Okuma endpoint'i
- ✅ `lib/types/policy.ts` - Zod şemaları ve tipler
- ✅ `portfolio_policies` tablosu ve RLS politikaları
- ✅ `DEFAULT_POLICY` varsayılan değerler

## Implementation Phases

### Phase 1: Policy Hook ve API Entegrasyonu [Priority: HIGH]
**Timeline**: 1 saat
**Dependencies**: None

#### Tasks
1. [x] Mevcut API endpoint'lerini doğrula (GET/PUT çalışıyor)
2. [ ] `usePolicy` hook oluştur
   - Policy verisi fetch etme
   - Kaydetme fonksiyonu
   - Loading/error state yönetimi

#### Files to Create/Modify
```
lib/hooks/use-policy.ts (CREATE)
```

#### Hook Interface
```typescript
interface UsePolicyReturn {
  policy: PortfolioPolicy | null;
  isLoading: boolean;
  error: string | null;
  savePolicy: (data: UpdatePortfolioPolicy) => Promise<boolean>;
  isSaving: boolean;
  resetToDefault: () => void;
}

function usePolicy(portfolioId: string): UsePolicyReturn
```

#### Deliverables
- [ ] usePolicy hook çalışıyor
- [ ] GET ile policy verisi çekiliyor
- [ ] PUT ile güncelleme çalışıyor

---

### Phase 2: Policy Editor Form Bileşeni [Priority: HIGH]
**Timeline**: 2-3 saat
**Dependencies**: Phase 1 complete

#### Tasks
1. [ ] `PolicyEditorCard` bileşeni oluştur
2. [ ] View Mode görünümü (mevcut PolicyItem'ları koru)
3. [ ] Edit Mode form alanları
4. [ ] Toggle state yönetimi (isEditing)
5. [ ] Form state yönetimi (değişen değerler)

#### Files to Create/Modify
```
components/policy/policy-editor-card.tsx (CREATE)
components/policy/policy-form-field.tsx (CREATE)
```

#### Form Alanları (PortfolioPolicy tipine göre)

| Grup | Alan | Label | Min | Max | Adım |
|------|------|-------|-----|-----|------|
| **Hisse Limitleri** | max_weight_per_stock | Maks. Hisse Ağırlığı | 0 | 100 | 1 |
| **Ana Pozisyon** | core_min_weight | Ana Pozisyon Min | 0 | 100 | 1 |
| | core_max_weight | Ana Pozisyon Maks | 0 | 100 | 1 |
| **Uydu Pozisyon** | satellite_min_weight | Uydu Pozisyon Min | 0 | 100 | 0.5 |
| | satellite_max_weight | Uydu Pozisyon Maks | 0 | 100 | 0.5 |
| **Yeni Pozisyon** | new_position_min_weight | Yeni Pozisyon Min | 0 | 100 | 0.1 |
| | new_position_max_weight | Yeni Pozisyon Maks | 0 | 100 | 0.5 |
| **Sektör** | max_weight_per_sector | Maks. Sektör Ağırlığı | 0 | 100 | 5 |
| **Nakit** | cash_min_percent | Min. Nakit | 0 | 100 | 1 |
| | cash_max_percent | Maks. Nakit | 0 | 100 | 1 |
| | cash_target_percent | Hedef Nakit | 0 | 100 | 1 |

#### Bileşen Yapısı
```tsx
<PolicyEditorCard portfolioId={portfolioId}>
  {/* View Mode */}
  <PolicySection title="Hisse Limitleri">
    <PolicyItem label="Maks. Hisse Ağırlığı" value={policy.max_weight_per_stock} />
  </PolicySection>
  
  {/* Edit Mode */}
  <PolicyFormSection title="Hisse Limitleri">
    <PolicyFormField 
      name="max_weight_per_stock" 
      label="Maks. Hisse Ağırlığı"
      value={formData.max_weight_per_stock}
      onChange={handleChange}
      suffix="%"
    />
  </PolicyFormSection>
</PolicyEditorCard>
```

#### Deliverables
- [ ] PolicyEditorCard bileşeni oluşturuldu
- [ ] View/Edit mode toggle çalışıyor
- [ ] Tüm form alanları görüntüleniyor

---

### Phase 3: Form Validasyonu ve Kaydetme [Priority: HIGH]
**Timeline**: 1-2 saat
**Dependencies**: Phase 2 complete

#### Tasks
1. [ ] Client-side validasyon kuralları
2. [ ] Min/Max kontrolleri (örn: core_min < core_max)
3. [ ] Kaydet butonu loading state
4. [ ] Başarı/hata toast mesajları
5. [ ] İptal butonu (form reset)

#### Validasyon Kuralları
```typescript
const validatePolicy = (data: UpdatePortfolioPolicy): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // Min < Max kontrolleri
  if (data.core_min_weight >= data.core_max_weight) {
    errors.push({ field: 'core_min_weight', message: 'Min değer Max değerden küçük olmalı' });
  }
  if (data.satellite_min_weight >= data.satellite_max_weight) {
    errors.push({ field: 'satellite_min_weight', message: 'Min değer Max değerden küçük olmalı' });
  }
  if (data.new_position_min_weight >= data.new_position_max_weight) {
    errors.push({ field: 'new_position_min_weight', message: 'Min değer Max değerden küçük olmalı' });
  }
  
  // Nakit limitleri
  if (data.cash_min_percent >= data.cash_max_percent) {
    errors.push({ field: 'cash_min_percent', message: 'Min nakit Max nakitten küçük olmalı' });
  }
  if (data.cash_target_percent < data.cash_min_percent || 
      data.cash_target_percent > data.cash_max_percent) {
    errors.push({ 
      field: 'cash_target_percent', 
      message: 'Hedef nakit Min-Max aralığında olmalı' 
    });
  }
  
  return errors;
};
```

#### Deliverables
- [ ] Validasyon kuralları çalışıyor
- [ ] Hata mesajları gösteriliyor
- [ ] Kaydetme başarılı/başarısız feedback
- [ ] İptal ile form sıfırlanıyor

---

### Phase 4: Goals Sayfası Entegrasyonu [Priority: HIGH]
**Timeline**: 30 dakika
**Dependencies**: Phase 3 complete

#### Tasks
1. [ ] Goals sayfasına PolicyEditorCard ekle
2. [ ] "Coming Soon" kartını kaldır veya küçült
3. [ ] Mevcut statik PolicyItem'ları kaldır
4. [ ] portfolioId'yi context'ten al

#### Files to Modify
```
app/(protected)/p/[slug]/goals/page.tsx (MODIFY)
```

#### Deliverables
- [ ] Goals sayfası yeni editör kartını kullanıyor
- [ ] Statik içerik kaldırıldı
- [ ] Sayfa düzgün render oluyor

---

### Phase 5: UX İyileştirmeleri [Priority: MEDIUM]
**Timeline**: 1 saat
**Dependencies**: Phase 4 complete

#### Tasks
1. [ ] Değişiklik yoksa Kaydet butonunu disable et
2. [ ] Değişiklik varken sayfadan çıkışta uyarı (beforeunload)
3. [ ] Varsayılana sıfırla butonu
4. [ ] Input alanlarında % sembolü gösterimi
5. [ ] Form alanları gruplandırma (accordeon veya tabs)

#### Opsiyonel İyileştirmeler
- [ ] Debounced auto-save
- [ ] Undo/Redo desteği
- [ ] Keyboard navigation

#### Deliverables
- [ ] Kaydet butonu akıllı disable
- [ ] Sayfadan çıkış uyarısı çalışıyor
- [ ] Varsayılana sıfırla çalışıyor

---

## Risk Assessment

### Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| API PUT hata verirse | Low | Medium | Mevcut API test edildi, çalışıyor |
| Form state karmaşıklığı | Low | Low | useState yeterli, React Hook Form gereksiz |
| Decimal/yüzde dönüşümü hataları | Medium | Low | DB'de 0-1, UI'da 0-100, açık dönüşüm |

### Dependencies
| Dependency | Risk | Contingency |
|------------|------|-------------|
| Mevcut Policy API | None | API zaten çalışıyor |
| Tailwind UI Input | None | Mevcut bileşen kullanılacak |

## File Changes Summary

### New Files
| File | Description |
|------|-------------|
| `lib/hooks/use-policy.ts` | Policy verisi fetch/save hook |
| `components/policy/policy-editor-card.tsx` | Ana editör bileşeni |
| `components/policy/policy-form-field.tsx` | Tekrar kullanılabilir form field |

### Modified Files
| File | Changes |
|------|---------|
| `app/(protected)/p/[slug]/goals/page.tsx` | PolicyEditorCard entegrasyonu |

### No Changes Required
| File | Reason |
|------|--------|
| `app/api/portfolios/[id]/policy/route.ts` | PUT API zaten mevcut |
| `lib/types/policy.ts` | Tipler ve şemalar mevcut |

## Success Metrics
- **Fonksiyonel**: Tüm policy alanları düzenlenebilir ve kaydedilebilir
- **Performance**: Kaydetme < 2 saniye
- **UX**: Kullanıcı anlık feedback alıyor (loading, success, error)
- **Validasyon**: Geçersiz değerler engelleniyor

## Definition of Done
- [ ] Phase 1-4 tamamlandı
- [ ] Tüm policy alanları düzenlenebilir
- [ ] Kaydetme ve iptal çalışıyor
- [ ] Validasyon hataları gösteriliyor
- [ ] Goals sayfası entegrasyonu tamamlandı
- [ ] Manuel test yapıldı

## Estimated Total Time
- **Phase 1**: 1 saat
- **Phase 2**: 2-3 saat
- **Phase 3**: 1-2 saat
- **Phase 4**: 30 dakika
- **Phase 5**: 1 saat (opsiyonel)

**Toplam**: ~5-7 saat (P0-P1 özellikleri için)

## Implementation Order

```
1. usePolicy hook oluştur
2. PolicyFormField bileşeni oluştur
3. PolicyEditorCard bileşeni oluştur
4. Goals sayfasına entegre et
5. Test et
6. UX iyileştirmeleri (opsiyonel)
```
