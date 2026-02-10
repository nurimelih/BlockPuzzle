# Block Puzzle Engine / Game
Block Puzzle Ancient tarzı, serbest yerleştirmeli puzzle oyunlarından esinlendim.
Bu proje bir oyun demosu değil, engine + mimari showcase'i.
- UI’dan tamamen bağımsız bir oyun core’u (engine) tasarlamak
- Oyun kuralları, state ve render katmanlarını kesin sınırlarla ayırmak
- Basit bir oyundan ziyade, her katmanın kendi işini yaptığı bir tasarım oluşturmak ve gerekliliğine cevap verebilmek.
---


<img width="282" height="633" alt="IMG_0935" src="https://github.com/user-attachments/assets/04c52fc5-b4ff-4e2c-9f0b-4fb9f6c4e81d" />
<img width="282" height="633" alt="IMG_0938" src="https://github.com/user-attachments/assets/6fa16866-c9e4-43e0-904c-b2c45ee158fc" />

# Mimari Yapı
## 1. Core (Engine / Domain Logic)
- React / React Native bilmez
- UI bilmez
- State bilmez
- Sadece kurallar ve matematik içerir
**Sorumluluklar:**
- Parça yerleştirilebilir mi `canPlace`)
- Matrix normalizasyonu `normalizePlacement`)
- Rotasyon ve matrix dönüşümleri
- Board sınır ve çakışma kontrolleri
Core tamamen platform bağımsızdır.  
Web, RN, desktop veya Node ortamında çalışabilir.  
İleride daha da geliştirip ayrı bir paket haline getirmeyi düşünüyorum.
**Not:**
- Board doluluk state’i tutmaz, orası dummy bir uzay.
- Çakışma kontrolü, dışarıdan verilen `occupiedCells` üzerinden yapılır.
- Core, tek bir “mutlak truth” dayatmaz; parametriktir.
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
- UI’nın Core’a doğrudan erişimini engellemek
UI, `canPlace` gibi kuralları asla doğrudan çağırmaz.  
Onun yerine `tryPlacePiece` gibi giriş yollarını bu state üzerinden kullanır.
---
## 3. UI Katmanı (React Native)
- Render
- Gesture
- Animasyon
Başka hiçbir şey bilmez.
- Board mantığını bilmez
- Çakışma hesabı yapmaz
- Kurallara dair karar vermez
Sadece data iletir ve gelen dataya göre elementleri render eder.
UI yalnızca niyet iletir:
- konum
- rotation
- etkileşim
Karar State + Core tarafından verilir.
---
# Bilinçli Tasarım Kararları
- Anchor noktası her zaman `matrix[0][0]`
- UI’dan gelen koordinatlar Core’a normalize edilerek aktarılır
- Gravity, line clear, klasik Tetris kuralları yok.  
  Zaten bu bir tetris oyunu değil, tetris parçaları kullanılan bir puzzle oyunu.
Bu engine serbest yerleştirmeli puzzle kuralları için tasarlanmıştır.
---
# Proje Durumu
- Engine tarafı büyük oranda tamamlandı
- Mimari stabil, basit bir UI var ve debug amaçlı oynanabilir durumda
- UI geliştirmesi devam edecek  
  (drag, snap preview, animasyon, level, game-over, restart, undo, sesler, efektler)
Şu anki durumda core'a yeni bir kural eklemeyi öngörmüyorum.
---
# Neden böyle bir proje yapmayı düşündüm?
Bu repo şunu göstermek için var:
- Katmanlı mimari nasıl kurulur
- Engine UI’dan nasıl izole edilir
- State neden “tek kapı” olmalıdır
- Küçük bir problem alanı, nasıl temiz bir tasarıma dönüştürülür
Oyun oynamak için değil, kodu okumak ve mimariyi incelemek için.
Başta sevdiğim basit bir oyunu taklit etmek istedim,  
ama sonra katmanlı bir örneğine çevirdim.
