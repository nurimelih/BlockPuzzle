# BlockPuzzle Todo List

## Kritik Buglar

## Refaktör: GameScreen temizliği
GameScreen her şeyi kendisi yapıyor - ses, reklam, storage, analytics, gesture, timer, render hepsi aynı dosyada. Yeni bir şey eklemeye kalkınca neyin nereye bağlı olduğunu takip etmek zorlaşıyor.

- [ ] Ses, reklam, storage çağrılarını kendi hook'larına taşı (useSound, useAds, useGameSave gibi)
- [ ] Gesture/PanResponder mantığını ayrı hook'a çıkar
- [ ] Board, pieces, header render bloklarını alt component yap


## Eksik Ekranlar
- [ ] **Leader board ekranı** - Son skorları ya da yüksek skorları göster. Kullanıcıda online hissi oluşacak. Skorları isimleriyle kaydet.
- [ ] **Kullanıcı adı girme ekranı** - kullanıcı skor yaptıktan sonra ismini kaydetmek ve paylaşmak isterse bunun için basit bir isim input'u oluştur overlay şeklinde 


## Ses & Haptic

- [ ] **Haptic feedback** - react-native-haptic-feedback kur, parça seçim/yerleştirme/hata titreşimleri

## Veri Kalıcılığı

- [ ] **Game progress persistence** - En iyi skorlar. Bunları supabase'e yaz ve orada oku

## UI/UX İyileştirmeleri

- [ ] **Win overlay iyileştirmesi** - Yıldız rating (hamle sayısına göre), confetti animasyonu

## Refactoring

- [ ] **PanResponder → Gesture Handler refactor** - GameScreen'de çok fazla ref kullanımı var (activePieceIdRef, uiPositionsRef, piecesRef vb.). PanResponder closure problemi yüzünden ref'ler zorunlu. react-native-gesture-handler + reanimated'ın useAnimatedGestureHandler'ına geçilmeli. Shared value'lar ile ref'lere gerek kalmaz, kod daha temiz ve React paradigmasına uygun olur.

## İçerik

- [ ] **Daha fazla level** - 10 level var, diğerleri supabase'den geliyor çeşitlendir ve arttır
- [ ] **Tutorial/onboarding** - İlk açılışta sürükle-bırak ve döndürme gösterimi

## Düşünülecek

- [ ] **Prosedürel level üretimi** - Solver fonksiyonunu kullanarak rastgele board + piece kombinasyonlarından otomatik level oluşturma. Sonsuz mod veya günlük challenge için kullanılabilir. Elle tasarlanmış leveller bitmeye başlayınca değerlendir. Ters yaklaşım daha verimli olabilir (önce piece'leri board'a yerleştir, board'u onlardan türet).

---

## Tamamlananlar

- [x] Navigation kurulumu
- [x] Home Screen
- [x] Settings Screen
- [x] Tema sistemi (colors, spacing, typography)
- [x] SoundManager kurulumu (react-native-audio-api)
- [x] Background müzik
- [x] Rotation animasyonu
- [x] LevelSelectScreen - Grid layout, level kartları, kilit/yıldız gösterimi
- [x] Timer memory leak fix & pause desteği
- [x] Ses efektleri bağlantısı (place/rotate/win)
- [x] Parça scale animasyonu
- [x] Level geçiş animasyonu
- [x] AsyncStorage ile tamamlanan leveller
- [x] Settings persistence - Ses/müzik ayarları kaydet
