import React, {useEffect} from 'react';
import {Image, StyleSheet, View, Dimensions} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {Bird} from './Bird';
import {useAppStore} from '../../state/useAppStore';

const BIRDS = [
  {id: 1, startY: 80, size: 6, duration: 25000, delay: 0, flapSpeed: 300},
  {id: 2, startY: 120, size: 8, duration: 20000, delay: 3000, flapSpeed: 250},
  {id: 3, startY: 60, size: 5, duration: 30000, delay: 8000, flapSpeed: 350},
  {id: 4, startY: 140, size: 7, duration: 22000, delay: 12000, flapSpeed: 280},
];

// Background resimleri - yeni resim eklemek için buraya ekle
const BACKGROUNDS = [
  require('../../../assets/background.jpg'),
  require('../../../assets/background2.jpg'),
];

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('screen');

// Her 5 level'da bir döngü: 4 pan (köşeler) + 1 zoom out (tam resim)
const LEVELS_PER_IMAGE = 5;

// Level pozisyonları (2x2 grid) - ilk 4 level için
const LEVEL_POSITIONS = [
  {x: 0, y: 0},                          // Sol üst
  {x: -SCREEN_WIDTH, y: 0},              // Sağ üst
  {x: -SCREEN_WIDTH, y: -SCREEN_HEIGHT}, // Sağ alt
  {x: 0, y: -SCREEN_HEIGHT},             // Sol alt
];

export default function BackgroundImage() {
  const currentScreen = useAppStore(state => state.currentScreen);
  const currentLevel = useAppStore(state => state.currentLevel);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const imageWidth = useSharedValue(SCREEN_WIDTH * 2);
  const imageHeight = useSharedValue(SCREEN_HEIGHT * 2);

  // Hangi resim ve hangi pozisyon/zoom durumu
  const imageIndex = Math.floor(currentLevel / LEVELS_PER_IMAGE) % BACKGROUNDS.length;
  const levelInCycle = currentLevel % LEVELS_PER_IMAGE;
  const isZoomOut = levelInCycle === 4; // 5. level (index 4) zoom out

  useEffect(() => {
    const timingConfig = {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    };

    if (currentScreen === 'home') {
      // Home ekranında resmin orta taraflarına zoom yapılmış halde
      translateX.value = withTiming(-SCREEN_WIDTH / 2, timingConfig);
      translateY.value = withTiming(-SCREEN_WIDTH / 2, timingConfig);
      imageWidth.value = withTiming(SCREEN_WIDTH * 2, timingConfig);
      imageHeight.value = withTiming(SCREEN_HEIGHT * 2, timingConfig);
    } else if (currentScreen === 'game') {
      if (isZoomOut) {
        // Zoom out - tam resim ekrana sığsın
        translateX.value = withTiming(0, timingConfig);
        translateY.value = withTiming(0, timingConfig);
        imageWidth.value = withTiming(SCREEN_WIDTH, timingConfig);
        imageHeight.value = withTiming(SCREEN_HEIGHT, timingConfig);
      } else {
        // Pan - köşelere git, resim 2x boyutunda
        const pos = LEVEL_POSITIONS[levelInCycle];
        translateX.value = withTiming(pos.x, timingConfig);
        translateY.value = withTiming(pos.y, timingConfig);
        imageWidth.value = withTiming(SCREEN_WIDTH * 2, timingConfig);
        imageHeight.value = withTiming(SCREEN_HEIGHT * 2, timingConfig);
      }
    }
  }, [currentScreen, currentLevel, isZoomOut, levelInCycle, translateX, translateY, imageWidth, imageHeight]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: imageWidth.value,
    height: imageHeight.value,
    transform: [
      {translateX: translateX.value},
      {translateY: translateY.value},
    ],
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.imageWrapper, animatedStyle]}>
        <Image style={styles.image} source={BACKGROUNDS[imageIndex]} />
      </Animated.View>
      {BIRDS.map(bird => (
        <Bird
          key={bird.id}
          startY={bird.startY}
          size={bird.size}
          duration={bird.duration}
          delay={bird.delay}
          flapSpeed={bird.flapSpeed}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  imageWrapper: {
    // width ve height animatedStyle'dan gelecek
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
