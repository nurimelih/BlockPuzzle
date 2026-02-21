import React, {useEffect, useState} from 'react';
import {StyleSheet, View, Dimensions} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {Image, ImageSource} from 'expo-image';
import {Bird} from './Bird';
import {useAppStore} from '../../state/useAppStore';

const BIRDS = [
  {id: 1, startY: 80, size: 6, duration: 25000, delay: 0, flapSpeed: 300},
  {id: 2, startY: 120, size: 8, duration: 20000, delay: 3000, flapSpeed: 250},
  {id: 3, startY: 60, size: 5, duration: 30000, delay: 8000, flapSpeed: 350},
  {id: 4, startY: 140, size: 7, duration: 22000, delay: 12000, flapSpeed: 280},
];

const FALLBACK_BACKGROUNDS: ImageSource[] = [
  require('../../../assets/background.jpg'),
  require('../../../assets/background2.jpg'),
];

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('screen');

// Her 4 level'da bir döngü: 4 köşeye pan, 4. level bitince reveal
const LEVELS_PER_IMAGE = 4;

const BLUR_RADIUS = 10;

// Level pozisyonları (2x2 grid)
const LEVEL_POSITIONS = [
  {x: 0, y: 0},                          // Sol üst
  {x: -SCREEN_WIDTH, y: 0},              // Sağ üst
  {x: -SCREEN_WIDTH, y: -SCREEN_HEIGHT}, // Sağ alt
  {x: 0, y: -SCREEN_HEIGHT},             // Sol alt
];

export default function BackgroundImage() {
  const currentScreen = useAppStore(state => state.currentScreen);
  const currentLevel = useAppStore(state => state.currentLevel);
  const isRevealing = useAppStore(state => state.isBackgroundRevealing);
  const remoteBackgroundUrls = useAppStore(state => state.remoteBackgroundUrls);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const imageWidth = useSharedValue(SCREEN_WIDTH * 2);
  const imageHeight = useSharedValue(SCREEN_HEIGHT * 2);

  const [blurRadius, setBlurRadius] = useState(BLUR_RADIUS);

  // Remote URLs are prefetched during app init (App.tsx) before being stored,
  // so switching from fallbacks to remote images happens without FOUC.
  const backgrounds: ImageSource[] =
    remoteBackgroundUrls.length > 0
      ? [
          ...FALLBACK_BACKGROUNDS,
          ...remoteBackgroundUrls.map(url => ({uri: url} as ImageSource)),
        ]
      : FALLBACK_BACKGROUNDS;

  const imageIndex = Math.floor(currentLevel / LEVELS_PER_IMAGE) % backgrounds.length;
  const levelInCycle = currentLevel % LEVELS_PER_IMAGE;

  // Reveal animasyonu
  useEffect(() => {
    if (isRevealing) {
      const revealTimingConfig = {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      };

      // Zoom-out: tam ekran
      translateX.value = withTiming(0, revealTimingConfig);
      translateY.value = withTiming(0, revealTimingConfig);
      imageWidth.value = withTiming(SCREEN_WIDTH, revealTimingConfig);
      imageHeight.value = withTiming(SCREEN_HEIGHT, revealTimingConfig);

      // Blur kaldır
      setBlurRadius(0);
    }
  }, [isRevealing, translateX, translateY, imageWidth, imageHeight]);

  // Normal level geçişleri (reveal değilken)
  useEffect(() => {
    if (isRevealing) return;

    const timingConfig = {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    };

    setBlurRadius(BLUR_RADIUS);

    if (currentScreen === 'home') {
      translateX.value = withTiming(0 , timingConfig);
      translateY.value = withTiming(0 , timingConfig);
      imageWidth.value = withTiming(SCREEN_WIDTH, timingConfig);
      imageHeight.value = withTiming(SCREEN_HEIGHT, timingConfig);
    } else if (currentScreen === 'game') {
      // Pan - köşelere git, resim 2x boyutunda
      const pos = LEVEL_POSITIONS[levelInCycle];
      translateX.value = withTiming(pos.x, timingConfig);
      translateY.value = withTiming(pos.y, timingConfig);
      imageWidth.value = withTiming(SCREEN_WIDTH * 2, timingConfig);
      imageHeight.value = withTiming(SCREEN_HEIGHT * 2, timingConfig);
    }
  }, [currentScreen, currentLevel, isRevealing, levelInCycle, translateX, translateY, imageWidth, imageHeight]);

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
        <Image
          style={styles.image}
          source={backgrounds[imageIndex]}
          contentFit={'cover'}
          blurRadius={blurRadius}
        />
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
  },
});
