import React, { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Bird } from './Bird.tsx';
import { useAppStore } from '../../state/useAppStore.ts';
import { useStopPostcard } from '../../state/useStopPostcard.ts';
import { getQuadrantForLevel, getStopIndex } from '../../core/journey.ts';

const BIRDS = [
  { id: 1, startY: 80, size: 6, duration: 25000, delay: 0, flapSpeed: 300 },
  { id: 2, startY: 120, size: 8, duration: 20000, delay: 3000, flapSpeed: 250 },
  { id: 3, startY: 60, size: 5, duration: 30000, delay: 8000, flapSpeed: 350 },
  { id: 4, startY: 140, size: 7, duration: 22000, delay: 12000, flapSpeed: 280 },
];

// Oyunda resim ekranın 2 katı; her level o durağın bir çeyreğine kayar
const GAME_IMAGE_SCALE = 2;
const PAN_DURATION_MS = 600;
const IMAGE_TRANSITION_MS = 500;
// Menülerde bulanık arka plan butonları okunur tutar; oyunda resim net görünür.
// Tahta okunurluğu sorun olursa GAME_BLUR_RADIUS'u artır.
const MENU_BLUR_RADIUS = 10;
const GAME_BLUR_RADIUS = 0;

/**
 * Tüm ekranların arkasında o anki durağın kartpostalı.
 * Menülerde tam ve bulanık, oyunda (daily hariç) oynanan level'ın çeyreği filtresiz.
 */
export const JourneyBackground: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const currentScreen = useAppStore(state => state.currentScreen);
  const currentLevel = useAppStore(state => state.currentLevel);
  const isDailyGame = useAppStore(state => state.isDailyGame);
  const { postcard } = useStopPostcard(getStopIndex(currentLevel));

  const isPanned = currentScreen === 'game' && !isDailyGame;
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const imageWidth = useSharedValue(width);
  const imageHeight = useSharedValue(height);

  useEffect(() => {
    const config = { duration: PAN_DURATION_MS, easing: Easing.out(Easing.cubic) };
    const scale = isPanned ? GAME_IMAGE_SCALE : 1;
    const { col, row } = isPanned ? getQuadrantForLevel(currentLevel) : { col: 0, row: 0 };

    translateX.value = withTiming(-col * width, config);
    translateY.value = withTiming(-row * height, config);
    imageWidth.value = withTiming(width * scale, config);
    imageHeight.value = withTiming(height * scale, config);
  }, [isPanned, currentLevel, width, height, translateX, translateY, imageWidth, imageHeight]);

  const imageStyle = useAnimatedStyle(() => ({
    width: imageWidth.value,
    height: imageHeight.value,
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={imageStyle}>
        <Image
          source={postcard.source}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          blurRadius={isPanned ? GAME_BLUR_RADIUS : MENU_BLUR_RADIUS}
          transition={IMAGE_TRANSITION_MS}
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
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
});
