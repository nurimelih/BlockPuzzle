# Block Puzzle Engine / Game
Block Puzzle Ancient tarzı, serbest yerleştirmeli puzzle oyunlarından esinlendim.
Bu proje mimari bir showcase olarak başladı, zamanla gerçek bir mobil oyuna dönüştü.

[![Google Play](https://img.shields.io/badge/Google_Play-İndir-green?logo=google-play)](https://play.google.com/store/apps/details?id=com.nurimelih.blockpuzzle)


<img width="200" height="580"  src="https://github.com/user-attachments/assets/2f08e5b9-482d-4dd4-b13a-3a10d04a0b6d" />
<img width="200" height="580"  src="https://github.com/user-attachments/assets/f5521fe3-2558-424a-bdce-39d30d41d3c5"  />
<img width="200" height="580"  src="https://github.com/user-attachments/assets/c6340510-90f9-4ba9-a97b-5e677aa27709" />

---

- UI'dan tamamen bağımsız bir oyun core'u (engine) tasarlamak
- Oyun kuralları, state ve render katmanlarını kesin sınırlarla ayırmak
- Basit bir oyundan ziyade, her katmanın kendi işini yaptığı bir tasarım oluşturmak ve gerekliliğine cevap verebilmek.


---
# Mimari Yapı
## 1. Core (Engine / Domain Logic)
- React / React Native bilmez
- UI bilmez
- State bilmez
- Sadece kurallar ve matematik içerir

**Sorumluluklar:**
- Parça yerleştirilebilir mi `canPlace`
- Yerleştirme ayarlaması `getAdjustedPlacement`
- Rotasyon ve matrix dönüşümleri
- Board sınır ve çakışma kontrolleri
- Backtracking solver ile level doğrulama

Core tamamen platform bağımsızdır.
Web, RN, desktop veya Node ortamında çalışabilir.

**Not:**
- Board doluluk state'i tutmaz, orası dummy bir uzay.
- Çakışma kontrolü, dışarıdan verilen `occupiedCells` üzerinden yapılır.
- Core, tek bir "mutlak truth" dayatmaz; parametriktir.

Şöyle düşündüm; board bir toprak, puzzle parçaları ise o toprağa yerleşen insanlar.
Yeni bir parça yerleşmek istediğinde board'a değil, teker teker diğer insanlara
"sen neredesin" diye soruyor.
Bunun sebebi board'un sadece bu tarz bir block-puzzle değil,
başka tür oyunlarda da kullanılabilecek olması.
---

## 2. State Katmanı
- Oyunun hafızası burada tutulur
- UI ile Core arasındaki tek giriş kapısı

**Bu katmanın amacı ve sorumlulukları:**
- Puzzle parçaları bilgisi ve yönetimi
- `baseMatrix`, rotation, pozisyon gibi bilgiler
- `tryPlacePiece` core'a tek giriş yolu
- `occupiedCells` üretimi ve matrix normalizasyonu
- UI'nın Core'a doğrudan erişimini engellemek

UI, `canPlace` gibi kuralları asla doğrudan çağırmaz.
Onun yerine `tryPlacePiece` gibi giriş yollarını bu state üzerinden kullanır.
---

## 3. UI Katmanı (React Native)
- Render
- Gesture (PanResponder ile drag & drop)
- Animasyon (Reanimated 4)

Başka hiçbir şey bilmez.
- Board mantığını bilmez
- Çakışma hesabı yapmaz
- Kurallara dair karar vermez

Sadece data iletir ve gelen dataya göre elementleri render eder.
UI yalnızca şu istekleri iletir:
- konum
- rotation
- etkileşim

Karar State + Core tarafından verilir.
---

# Bilinçli Tasarım Kararları
- Anchor noktası her zaman `matrix[0][0]`
- UI'dan gelen koordinatlar Core'a normalize edilerek aktarılır
- Gravity, line clear, klasik Tetris kuralları yok.
  Zaten bu bir tetris oyunu değil, tetris parçaları kullanılan bir puzzle oyunu.
Bu engine serbest yerleştirmeli puzzle kuralları için tasarlanmıştır.
---

# Özellikler
- Offline leveller + Supabase üzerinden remote level desteği
- Günlük bulmaca ve streak takibi
- Liderboard
- Arka plan müziği + ses efektleri
- Rewarded & interstitial reklamlar (Google Mobile Ads)
- Analytics (PostHog, session replay dahil)
- i18n: Türkçe / İngilizce
- Expo üzerinden OTA güncelleme
---

# Teknoloji
| Katman | Teknoloji |
|---|---|
| Runtime | React Native 0.81 + Expo 54 |
| Dil | TypeScript 5.8 |
| State | Zustand + custom hooks |
| Animasyonlar | react-native-reanimated 4 |
| Backend | Supabase (level, ayarlar) |
| Analytics | PostHog |
| Reklamlar | Google Mobile Ads |
| Ses | expo-av |
---

# Proje Durumu
- iOS App Store ve Google Play'de yayında
- Mimari stabil, core'un React bağımlılığı yok
- Levellar Supabase üzerinden uzaktan teslim ediliyor; uygulama güncellemesi gerekmeden yeni level eklenebiliyor
---

# Neden böyle bir proje yapmayı düşündüm?
Bu repo şunu göstermek için var:
- Katmanlı mimari nasıl kurulur
- Engine UI'dan nasıl izole edilir
- State neden "tek kapı" olmalıdır
- Küçük bir problem alanı, nasıl temiz bir tasarıma dönüştürülür

Oyun oynamak için değil, kodu okumak ve mimariyi incelemek için.
Başta sevdiğim basit bir oyunu taklit etmek istedim,
ama sonra katmanlı bir örneğine çevirip yayına aldım.
