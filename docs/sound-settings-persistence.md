# Ses Ayarları Persistence

## Ne yapıldı

Ses ayarları (müzik on/off, efekt on/off, müzik volume, efekt volume) AsyncStorage'a kaydedilip uygulama açılışında geri yükleniyor.

## Yapı

**GameStorage.ts** - `SoundSettings` tipi ve tek bir JSON objesi olarak `soundSettings` key'ine yazılıyor:

```ts
type SoundSettings = {
  musicEnabled: boolean;
  effectsEnabled: boolean;
  musicVolume: number;
  effectsVolume: number;
};
```

Default: müzik ve efektler açık, volume 0.5.

**SettingsScreen.tsx** - Her toggle/volume değişikliğinde `GameStorage.saveSoundSettings()` çağrılıyor.

**App.tsx** - Başlangıçta `getSoundSettings()` ile okunup SoundManager'a uygulanıyor. Sıralama önemli: önce mute state ve volume set edilmeli, sonra `playGameMusic()` çağrılmalı. `setMusicMuted(false)` çağrıldığında `resumeBackgroundMusic` tetikleniyor ama henüz ses yok, `backgroundSound` null olduğu için bir şey yapmıyor - sorun değil.

## Önceki hata (düzeltildi)

Save `music_state` ve `music_volume` ayrı key'lere yazıyordu, load ise `soundSettings` key'inden okuyordu. Hiçbir zaman eşleşmiyordu. Tek key'e tek JSON objesi olarak birleştirildi.
