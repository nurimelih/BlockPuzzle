# AAB'den Android Emülatöre Kurulum

## Ön Koşullar (bir kez)

```bash
brew install bundletool
```

`adb` bulunamıyorsa PATH'e ekle:

```bash
echo 'export PATH="$PATH:$HOME/Library/Android/sdk/platform-tools"' >> ~/.zshrc && source ~/.zshrc
```

Bu Android Studio'nun SDK'sındaki `adb`'yi terminalde erişilebilir yapar. Farklı bir bilgisayarda SDK farklı yere kuruluysa `~/Library/Android/sdk` kısmını güncelle. Kontrol için: `which adb` veya `adb devices`.

## Adımlar

### 1. AAB'den universal APK oluştur

```bash
bundletool build-apks \
  --bundle=~/Downloads/app-release2.aab \
  --output=~/Downloads/app-release2.apks \
  --mode=universal
```

### 2. APK'yı çıkar

```bash
unzip -o ~/Downloads/app-release2.apks -d ~/Downloads/app-release2-extracted
```

### 3. Emülatörün çalıştığını doğrula

```bash
adb devices
```

Listede emülatör görünmüyorsa Android Studio'dan başlat.

### 4. Emülatöre yükle

```bash
adb install -r ~/Downloads/app-release2-extracted/universal.apk
```

### 5. Temizlik (opsiyonel)

```bash
rm ~/Downloads/app-release2.apks
rm -rf ~/Downloads/app-release2-extracted
```

## Tek Satırda (kopyala yapıştır)

```bash
export ADB="${HOME}/Library/Android/sdk/platform-tools/adb" && rm -f ~/Downloads/app-release2.apks && rm -rf ~/Downloads/app-release2-extracted && bundletool build-apks --bundle=~/Downloads/app-release2.aab --output=~/Downloads/app-release2.apks --mode=universal && unzip -o ~/Downloads/app-release2.apks -d ~/Downloads/app-release2-extracted && $ADB install -r ~/Downloads/app-release2-extracted/universal.apk
```

PATH'e zaten eklediysen `$ADB` yerine direkt `adb` çalışır.

## Notlar

- `--mode=universal` tek APK üretir, cihaz/ABI split'leriyle uğraşmazsın
- Signing hatası alırsan `--ks`, `--ks-key-alias`, `--ks-pass` flag'leri gerekebilir
- Dosya adı değişirse komutlardaki `app-release2` kısmını güncelle
- `adb: not found` hatası alırsan ön koşullardaki PATH komutunu çalıştır

## Logları görmek için

```bash
adb logcat -s "ReactNativeJS:*" "AndroidRuntime:*"
```

zsh'de tırnak şart, yoksa `*` wildcard olarak algılanıp `no matches found` hatası verir.
