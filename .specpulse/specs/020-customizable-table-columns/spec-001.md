# Specification: Customizable Table Columns

<!-- FEATURE_DIR: 020-customizable-table-columns -->
<!-- FEATURE_ID: 020 -->
<!-- SPEC_NUMBER: 001 -->
<!-- STATUS: completed -->
<!-- COMPLETED: 2026-01-26 -->
<!-- CREATED: 2026-01-26 -->

## Description

Portföy varlıklar sayfasındaki tabloda kullanıcıların kolonların sıralamasını değiştirebilmesi ve kolonları ekleyip çıkarabilmesi için özelleştirme imkanı sağlanacak. Bu özellik kullanıcıların kendi tercihlerine göre tablo görünümünü kişiselleştirmesine olanak tanıyacak.

## Current State

Mevcut `SortableAssetsTable` bileşeni şu kolonlara sahip (sabit sıralama):
1. # (Sıra numarası)
2. Sembol
3. Son Fiyat
4. Ağırlık
5. Değer
6. Maliyet
7. G/Z (Kar/Zarar tutarı)
8. G/Z % (Kar/Zarar yüzdesi)
9. Günlük (Günlük değişim)
10. Kategori
11. Aksiyon (Al/Sat butonları)

## Requirements

### Functional Requirements

- [ ] **FR-001**: Kullanıcı tablo kolonlarının sırasını sürükle-bırak ile değiştirebilmeli
- [ ] **FR-002**: Kullanıcı kolonları gizleyebilmeli (görünmez yapabilmeli)
- [ ] **FR-003**: Kullanıcı gizlenmiş kolonları tekrar görünür yapabilmeli
- [ ] **FR-004**: Kolon tercihleri kullanıcı bazında localStorage'da saklanmalı
- [ ] **FR-005**: Kolon tercihleri portföy bazında bağımsız olmalı (her portföy farklı konfigürasyona sahip olabilmeli)
- [ ] **FR-006**: "Varsayılana Sıfırla" butonu ile orijinal kolon düzenine dönülebilmeli
- [ ] **FR-007**: Minimum kolon gereksinimi: Sembol ve Aksiyon kolonları her zaman görünür olmalı
- [ ] **FR-008**: Kolon özelleştirme menüsü tablo başlığında bir ayar ikonu ile açılabilmeli

### Non-Functional Requirements

- **Performance**: Kolon sürükle-bırak işlemi 60fps render performansı sağlamalı
- **Persistence**: localStorage kullanılarak tercihler kalıcı olmalı
- **Accessibility**: Sürükle-bırak işlemi klavye ile de yapılabilmeli (a11y)
- **Responsive**: Mobil cihazlarda kolon gizleme özelliği özellikle önemli

## Acceptance Criteria

- [ ] Given kullanıcı varlıklar tablosuna baktığında, when ayar ikonuna tıkladığında, then kolon yönetim paneli açılmalı
- [ ] Given kolon yönetim paneli açıkken, when kullanıcı bir kolonu sürükleyip başka bir konuma bıraktığında, then kolonlar yeni sırayla görüntülenmeli
- [ ] Given kolon yönetim panelinde, when kullanıcı bir kolonun yanındaki checkbox'ı kaldırdığında, then o kolon tablodan gizlenmeli
- [ ] Given sayfa yeniden yüklendiğinde, when varlıklar tablosu render edildiğinde, then önceki kolon tercihleri korunmuş olmalı
- [ ] Given farklı portföylerde, when kullanıcı farklı kolon konfigürasyonları ayarladığında, then her portföy kendi konfigürasyonunu korumalı
- [ ] Given "Varsayılana Sıfırla" butonuna tıklandığında, when tablo yeniden render edildiğinde, then orijinal kolon düzeni geri gelmeli

## Technical Considerations

### Dependencies

- **External APIs**: Yok
- **Database Changes**: Yok (localStorage kullanılacak)
- **Third-party Libraries**:
  - `@dnd-kit/core` ve `@dnd-kit/sortable` - Sürükle-bırak için
  - Alternatif: `react-beautiful-dnd` (daha fazla bundle size)

### Data Structure

```typescript
interface ColumnConfig {
  id: string;           // Unique column identifier
  label: string;        // Display name
  visible: boolean;     // Show/hide toggle
  sortable: boolean;    // Can be sorted
  required: boolean;    // Cannot be hidden (symbol, action)
  order: number;        // Position in table
  align?: 'left' | 'right' | 'center';
  minWidth?: string;
  responsiveHide?: string; // CSS breakpoint class for auto-hide
}

interface TablePreferences {
  portfolioId: string;
  columns: ColumnConfig[];
  lastUpdated: string;
}

// localStorage key: `table-prefs-${portfolioId}`
```

### Implementation Notes

1. **Column Configuration Component**
   - `ColumnConfigPanel` - Kolon yönetim paneli (dropdown/popover)
   - Checkbox listesi ile göster/gizle
   - Drag handle ile sıralama

2. **Drag-and-Drop Implementation**
   - `@dnd-kit/core` kullanılacak (daha hafif, React 18 uyumlu)
   - Tablo başlıkları sürüklenebilir olacak
   - Drop preview ile görsel feedback

3. **Persistence Layer**
   - Custom hook: `useTablePreferences(portfolioId)`
   - localStorage read/write
   - Default columns fallback

4. **Migration Path**
   - Mevcut responsive hide class'ları (sm:hidden, lg:hidden vb.) varsayılan olarak korunacak
   - Kullanıcı tercihi bu varsayılanları override edecek

## Testing Strategy

- **Unit Tests**:
  - `useTablePreferences` hook'u için testler
  - Kolon sıralama logic'i için testler
  - localStorage read/write testleri

- **Integration Tests**:
  - Kolon yönetim paneli açma/kapama
  - Kolon gizleme/gösterme
  - Sıralama değişikliği

- **End-to-End Tests**:
  - Tam kullanıcı akışı: Panel aç -> kolon gizle -> sayfa yenile -> tercih korunmuş mu
  - Farklı portföyler arası geçiş

## Definition of Done

- [ ] Tüm functional requirements implement edildi
- [ ] Tüm acceptance criteria karşılandı
- [ ] Unit testler yazıldı ve geçiyor
- [ ] Integration testler yazıldı ve geçiyor
- [ ] Kod review yapıldı ve onaylandı
- [ ] Responsive tasarım test edildi
- [ ] Accessibility (a11y) test edildi

## UI/UX Design Notes

### Kolon Yönetim Paneli
- Tablo sağ üst köşesinde `Cog6ToothIcon` veya `AdjustmentsHorizontalIcon`
- Tıklandığında popover/dropdown açılır
- İçerik:
  - Başlık: "Tablo Kolonları"
  - Checkbox + Drag handle listesi
  - "Varsayılana Sıfırla" butonu (altta)

### Görsel Feedback
- Sürüklenen kolon için opaklık azaltma
- Drop zone highlight
- Smooth transition animasyonları

## Out of Scope

- Sunucu taraflı tercih saklama (gelecekte eklenebilir)
- Kolon genişliği özelleştirme (resize)
- Kolon içerik filtreleme
- Özel kolon ekleme (kullanıcı tanımlı)

## Additional Notes

- Bu özellik sadece varlıklar tablosu için geçerli olacak, diğer tablolara genişletilebilir
- Mobil cihazlarda varsayılan olarak daha az kolon gösterilecek şekilde devam edilecek
- Dark mode tam uyumlu olmalı
