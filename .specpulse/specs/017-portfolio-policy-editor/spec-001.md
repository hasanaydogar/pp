# Specification: Portföy Politikası Düzenleme

<!-- FEATURE_DIR: 017-portfolio-policy-editor -->
<!-- FEATURE_ID: 017 -->
<!-- SPEC_NUMBER: 001 -->
<!-- STATUS: completed -->
<!-- CREATED: 2026-01-06 -->

## Description

Portföy Amacı (Goals) sayfasındaki yatırım politikalarını düzenlenebilir hale getirme. Kullanıcı mevcut politikaları görüntüleyebilmeli, düzenleyebilmeli ve kaydedebilmelidir. Bu özellik şu anda sadece görüntüleme modunda olan politika kartlarını interaktif form alanlarına dönüştürmeyi içerir.

## Requirements

### Functional Requirements

#### Must Have (P0)
- [x] Politika değerlerini düzenlenebilir form alanlarına dönüştürme
- [x] Değişiklikleri veritabanına kaydetme
- [x] Kaydetme sırasında loading state gösterme
- [x] Başarılı/hatalı kaydetme için geri bildirim (toast/alert)
- [x] Mevcut politika değerlerini formda gösterme

#### Should Have (P1)
- [x] Form validasyonu (min/max değerler, gerekli alanlar)
- [x] Değişiklik yapılmadıysa kaydet butonunu devre dışı bırakma
- [x] İptal butonu ile değişiklikleri geri alma
- [ ] Otomatik kaydetme (debounced)

#### Could Have (P2)
- [ ] Politika şablonları (Muhafazakar, Dengeli, Agresif)
- [ ] Politika geçmişi görüntüleme
- [ ] Politika değişiklik karşılaştırması

#### Won't Have (P3)
- [ ] Çoklu portföy için toplu politika güncelleme
- [ ] Politika versiyonlama

### Non-Functional Requirements
- **Performance**: Form değişiklikleri anlık olmalı, kaydetme < 2 saniye
- **Security**: Sadece portföy sahibi düzenleyebilmeli (RLS)
- **UX**: Düzenleme modu net olmalı, kullanıcı ne düzenlediğini bilmeli

## User Stories

### US-1: Politika Düzenleme
**As a** portföy sahibi  
**I want to** yatırım politikalarımı düzenleyebilmek  
**So that** portföy hedeflerimi güncelleyebileyim

**Acceptance Criteria:**
- [ ] Given kullanıcı Goals sayfasında, when "Düzenle" butonuna tıklar, then politika alanları düzenlenebilir hale gelir
- [ ] Given politika alanları düzenlenebilir, when kullanıcı değerleri değiştirir, then değişiklikler formda görünür
- [ ] Given kullanıcı değişiklik yapmış, when "Kaydet" butonuna tıklar, then değişiklikler veritabanına kaydedilir
- [ ] Given kaydetme başarılı, when işlem tamamlanır, then kullanıcıya başarı mesajı gösterilir

### US-2: Politika Validasyonu
**As a** portföy sahibi  
**I want to** geçersiz değerler girdiğimde uyarı almak  
**So that** mantıklı politika değerleri ayarlayabileyim

**Acceptance Criteria:**
- [ ] Given kullanıcı yüzde alanına > 100 girer, when blur olur, then hata mesajı gösterilir
- [ ] Given toplam sektör ağırlıkları > 100%, when validasyon çalışır, then uyarı gösterilir
- [ ] Given zorunlu alan boş bırakılır, when kaydet tıklanır, then kayıt engellenir ve hata gösterilir

### US-3: Değişiklikleri İptal Etme
**As a** portföy sahibi  
**I want to** yaptığım değişiklikleri iptal edebilmek  
**So that** yanlış değişiklikleri geri alabileyim

**Acceptance Criteria:**
- [ ] Given kullanıcı değişiklik yapmış, when "İptal" butonuna tıklar, then form orijinal değerlere döner
- [ ] Given değişiklik yapılmış ve sayfa değiştirilmek isteniyor, when kullanıcı sayfadan çıkmak ister, then onay dialog'u gösterilir

## Technical Considerations

### Dependencies
- **External APIs**: Yok
- **Database Changes**: Mevcut `portfolio_policies` tablosu kullanılacak
- **Third-party Libraries**: Mevcut form kütüphaneleri (React Hook Form veya native)

### Existing Components/APIs
- `app/(protected)/p/[slug]/goals/page.tsx` - Goals sayfası
- `app/api/portfolios/[id]/policy/route.ts` - Policy API (GET mevcut)
- `lib/types/policy.ts` - Policy tipleri

### Implementation Notes

1. **Goals Sayfası Güncelleme:**
   - Mevcut statik görünümü form bileşenlerine dönüştür
   - "Düzenle" modu toggle butonu ekle
   - Form state yönetimi için useState veya React Hook Form kullan

2. **API Güncelleme:**
   - `PUT /api/portfolios/[id]/policy` endpoint'i ekle veya güncelle
   - Request body validasyonu (Zod)
   - RLS kontrolü

3. **Form Alanları:**
   - Hedef dağılım yüzdeleri (hisse, tahvil, nakit, altın, vb.)
   - Risk toleransı (düşük, orta, yüksek)
   - Yatırım süresi (kısa, orta, uzun vadeli)
   - Maksimum tek pozisyon ağırlığı
   - Sektör limitleri

4. **Validasyon Kuralları:**
   - Yüzde alanları: 0-100 arası
   - Toplam dağılım: 100% olmalı (veya uyarı)
   - Maksimum pozisyon: 1-50% arası

## UI/UX Design

### Current State (View Mode)
```
┌─────────────────────────────────────┐
│ Portföy Politikası                  │
├─────────────────────────────────────┤
│ Hedef Dağılım:                      │
│   Hisse: 60%                        │
│   Tahvil: 30%                       │
│   Nakit: 10%                        │
│                                     │
│ Risk Toleransı: Orta                │
│ Maks. Pozisyon: 10%                 │
│                                     │
│              [Düzenle]              │
└─────────────────────────────────────┘
```

### Edit Mode
```
┌─────────────────────────────────────┐
│ Portföy Politikası Düzenle          │
├─────────────────────────────────────┤
│ Hedef Dağılım:                      │
│   Hisse: [___60___] %               │
│   Tahvil: [___30___] %              │
│   Nakit: [___10___] %               │
│   Toplam: 100% ✓                    │
│                                     │
│ Risk Toleransı: [▼ Orta]            │
│ Maks. Pozisyon: [___10___] %        │
│                                     │
│        [İptal]  [Kaydet]            │
└─────────────────────────────────────┘
```

## Testing Strategy

### Unit Tests
- Form validasyon fonksiyonları
- Yüzde hesaplama yardımcıları
- Form state yönetimi

### Integration Tests
- Policy API PUT endpoint
- Form submit ve API entegrasyonu
- RLS erişim kontrolü

### End-to-End Tests
- Politika düzenleme ve kaydetme akışı
- Validasyon hata senaryoları
- İptal etme akışı

## Definition of Done

- [x] Goals sayfasında düzenleme modu aktif
- [x] Tüm politika alanları düzenlenebilir
- [x] PUT /api/portfolios/[id]/policy endpoint çalışıyor
- [x] Form validasyonu çalışıyor
- [x] Başarı/hata mesajları gösteriliyor
- [x] Değişiklikler veritabanına kaydediliyor
- [x] İptal butonu çalışıyor
- [ ] Kod review ve onay
- [ ] Test senaryoları geçiyor

## Out of Scope

- Politika şablonları (ayrı bir feature olarak değerlendirilebilir)
- Politika geçmişi ve versiyonlama
- Çoklu portföy toplu güncelleme
- AI destekli politika önerileri

## Related Features

- 011-architecture-redesign (Policies tablosu burada oluşturuldu)
- 013-cash-dividends-performance (Policy görüntüleme burada eklendi)

## Additional Notes

- Mevcut Goals sayfası (`/p/[slug]/goals`) zaten temel bir görünüm içeriyor
- `portfolio_policies` tablosu ve RLS politikaları mevcut
- Tailwind UI form bileşenleri kullanılmalı (Input, Select, Button)
