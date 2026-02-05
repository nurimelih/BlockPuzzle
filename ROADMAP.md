# BlockPuzzle Yol Haritası

## Mevcut Durum Özeti

| Alan | Durum |
|------|-------|
| Core Engine | ✅ Tamamlandı |
| State Management | ✅ Tamamlandı |
| GameScreen | ✅ Çalışıyor (refaktör gerekecek) |
| Navigation | ✅ Tamamlandı |
| Ses Efektleri | ✅ Çalışıyor |
| Haptic Feedback | ❌ Yok |
| Animasyonlar | ✅ Çalışıyor |
| Ekranlar | ✅ Temel ekranlar tamam, eksikler var |

---

## ~~FAZ 1: Temel Altyapı~~ ✅ Tamamlandı

### 1.1 Navigation Kurulumu
- [x] React Navigation kurulumu
- [x] Stack Navigator oluştur
- [x] Screen tanımları (Home, Game, LevelSelect, Settings)
- [x] Navigation types (TypeScript)

### 1.2 Tema Sistemi
- [x] Renk paleti dosyası oluştur (theme/colors.ts)
- [x] Typography tanımları
- [x] Spacing/sizing constants
- [x] AnimatedPiece'deki TODO'ları temizle

---

## FAZ 2: Ekranlar (Öncelik: Yüksek)

### 2.1 Home/Menu Screen ✅
- [x] Logo/başlık tasarımı
- [x] "Oyna" butonu → Level Select
- [ ] "Devam Et" butonu (kayıtlı oyun varsa)
- [x] "Ayarlar" butonu
- [x] Animasyonlu giriş efekti

### 2.2 Level Select Screen ✅
- [x] Grid layout (3x4 veya scroll)
- [x] Level kartları (numara, yıldız, kilit)
- [x] Kilitli level gösterimi
- [x] Tamamlanmış level işareti
- [x] Sayfa geçiş animasyonu

### 2.3 Settings Screen
- [x] Ses açık/kapalı toggle
- [x] Müzik açık/kapalı toggle
- [ ] Haptic açık/kapalı toggle
- [ ] Dil seçimi (opsiyonel)
- [ ] Hakkında/Credits

### 2.4 Win Screen İyileştirmesi (mevcut WinOverlay)
- [ ] Yıldız animasyonu (1-3 yıldız)
- [ ] Hamle sayısına göre puan
- [ ] Confetti/kutlama efekti
- [ ] Sosyal paylaşım butonu (opsiyonel)
- [ ] "Level Select" butonu ekle

---

## FAZ 3: Ses & Haptic (Öncelik: Orta)

### 3.1 Ses Sistemi Kurulumu ✅
- [x] expo-av kurulumu
- [x] SoundManager service oluştur
- [x] Ses dosyaları bul/oluştur (.mp3/.wav)
- [x] Preload sistemi

### 3.2 Ses Efektleri Entegrasyonu
- [ ] Parça seçme sesi (pickup.mp3)
- [ ] Parça bırakma sesi (drop.mp3)
- [x] Başarılı yerleştirme sesi (placed.mp3)
- [x] Döndürme sesi (rotated.mp3)
- [x] Level tamamlama sesi (win.mp3)
- [ ] Buton tıklama sesi (click.mp3)
- [x] Arka plan müziği

### 3.3 Haptic Feedback
- [ ] react-native-haptic-feedback kurulumu
- [ ] Parça seçiminde hafif titreşim
- [ ] Yerleştirmede orta titreşim
- [ ] Hatalı yerleştirmede error titreşim
- [ ] Level tamamlamada success titreşim

---

## FAZ 4: Animasyon İyileştirmeleri (Öncelik: Orta)

### 4.1 Parça Animasyonları
- [x] Seçilince scale 1.1 büyüme
- [ ] Seçilince hafif gölge artışı
- [x] Bırakınca scale 1.0 küçülme
- [x] Snap animasyonu (spring physics)
- [ ] Rotation animasyonu (Android'de düzeltilecek)

### 4.2 UI Animasyonları
- [x] Screen transition animasyonları
- [ ] Button press animasyonları
- [ ] Level kartı hover efekti
- [ ] Win overlay confetti

---

## FAZ 5: Veri Kalıcılığı (Öncelik: Düşük)

### 5.1 AsyncStorage Entegrasyonu
- [x] Tamamlanan leveller
- [ ] Her level için en iyi skor
- [x] Ayarlar (ses)
- [x] Son oynanan level

### 5.2 İstatistikler
- [ ] Toplam oynama süresi
- [ ] Toplam hamle sayısı
- [ ] Tamamlanan level sayısı

---

## FAZ 6: İçerik & Polish (Öncelik: Düşük)

### 6.1 Daha Fazla Level
- [x] Level 5-10 tasarla
- [ ] Zorluk progresyonu
- [ ] levelGenerator.ts kullan

### 6.2 Tutorial
- [ ] İlk açılışta tutorial
- [ ] Sürükle-bırak gösterimi
- [ ] Döndürme gösterimi
- [ ] Skip butonu

---

## Tasarım Önerileri

### Home Screen
```
┌─────────────────────┐
│                     │
│    🧩 BLOCK        │
│      PUZZLE        │
│                     │
│   ┌─────────────┐  │
│   │   ▶ OYNA    │  │
│   └─────────────┘  │
│                     │
│   ┌─────────────┐  │
│   │  ⚙ AYARLAR │  │
│   └─────────────┘  │
│                     │
│      v1.0.0        │
└─────────────────────┘
```

### Level Select Screen
```
┌─────────────────────┐
│  ← LEVEL SEÇ       │
├─────────────────────┤
│ ┌───┐ ┌───┐ ┌───┐  │
│ │ 1 │ │ 2 │ │ 3 │  │
│ │⭐⭐⭐│ │⭐⭐ │ │⭐  │  │
│ └───┘ └───┘ └───┘  │
│                     │
│ ┌───┐ ┌───┐ ┌───┐  │
│ │ 4 │ │🔒5│ │🔒6│  │
│ │   │ │   │ │   │  │
│ └───┘ └───┘ └───┘  │
└─────────────────────┘
```

### Win Overlay (İyileştirilmiş)
```
┌─────────────────────┐
│                     │
│    ⭐ ⭐ ⭐         │
│                     │
│   LEVEL 3          │
│   TAMAMLANDI!      │
│                     │
│   Hamle: 12        │
│   Puan: 850        │
│                     │
│  ┌──────────────┐  │
│  │ SONRAKİ LEVEL│  │
│  └──────────────┘  │
│  ┌──────────────┐  │
│  │ LEVEL SEÇİM  │  │
│  └──────────────┘  │
└─────────────────────┘
```
