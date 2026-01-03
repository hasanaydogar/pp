# Portfolio Tracker API - Eksiklik Analizi ve Geliştirme Planı

**Tarih:** 2025-11-30  
**Durum:** Mevcut API test edildi, eksiklikler tespit edildi

---

## 🔍 Tespit Edilen Eksiklikler

### 1. ❌ Asset Ekleme Eksiklikleri

#### Mevcut Durum
- Asset eklerken sadece `quantity` ve `average_buy_price` manuel giriliyor
- Geçmiş asset'leri eklemek için yöntem yok
- Asset eklerken tarih sorulmuyor
- Geçmiş transaction'lardan asset oluşturulamıyor

#### Eksikler
- [ ] **Geçmiş Asset Import:** Mevcut asset'leri geçmiş transaction'lardan oluşturma
- [ ] **Initial Purchase Date:** Asset'in ilk alım tarihini kaydetme
- [ ] **Bulk Import:** CSV/JSON'dan geçmiş transaction'ları import etme
- [ ] **Transaction-Based Asset Creation:** Transaction'lardan otomatik asset oluşturma

### 2. ❌ Transaction İşlemleri Eksiklikleri

#### Mevcut Durum
- ✅ BUY transaction sonrası asset güncelleniyor (quantity artıyor, average price güncelleniyor)
- ❌ SELL transaction sonrası asset quantity azaltılmıyor
- ❌ Geçmiş transaction'ları import etme yok
- ❌ Transaction tarihine göre sıralama var ama geçmiş tarih desteği eksik

#### Eksikler
- [ ] **SELL Quantity Reduction:** SELL transaction sonrası quantity azaltılmalı
- [ ] **Quantity Validation:** SELL için yeterli quantity kontrolü
- [ ] **Realized Gain/Loss:** SELL sonrası kar/zarar hesaplama
- [ ] **Historical Import:** Geçmiş transaction'ları toplu import
- [ ] **Bulk Transaction Creation:** Birden fazla transaction'ı tek seferde oluşturma

### 3. ❌ Para Birimi Desteği Yok

#### Mevcut Durum
- Tüm asset'ler ve transaction'lar tek para biriminde (USD varsayılan)
- Farklı para birimlerine kıyaslama yok
- Currency conversion yok

#### Eksikler
- [ ] **Multi-Currency Assets:** Asset'lere currency field eklenmeli
- [ ] **Multi-Currency Transactions:** Transaction'lara currency field eklenmeli
- [ ] **Portfolio Base Currency:** Portfolio seviyesinde base currency
- [ ] **Currency Conversion:** Para birimi dönüşümü (gelecekte)

### 4. ❌ Benchmark Kıyaslama Yok

#### Mevcut Durum
- Portfolio performansını benchmark'larla kıyaslama yok
- BIST 100, Altın, SP500 gibi kıyaslamalar yok

#### Eksikler
- [ ] **Benchmark Symbol:** Portfolio'ya benchmark symbol eklenmeli
- [ ] **Benchmark Comparison:** Portfolio vs benchmark performans karşılaştırması
- [ ] **Benchmark Data:** Benchmark fiyat verileri (gelecekte external API)

### 5. ❌ Taşıma Maliyeti (Cost Basis) Takibi Eksik

#### Mevcut Durum
- Sadece average_buy_price var
- FIFO, LIFO gibi cost basis metodları yok
- Realized gain/loss takibi yok

#### Eksikler
- [ ] **Cost Basis Tracking:** FIFO, LIFO, Average Cost metodları
- [ ] **Realized Gain/Loss:** Her transaction için kar/zarar hesaplama
- [ ] **Cost Basis Lots:** Her alım için ayrı lot takibi
- [ ] **Cost Basis Endpoint:** Cost basis bilgilerini döndüren endpoint

### 6. ❌ Analytics ve Raporlama Eksik

#### Mevcut Durum
- Temel CRUD işlemleri var
- Analytics endpoint'leri yok
- Performance metrikleri yok

#### Eksikler
- [ ] **Portfolio Analytics:** Toplam değer, performans, allocation
- [ ] **Asset Performance:** Asset bazında performans metrikleri
- [ ] **Transaction Analytics:** Transaction pattern analizi
- [ ] **Performance Over Time:** Zaman bazlı performans grafikleri

---

## 📋 Geliştirme Planı Özeti

### Phase 1: Database Schema Updates [HIGH Priority]
**Süre:** 1-2 gün

**Yapılacaklar:**
- Currency field'ları ekle (assets, transactions, portfolios)
- `initial_purchase_date` ekle (assets)
- `benchmark_symbol` ekle (portfolios)
- `realized_gain_loss` ekle (transactions)
- `notes` field'ları ekle
- `cost_basis_lots` table oluştur

**Migration Dosyaları:**
- `20251130120000_add_currency_support.sql`
- `20251130120001_add_benchmark_support.sql`
- `20251130120002_add_cost_basis_tracking.sql`

### Phase 2: SELL Transaction Enhancement [HIGH Priority]
**Süre:** 1-2 gün

**Yapılacaklar:**
- SELL transaction sonrası quantity azaltma
- Quantity validation (yeterli miktar kontrolü)
- Realized gain/loss hesaplama
- Zero quantity handling

**Güncellenecek Dosyalar:**
- `app/api/assets/[id]/transactions/route.ts`
- `lib/api/business-logic.ts`

### Phase 3: Historical Import [HIGH Priority]
**Süre:** 2-3 gün

**Yapılacaklar:**
- Bulk transaction import endpoint
- Asset creation from transactions
- Transaction sorting by date
- Quantity ve average price calculation

**Yeni Endpoint'ler:**
- `POST /api/portfolios/[id]/assets/import`
- `POST /api/assets/[id]/transactions/import`
- `POST /api/assets/[id]/transactions/bulk`

### Phase 4: Currency Support [MEDIUM Priority]
**Süre:** 1-2 gün

**Yapılacaklar:**
- Currency validation
- Multi-currency asset creation
- Portfolio base currency
- Currency enum/constants

**Güncellenecek Dosyalar:**
- `lib/types/portfolio.ts` (currency enum)
- Asset ve transaction endpoint'leri

### Phase 5: Cost Basis Tracking [MEDIUM Priority]
**Süre:** 2-3 gün

**Yapılacaklar:**
- FIFO cost basis calculation
- Average Cost method
- Cost basis lots management
- Realized gain/loss per transaction

**Yeni Endpoint:**
- `GET /api/assets/[id]/cost-basis`

### Phase 6: Benchmark Comparison [MEDIUM Priority]
**Süre:** 1-2 gün

**Yapılacaklar:**
- Benchmark symbol storage
- Benchmark comparison logic
- Performance comparison

**Yeni Endpoint:**
- `GET /api/portfolios/[id]/benchmark-comparison`

### Phase 7: Analytics Endpoints [LOW Priority]
**Süre:** 2-3 gün

**Yapılacaklar:**
- Portfolio analytics
- Asset performance metrics
- Transaction analytics

**Yeni Endpoint'ler:**
- `GET /api/portfolios/[id]/analytics`
- `GET /api/assets/[id]/performance`
- `GET /api/portfolios/[id]/transactions/analytics`

---

## 🎯 Öncelik Sıralaması

### Must Have (Hemen Yapılmalı)
1. ✅ **SELL Transaction Enhancement** - Kritik business logic
2. ✅ **Historical Import** - Geçmiş data import için gerekli
3. ✅ **Database Schema Updates** - Diğer özelliklerin temeli

### Should Have (Yakında Yapılmalı)
4. ⚠️ **Currency Support** - Multi-currency için gerekli
5. ⚠️ **Cost Basis Tracking** - Detaylı maliyet takibi
6. ⚠️ **Benchmark Comparison** - Performans kıyaslama

### Nice to Have (İleride)
7. 💡 **Analytics Endpoints** - Raporlama ve analiz

---

## 📊 Toplam Tahmini Süre

| Öncelik | Phase | Süre |
|---------|-------|------|
| HIGH | Phase 1: Database Updates | 1-2 gün |
| HIGH | Phase 2: SELL Enhancement | 1-2 gün |
| HIGH | Phase 3: Historical Import | 2-3 gün |
| MEDIUM | Phase 4: Currency Support | 1-2 gün |
| MEDIUM | Phase 5: Cost Basis | 2-3 gün |
| MEDIUM | Phase 6: Benchmark | 1-2 gün |
| LOW | Phase 7: Analytics | 2-3 gün |
| **TOPLAM** | | **10-17 gün** |

---

## 🔄 Mevcut API'ye Etkisi

### Breaking Changes
- ❌ **Yok** - Tüm değişiklikler backward compatible

### Yeni Özellikler
- ✅ Yeni endpoint'ler eklenecek
- ✅ Mevcut endpoint'ler genişletilecek (optional fields)
- ✅ Yeni business logic eklenecek

### Güncellenecek Endpoint'ler
- `POST /api/portfolios/[id]/assets` - `initial_purchase_date`, `currency` eklenecek
- `POST /api/assets/[id]/transactions` - SELL logic, `currency` eklenecek

---

## 📝 Detaylı Specification

Tam specification: `.specpulse/specs/002-portfolio-tracker/spec-003.md`

---

## 📋 Implementation Plan

Detaylı plan: `.specpulse/plans/002-portfolio-tracker/plan-003.md`

---

**Son Güncelleme:** 2025-11-30

