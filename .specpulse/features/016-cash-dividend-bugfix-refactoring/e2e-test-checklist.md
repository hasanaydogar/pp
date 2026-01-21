# E2E Test Checklist - Feature 016

## Nakit Bakiyesi Testleri

### TC-001: Para Yatırma
- [ ] Nakit sayfasına git
- [ ] "Nakit Ekle" butonuna tıkla
- [ ] DEPOSIT tipi seç, 550.000 TL gir
- [ ] Kaydet
- [ ] **Beklenen**: Mevcut Nakit kartı ₺550.000 göstermeli
- [ ] **Beklenen**: Nakit Hareketleri listesinde +₺550.000 görünmeli

### TC-002: Para Çekme
- [ ] "Nakit Ekle" butonuna tıkla
- [ ] WITHDRAW tipi seç, 50.000 TL gir
- [ ] Kaydet
- [ ] **Beklenen**: Mevcut Nakit ₺500.000 olmalı (550K - 50K)
- [ ] **Beklenen**: Nakit Hareketleri'nde -₺50.000 görünmeli

### TC-003: Temettü Kaydı → Nakit Artışı
- [ ] "Temettü Kaydet" butonuna tıkla
- [ ] Bir varlık seç, brüt tutar gir (örn: 1.000 TL)
- [ ] Vergi oranını gir (örn: %10)
- [ ] Kaydet
- [ ] **Beklenen**: Mevcut Nakit 900 TL artmalı (net temettü)
- [ ] **Beklenen**: Dönem Temettü kartı güncel değeri göstermeli

## Dönem Seçici Testleri

### TC-004: Dönem Değiştirme
- [ ] Dönem seçiciyi "Son 7 Gün" olarak değiştir
- [ ] **Beklenen**: Grafik ve istatistikler son 7 güne göre güncellenmeli
- [ ] Dönem seçiciyi "Bu Yıl" olarak değiştir
- [ ] **Beklenen**: Yıl başından bugüne kadar olan veriler görünmeli

### TC-005: Dönem Bazlı Temettü Hesaplama
- [ ] "Son 30 Gün" seç
- [ ] **Beklenen**: Dönem Temettü kartı sadece son 30 günün temettülerini göstermeli

## Grafik Testleri

### TC-006: Nakit Akış Grafiği
- [ ] Grafik yüklendiğinde
- [ ] **Beklenen**: Bakiye çizgisi görünmeli
- [ ] **Beklenen**: Tooltip ile tarih ve bakiye detayları görünmeli

### TC-007: İleri Tarihli Veriler (Forecast)
- [ ] "Beklenti Ekle" ile gelecek tarihli temettü ekle
- [ ] **Beklenen**: Grafik ileri tarihe kadar uzamalı
- [ ] **Beklenen**: Beklenen veriler kesik çizgi ile gösterilmeli
- [ ] **Beklenen**: "Bugün" referans çizgisi görünmeli

## Manuel Forecast Testleri

### TC-008: Temettü Beklentisi Ekleme
- [ ] "Beklenti Ekle" butonuna tıkla
- [ ] Varlık seç
- [ ] Hisse başı tutar gir (örn: 2,50 TL)
- [ ] Beklenen ödeme tarihini seç (gelecek bir tarih)
- [ ] Kaydet
- [ ] **Beklenen**: Temettü Takviminde beklenti görünmeli
- [ ] **Beklenen**: Beklenen Temettü kartı güncellenmeli

### TC-009: Beklenti Silme
- [ ] Temettü takviminde bir beklentiyi bul
- [ ] Sil butonuna tıkla
- [ ] **Beklenen**: Beklenti listeden kaldırılmalı

## İşlem Silme Testleri

### TC-010: Nakit İşlemi Silme
- [ ] Nakit Hareketleri'nden bir işlemi sil
- [ ] **Beklenen**: Mevcut Nakit bakiyesi tersine güncellenmeli
- [ ] **Beklenen**: İşlem listeden kaldırılmalı

## Edge Cases

### TC-011: Boş Durum
- [ ] Hiç nakit işlemi olmayan portföyde
- [ ] **Beklenen**: "Henüz nakit hareketi yok" mesajı görünmeli
- [ ] **Beklenen**: Mevcut Nakit ₺0 göstermeli

### TC-012: Çoklu Para Birimi
- [ ] Farklı para birimlerinde nakit pozisyonları varsa
- [ ] **Beklenen**: Tüm pozisyonlar gösterim para birimine çevrilmeli

---

## Test Sonuçları

| Test ID | Sonuç | Notlar |
|---------|-------|--------|
| TC-001  | [ ]   |        |
| TC-002  | [ ]   |        |
| TC-003  | [ ]   |        |
| TC-004  | [ ]   |        |
| TC-005  | [ ]   |        |
| TC-006  | [ ]   |        |
| TC-007  | [ ]   |        |
| TC-008  | [ ]   |        |
| TC-009  | [ ]   |        |
| TC-010  | [ ]   |        |
| TC-011  | [ ]   |        |
| TC-012  | [ ]   |        |

**Test Tarihi**: ________________
**Tester**: ________________
**Genel Sonuç**: [ ] PASS / [ ] FAIL
