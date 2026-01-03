# Specification: Portfolio Copy-Paste Import

<!-- FEATURE_DIR: 007-portfolio-copy-paste-import -->
<!-- FEATURE_ID: 007 -->
<!-- SPEC_NUMBER: 001 -->
<!-- STATUS: approved -->
<!-- CREATED: 2026-01-03 -->
<!-- APPROACH: standard -->

## Description

Kullanıcıların Google Sheets veya Excel'den kopyaladıkları portföy verilerini tab-separated format olarak yapıştırarak hızlıca portföy oluşturabilmelerini veya mevcut portföye asset ekleyebilmelerini sağlayan özellik.

### Desteklenen Veri Formatı (Google Sheets/Excel'den kopyalama)

| Kolon | Açıklama | Zorunlu |
|-------|----------|---------|
| STOCK / Sembol | Hisse senedi sembolü (AGESA, ARCLK, vb.) | ✅ Evet |
| TOPLAM_ADET / Adet | Sahip olunan toplam adet | ✅ Evet |
| HISSE_BASI_ORTALAMA_MALIYET / Ortalama Fiyat | Ortalama alış fiyatı | ✅ Evet |
| TOPLAM_MALIYET | Toplam maliyet (hesaplanabilir) | ❌ Hayır |
| TOPLAM_DEĞER | Güncel toplam değer | ❌ Hayır |
| Yüzde | Portföy içindeki ağırlık | ❌ Hayır |
| SEKTOR | Sektör bilgisi | ❌ Hayır |

### Kullanıcı Senaryosu

1. Kullanıcı Google Sheets'te portföyünü takip ediyor
2. Tüm satırları seçip kopyalıyor (Ctrl+C)
3. Uygulamada "Import" butonuna tıklıyor
4. Açılan modal'a yapıştırıyor (Ctrl+V)
5. Önizleme tablosunda verilerini görüyor
6. Kolon eşleştirmelerini onaylıyor
7. "Import" butonuna tıklayarak tüm asset'leri ekliyor

## Requirements

### Functional Requirements

#### Must Have (P0)
- [ ] FR-001: Kullanıcı textarea'ya tab-separated veri yapıştırabilmeli
- [ ] FR-002: Sistem ilk satırı header olarak algılayabilmeli
- [ ] FR-003: Zorunlu kolonlar (symbol, quantity, average_price) eşleştirilebilmeli
- [ ] FR-004: Yapıştırılan veri önizleme tablosunda gösterilmeli
- [ ] FR-005: Her satır için doğrulama yapılmalı (geçerli sayı, boş değer kontrolü)
- [ ] FR-006: Geçerli satırlar yeşil, hatalı satırlar kırmızı gösterilmeli
- [ ] FR-007: Import butonu ile tüm geçerli asset'ler oluşturulmalı
- [ ] FR-008: Import sonrası başarı/hata özeti gösterilmeli

#### Should Have (P1)
- [ ] FR-009: Akıllı kolon algılama (STOCK, Sembol, Symbol → symbol)
- [ ] FR-010: Mevcut asset'lerle çakışma kontrolü ve uyarı
- [ ] FR-011: Türkçe sayı formatı desteği (1.000,50 → 1000.50)
- [ ] FR-012: TRY suffix'i otomatik temizleme (160.950,00 TRY → 160950.00)
- [ ] FR-013: Import işlemi sırasında loading state gösterimi
- [ ] FR-014: Her asset için BUY transaction otomatik oluşturma

#### Could Have (P2)
- [ ] FR-015: Manuel kolon eşleştirme dropdown'ları
- [ ] FR-016: Sektör bilgisini asset'e ekleme (metadata olarak)
- [ ] FR-017: Import geçmişi görüntüleme
- [ ] FR-018: Son kullanılan kolon eşleştirmelerini hatırlama

#### Won't Have (Bu versiyon için)
- CSV/Excel dosya yükleme (sadece copy-paste)
- Otomatik fiyat güncelleme
- Birden fazla portföye aynı anda import

## User Stories

### US-001: İlk Kez Import Yapan Kullanıcı
**As a** yeni kullanıcı  
**I want to** Google Sheets'teki portföyümü kopyala-yapıştır ile aktarmak  
**So that** tek tek asset eklemek zorunda kalmayayım

**Acceptance Criteria:**
- [ ] Given kullanıcı portföy detay sayfasındayken
- [ ] When "Import Assets" butonuna tıkladığında
- [ ] Then import modal'ı açılmalı ve textarea görünmeli
- [ ] And placeholder text nasıl yapıştırılacağını açıklamalı

### US-002: Veri Yapıştırma ve Önizleme
**As a** kullanıcı  
**I want to** yapıştırdığım veriyi önizleyebilmek  
**So that** import etmeden önce doğruluğunu kontrol edebileyim

**Acceptance Criteria:**
- [ ] Given kullanıcı textarea'ya veri yapıştırdığında
- [ ] When veri tab-separated formatta olduğunda
- [ ] Then otomatik olarak tablo formatında önizleme gösterilmeli
- [ ] And her kolon için algılanan tip (symbol, quantity, price, ignored) gösterilmeli
- [ ] And satır sayısı ve algılanan kolon sayısı bilgisi gösterilmeli

### US-003: Hata Kontrolü ve Geri Bildirim
**As a** kullanıcı  
**I want to** hatalı satırları görmek  
**So that** import etmeden önce düzeltebilmem veya atlayabileyim

**Acceptance Criteria:**
- [ ] Given önizleme tablosunda veriler gösterildiğinde
- [ ] When bir satırda eksik veya geçersiz veri varsa
- [ ] Then o satır kırmızı arka planla işaretlenmeli
- [ ] And hata mesajı satırın yanında gösterilmeli (örn: "Geçersiz sayı formatı")
- [ ] And hatalı satır sayısı özet olarak gösterilmeli

### US-004: Başarılı Import
**As a** kullanıcı  
**I want to** onayladığım verilerin asset olarak eklenmesini  
**So that** portföyümde görüntüleyebileyim

**Acceptance Criteria:**
- [ ] Given önizleme onaylandığında ve "Import" butonuna tıklandığında
- [ ] When tüm geçerli satırlar işlendiğinde
- [ ] Then her satır için yeni asset oluşturulmalı
- [ ] And her asset için ilgili miktarda BUY transaction kaydedilmeli
- [ ] And başarı mesajı gösterilmeli: "X asset başarıyla eklendi"
- [ ] And modal kapanmalı ve portföy listesi güncellenmiş olmalı

### US-005: Mevcut Asset Çakışması
**As a** kullanıcı  
**I want to** aynı sembole sahip asset varsa uyarı almak  
**So that** yanlışlıkla duplicate oluşturmayayım

**Acceptance Criteria:**
- [ ] Given import edilecek veri mevcut bir asset sembolünü içeriyorsa
- [ ] When önizleme gösterildiğinde
- [ ] Then çakışan satırlar sarı arka planla işaretlenmeli
- [ ] And "Bu sembol zaten mevcut. Eklenecek mi?" seçeneği sunulmalı
- [ ] And kullanıcı "Atla" veya "Yine de ekle" seçebilmeli

## Technical Considerations

### Dependencies
- **External APIs**: Yok (sadece internal API kullanımı)
- **Database Changes**: Yok (mevcut assets ve transactions tabloları kullanılacak)
- **Third-party Libraries**: 
  - Mevcut UI component'ları yeterli (Dialog, Table, Button)
  - Opsiyonel: `papaparse` veya benzeri CSV parser (ileride dosya yükleme için)

### API Endpoints

#### Mevcut Endpoint Kullanımı
```
POST /api/portfolios/[id]/assets
Body: { symbol, quantity, average_buy_price, type }

POST /api/assets/[id]/transactions  
Body: { type: "BUY", amount, price, date }
```

#### Yeni Endpoint (Opsiyonel - Batch Import)
```
POST /api/portfolios/[id]/assets/import
Body: {
  assets: [
    { symbol, quantity, average_buy_price, type },
    ...
  ]
}
Response: {
  success: true,
  imported: 15,
  failed: 2,
  errors: [
    { row: 5, error: "Invalid symbol" }
  ]
}
```

### Frontend Components

```
components/
  portfolios/
    import-assets-dialog.tsx    # Ana import modal
    import-preview-table.tsx    # Önizleme tablosu
    column-mapper.tsx           # Kolon eşleştirme (P2)
```

### Data Parsing Logic

```typescript
interface ParsedRow {
  symbol: string;
  quantity: number;
  averagePrice: number;
  isValid: boolean;
  errors: string[];
  isDuplicate: boolean;
}

function parseClipboardData(text: string): ParsedRow[] {
  // 1. Satırlara böl
  // 2. Tab karakteri ile kolonlara böl
  // 3. İlk satırı header olarak algıla
  // 4. Kolon eşleştirmesi yap
  // 5. Her satırı parse et ve doğrula
}

function detectColumnType(headerName: string): ColumnType {
  // STOCK, Sembol, Symbol → 'symbol'
  // TOPLAM_ADET, Adet, Quantity → 'quantity'
  // HISSE_BASI_ORTALAMA_MALIYET, Ortalama, Avg Price → 'averagePrice'
  // Diğerleri → 'ignored'
}

function parseNumber(value: string): number {
  // "1.000,50" → 1000.50
  // "160.950,00 TRY" → 160950.00
  // "1,000.50" → 1000.50 (US format)
}
```

### Implementation Notes

1. **Clipboard Parsing**: Kullanıcı Ctrl+V yaptığında textarea'ya yapışan veri tab-separated olacak
2. **Auto-detection**: İlk satır header olarak kabul edilecek, kolon isimleri fuzzy match ile eşleştirilecek
3. **Number Parsing**: Hem TR (1.000,50) hem US (1,000.50) formatları desteklenmeli
4. **Batch vs Sequential**: İlk versiyonda sequential API çağrıları, sonra batch endpoint
5. **Error Recovery**: Bir satır hata verirse diğerleri etkilenmemeli

## Testing Strategy

### Unit Tests
- [ ] `parseClipboardData` fonksiyonu - farklı formatlar
- [ ] `detectColumnType` fonksiyonu - header algılama
- [ ] `parseNumber` fonksiyonu - TR/US formatları
- [ ] Validation logic - zorunlu alan kontrolü

### Integration Tests
- [ ] Import modal açılma/kapanma
- [ ] API çağrıları ve response handling
- [ ] Error state yönetimi
- [ ] Success flow - asset oluşturma

### End-to-End Tests
- [ ] Tam import flow - yapıştır → önizle → onayla → kontrol et
- [ ] Hata durumu - geçersiz veri yapıştırma
- [ ] Duplicate asset uyarısı

## UI/UX Specifications

### Import Button Location
- Portföy detay sayfasında, asset listesinin üstünde
- "Add Asset" butonunun yanında "Import" butonu

### Modal Layout
```
┌─────────────────────────────────────────────────────────┐
│  Import Assets from Spreadsheet                      [X] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Paste your data here...                          │   │
│  │                                                  │   │
│  │ (Tab-separated data from Excel/Google Sheets)   │   │
│  │                                                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ─────────────── Preview ───────────────                │
│                                                         │
│  ┌──────┬─────────┬──────────┬───────────────┐         │
│  │ Symbol│ Quantity │ Avg Price │ Status       │         │
│  ├──────┼─────────┼──────────┼───────────────┤         │
│  │ AGESA │   750   │  214.60  │ ✓ Valid       │         │
│  │ ARCLK │   800   │   44.09  │ ✓ Valid       │         │
│  │ BIMAS │   197   │  210.89  │ ⚠ Exists      │         │
│  │ XXXXX │   abc   │  100.00  │ ✗ Invalid qty │         │
│  └──────┴─────────┴──────────┴───────────────┘         │
│                                                         │
│  Found: 20 rows | Valid: 18 | Errors: 1 | Duplicates: 1│
│                                                         │
│                              [Cancel]  [Import 18 Assets]│
└─────────────────────────────────────────────────────────┘
```

### Color Coding
- ✅ **Yeşil**: Geçerli satır, import edilecek
- ⚠️ **Sarı**: Mevcut asset ile çakışıyor, kullanıcı kararı gerekiyor
- ❌ **Kırmızı**: Geçersiz veri, import edilmeyecek
- ⬜ **Gri**: Görmezden gelinen kolonlar

## Definition of Done

- [ ] Tüm P0 (Must Have) gereksinimleri implement edildi
- [ ] Tüm acceptance criteria karşılandı
- [ ] Unit testler yazıldı ve geçiyor (%80+ coverage)
- [ ] Integration testler yazıldı ve geçiyor
- [ ] Code review yapıldı ve onaylandı
- [ ] Manuel test yapıldı (happy path + error cases)
- [ ] Responsive tasarım kontrol edildi
- [ ] Loading states ve error handling test edildi
- [ ] PR oluşturuldu ve merge edildi

## Success Metrics

- Kullanıcı 20 asset'i 30 saniye içinde import edebilmeli
- Hata oranı %5'in altında olmalı
- Import sonrası asset'ler doğru quantity ve price ile görüntülenmeli

## Out of Scope

- CSV/Excel dosya yükleme (gelecek versiyon)
- Otomatik fiyat çekme
- Çoklu portföy import
- Export fonksiyonu
- Transaction geçmişi import (sadece anlık pozisyon)

## Additional Notes

### Örnek Veri Formatı (Google Sheets'ten kopyalama)

```
STOCK	Yüzde	TOPLAM_ADET	TOPLAM_MALIYET	HISSE_BASI_ORTALAMA_MALIYET	TOPLAM_DEĞER	SEKTOR
AGESA	1,56%	750	160.950,00 TRY	214,60 TRY	161.625,00 TRY	Sigorta
ARCLK	0,81%	800	35.273,00 TRY	44,09 TRY	83.920,00 TRY	Beyaz Eşya
BIMAS	1,04%	197	41.544,50 TRY	210,89 TRY	106.971,00 TRY	Market
```

### Kolon Algılama Eşleştirmeleri

| Girdi | Algılanan Tip |
|-------|---------------|
| STOCK, Sembol, Symbol, Ticker, Hisse | `symbol` |
| TOPLAM_ADET, Adet, Quantity, Miktar, Lot | `quantity` |
| HISSE_BASI_ORTALAMA_MALIYET, Ortalama, Avg, Average, Maliyet | `averagePrice` |
| SEKTOR, Sector, Sektör | `sector` (opsiyonel) |
| Diğerleri | `ignored` |
